import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Moon,
  Sliders,
  Maximize2,
  AlertCircle,
} from 'lucide-react';
import type { RadioStation } from '../types/radio.ts';
import { getStationInitials, formatDuration, calculateSleepRemaining } from '../utils/radioUtils.ts';
import { AudioVisualizer } from './AudioVisualizer.tsx';

interface AudioPlayerBarProps {
  station: RadioStation | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  volume: number;
  isMuted: boolean;
  isFavorite: boolean;
  durationListened: number;
  sleepTimerEnd: number | null;
  volumeBoost: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleFavorite: (id: string) => void;
  onOpenSleepTimer: () => void;
  onOpenEqualizer: () => void;
  onOpenFullscreen: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  station,
  isPlaying,
  isLoading,
  error,
  volume,
  isMuted,
  isFavorite,
  durationListened,
  sleepTimerEnd,
  volumeBoost,
  onTogglePlay,
  onNext,
  onPrev,
  onVolumeChange,
  onToggleMute,
  onToggleFavorite,
  onOpenSleepTimer,
  onOpenEqualizer,
  onOpenFullscreen,
}) => {
  const [imgError, setImgError] = useState(false);

  if (!station) return null;

  const initials = getStationInitials(station.name);
  const remainingSecs = sleepTimerEnd ? calculateSleepRemaining(sleepTimerEnd, Date.now()) : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 shadow-2xl px-3 sm:px-6 py-2.5 sm:py-3 transition-all">
      {/* Error notification banner if stream error */}
      {error && (
        <div className="max-w-7xl mx-auto mb-2 px-3 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={onTogglePlay}
            className="underline font-semibold hover:text-white cursor-pointer ml-2"
          >
            Réessayer
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Station info */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 sm:max-w-xs">
          <button
            onClick={onOpenFullscreen}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-800 border border-slate-700/80 overflow-hidden shrink-0 flex items-center justify-center cursor-pointer group relative shadow-md"
            title="Agrandir le lecteur"
          >
            {station.favicon && !imgError ? (
              <img
                src={station.favicon}
                alt={station.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover p-1 group-hover:scale-105 transition"
              />
            ) : (
              <span className="text-amber-400 font-bold text-xs">{initials}</span>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
              <Maximize2 className="w-4 h-4 text-white" />
            </div>
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h4
                onClick={onOpenFullscreen}
                className="font-bold text-sm text-slate-100 truncate cursor-pointer hover:text-amber-400 transition"
                title={station.name}
              >
                {station.name}
              </h4>
              <button
                onClick={() => onToggleFavorite(station.id)}
                className={`p-1 transition cursor-pointer shrink-0 ${
                  isFavorite ? 'text-rose-500' : 'text-slate-500 hover:text-slate-300'
                }`}
                title={isFavorite ? 'Retirer des favoris' : 'Favori'}
                aria-label={isFavorite ? 'Retirer des favoris' : 'Favori'}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-semibold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Direct
              </span>
              <span>•</span>
              <span className="font-mono text-slate-400">{formatDuration(durationListened)}</span>
            </div>
          </div>
        </div>

        {/* Center: Controls & Visualizer */}
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={onPrev}
              aria-label="Station précédente"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition cursor-pointer"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </button>

            <button
              onClick={onTogglePlay}
              aria-label={isPlaying ? 'Pause' : 'Lecture'}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/25 transition transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
              ) : isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={onNext}
              aria-label="Station suivante"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition cursor-pointer"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </button>
          </div>

          <div className="hidden sm:block">
            <AudioVisualizer isPlaying={isPlaying} barCount={16} height={12} colorScheme="amber" />
          </div>
        </div>

        {/* Right: Tools & Volume */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Sleep timer button */}
          <button
            onClick={onOpenSleepTimer}
            aria-label="Minuteur de sommeil"
            className={`p-2 rounded-xl transition cursor-pointer ${
              sleepTimerEnd
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={sleepTimerEnd ? `Arrêt dans ${formatDuration(remainingSecs)}` : 'Minuteur'}
          >
            <Moon className="w-4 h-4" />
          </button>

          {/* Equalizer button */}
          <button
            onClick={onOpenEqualizer}
            aria-label="Égaliseur et boost audio"
            className={`p-2 rounded-xl transition cursor-pointer ${
              volumeBoost
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Égaliseur"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Volume slider (desktop) */}
          <div className="hidden md:flex items-center gap-2 w-28 lg:w-32">
            <button
              onClick={onToggleMute}
              aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
              className="text-slate-400 hover:text-white p-1 transition cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-amber-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
              aria-label="Volume audio"
            />
          </div>

          {/* Maximize to full screen */}
          <button
            onClick={onOpenFullscreen}
            aria-label="Plein écran"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            title="Mode plein écran"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
