import { useState, useRef, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
import type { RadioStation, EqualizerPreset } from '../types/radio.ts';

export const EQUALIZER_PRESETS: EqualizerPreset[] = [
  { name: 'Normal', bass: 0, mid: 0, treble: 0 },
  { name: 'Bass Boost', bass: 7, mid: 1, treble: -1 },
  { name: 'Voix & Débats', bass: -3, mid: 6, treble: 2 },
  { name: 'Jazz & Acoustique', bass: 3, mid: 2, treble: 4 },
  { name: 'Électronique', bass: 6, mid: 0, treble: 5 },
  { name: 'Classique & Orchestre', bass: 2, mid: 1, treble: 4 },
];

export interface AudioPlayerState {
  currentStation: RadioStation | null;
  isPlaying: boolean;
  isLoading: boolean;
  volume: number; // 0 to 1
  isMuted: boolean;
  error: string | null;
  durationListened: number;
  sleepTimerEnd: number | null; // timestamp ms
  equalizer: EqualizerPreset;
  volumeBoost: boolean;
  wakeLockActive: boolean;
}

export function useAudioPlayer(stationsList: RadioStation[]) {
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [durationListened, setDurationListened] = useState(0);
  const [sleepTimerEnd, setSleepTimerEnd] = useState<number | null>(null);
  const [equalizer, setEqualizer] = useState<EqualizerPreset>(EQUALIZER_PRESETS[0]);
  const [volumeBoost, setVolumeBoost] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const wakeLockRef = useRef<any>(null);

  // Web Audio EQ nodes
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const midFilterRef = useRef<BiquadFilterNode | null>(null);
  const trebleFilterRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);

  // Initialize Audio element once
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    (audio as any).playsInline = true;
    audioRef.current = audio;

    const onPlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setError(null);
    };

    const onPause = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };

    const onWaiting = () => {
      setIsLoading(true);
    };

    const onPlaying = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };

    const onError = () => {
      setIsLoading(false);
      setIsPlaying(false);
      const code = audio.error?.code;
      if (code === 4) {
        setError('Flux temporairement indisponible ou format non supporté.');
      } else {
        setError('Impossible de lire ce flux radio. Réessayez ou choisissez une autre station.');
      }
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('error', onError);
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volumeBoost ? 1.4 : 1.0;
    }
  }, [volume, isMuted, volumeBoost]);

  // Track listening duration
  useEffect(() => {
    if (isPlaying) {
      timerIntervalRef.current = window.setInterval(() => {
        setDurationListened((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isPlaying]);

  // Sleep Timer countdown & handling
  useEffect(() => {
    if (!sleepTimerEnd) return;

    const interval = window.setInterval(() => {
      const now = Date.now();
      if (now >= sleepTimerEnd) {
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setIsPlaying(false);
        setSleepTimerEnd(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerEnd]);

  // Play a specific station
  const playStation = useCallback(async (station: RadioStation) => {
    if (!audioRef.current) return;
    setError(null);
    setCurrentStation(station);
    setIsLoading(true);
    setDurationListened(0);

    const streamUrl = station.urlResolved || station.url;
    const isHls = streamUrl.includes('.m3u8');

    // Clean up previous HLS instance if any
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(audioRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, async () => {
        try {
          await audioRef.current?.play();
          setIsPlaying(true);
          setIsLoading(false);
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            setIsLoading(false);
            setIsPlaying(false);
            setError('Cliquez sur Lecture pour démarrer la radio.');
          }
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              hlsRef.current = null;
              // Fallback to alternative URL if provided
              if (station.alternativeUrls && station.alternativeUrls.length > 0) {
                const fallbackUrl = station.alternativeUrls[0];
                if (audioRef.current) {
                  audioRef.current.src = fallbackUrl;
                  audioRef.current.load();
                  audioRef.current.play().catch(() => {});
                }
              } else {
                setIsLoading(false);
                setIsPlaying(false);
                setError('Flux temporairement indisponible.');
              }
              break;
          }
        }
      });

      hlsRef.current = hls;
    } else {
      audioRef.current.src = streamUrl;
      audioRef.current.load();

      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setIsLoading(false);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setIsLoading(false);
          setIsPlaying(false);
          setError('Le navigateur a bloqué la lecture automatique. Cliquez sur Lecture.');
        }
      }
    }
  }, []);

  // Toggle Play / Pause
  const togglePlay = useCallback(async () => {
    if (!audioRef.current || !currentStation) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      setError(null);
      setIsLoading(true);
      try {
        await audioRef.current.play();
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setIsLoading(false);
          setIsPlaying(false);
          setError('Erreur lors du démarrage du flux.');
        }
      }
    }
  }, [isPlaying, currentStation]);

  // Next station in list
  const playNext = useCallback(() => {
    if (!currentStation || stationsList.length === 0) return;
    const currentIndex = stationsList.findIndex((s) => s.id === currentStation.id);
    const nextIndex = (currentIndex + 1) % stationsList.length;
    playStation(stationsList[nextIndex]);
  }, [currentStation, stationsList, playStation]);

  // Previous station in list
  const playPrevious = useCallback(() => {
    if (!currentStation || stationsList.length === 0) return;
    const currentIndex = stationsList.findIndex((s) => s.id === currentStation.id);
    const prevIndex = (currentIndex - 1 + stationsList.length) % stationsList.length;
    playStation(stationsList[prevIndex]);
  }, [currentStation, stationsList, playStation]);

  // Android MediaSession integration (Android background audio & lock screen control!)
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentStation) return;

    const iconUrl = currentStation.favicon || '/pwa-512x512.png';

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentStation.name,
      artist: currentStation.tags?.[0] ? `Ma radio • ${currentStation.tags[0]}` : 'Ma radio • En direct',
      album: currentStation.country ? `${currentStation.country} • Web Radio` : 'Ma radio FM',
      artwork: [
        { src: iconUrl, sizes: '96x96', type: 'image/png' },
        { src: iconUrl, sizes: '192x192', type: 'image/png' },
        { src: iconUrl, sizes: '512x512', type: 'image/png' },
      ],
    });

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    navigator.mediaSession.setActionHandler('play', () => {
      audioRef.current?.play();
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      audioRef.current?.pause();
    });

    navigator.mediaSession.setActionHandler('stop', () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      setIsPlaying(false);
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      playPrevious();
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      playNext();
    });

    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('stop', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
      }
    };
  }, [currentStation, isPlaying, playNext, playPrevious]);

  // Toggle Screen Wake Lock
  const toggleWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      if (wakeLockActive && wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        setWakeLockActive(false);
      } else {
        const lock = await (navigator as any).wakeLock.request('screen');
        wakeLockRef.current = lock;
        setWakeLockActive(true);
        lock.addEventListener('release', () => {
          setWakeLockActive(false);
          wakeLockRef.current = null;
        });
      }
    } catch {
      setWakeLockActive(false);
    }
  }, [wakeLockActive]);

  // Sleep timer setter helper
  const setSleepTimerMinutes = useCallback((minutes: number | null) => {
    if (!minutes || minutes <= 0) {
      setSleepTimerEnd(null);
    } else {
      setSleepTimerEnd(Date.now() + minutes * 60 * 1000);
    }
  }, []);

  return {
    currentStation,
    isPlaying,
    isLoading,
    volume,
    isMuted,
    error,
    durationListened,
    sleepTimerEnd,
    equalizer,
    volumeBoost,
    wakeLockActive,
    setVolume,
    setIsMuted,
    setEqualizer,
    setVolumeBoost,
    playStation,
    togglePlay,
    playNext,
    playPrevious,
    toggleWakeLock,
    setSleepTimerMinutes,
  };
}
