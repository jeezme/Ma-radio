import React, { useState } from 'react';
import {
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Moon,
  Sliders,
  Radio,
  Zap,
} from 'lucide-react';
import type { RadioStation } from '../types/radio.ts';
import { getStationInitials, formatDuration } from '../utils/radioUtils.ts';
import { AudioVisualizer } from './AudioVisualizer.tsx';

interface FullscreenPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  station: RadioStation;
  isPlaying: boolean;
  isLoading: boolean;
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
}

export const FullscreenPlayerModal: React.FC<FullscreenPlayerModalProps> = ({
  isOpen,
  onClose,
  station,
  isPlaying,
  isLoading,
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
}) => {
  const [imgError, setImgError] = useState(false);
  const initials = getStationInitials(station.name);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-100 p-6 sm:p-8 animate-in fade-in duration-200">
      {/* Top bar */}
      <div className="flex items-center justify-between max-w-xl mx-auto w-full">
        <button
          onClick={onClose}
          className="p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
          aria-label="Réduire le lecteur"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="text-[11px] font-bold tracking-widest uppercase text-amber-400 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            En direct
          </span>
          <span className="text-xs text-slate-400">{station.country || 'Web Radio'}</span>
        </div>

        <button
          onClick={() => onToggleFavorite(station.id)}
          className={`p-2.5 rounded-full transition cursor-pointer ${
            isFavorite
              ? 'bg-rose-500/20 text-rose-500'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
          }`}
          aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Center Artwork / Vinyl Area */}
      <div className="flex flex-col items-center justify-center my-auto max-w-xl mx-auto w-full">
        <div className="relative mb-6">
          {/* Animated vinyl / glow ring */}
          <div
            className={`w-56 h-56 sm:w-64 sm:h-64 rounded-full p-2 border-2 transition-all duration-700 flex items-center justify-center ${
              isPlaying
                ? 'border-amber-500/40 shadow-2xl shadow-amber-500/20 animate-spin-slow'
                : 'border-slate-800 shadow-lg'
            } bg-slate-900`}
            style={{ animationDuration: isPlaying ? '25s' : 'none' }}
          >
            {/* Center Disc */}
            <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full overflow-hidden border-4 border-slate-900 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center relative shadow-2xl">
              {/* Vinyl grooves styling */}
              <div className="absolute inset-2 rounded-full border border-slate-800/60 pointer-events-none"></div>
              <div className="absolute inset-6 rounded-full border border-slate-800/40 pointer-events-none"></div>
              <div className="absolute inset-10 rounded-full border border-slate-800/30 pointer-events-none"></div>

              {/* Center circular sticker */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-amber-500 via-rose-500 to-indigo-600 p-0.5 shadow-lg flex items-center justify-center relative">
                <div className="w-full h-full bg-slate-950 rounded-full flex flex-col items-center justify-center p-2 text-center">
                  {station.favicon && !imgError ? (
                    <img
                      src={station.favicon}
                      alt={station.name}
                      onError={() => setImgError(true)}
                      className="w-10 h-10 object-contain rounded-md"
                    />
                  ) : (
                    <span className="text-amber-400 font-extrabold text-lg tracking-wider">
                      {initials}
                    </span>
                  )}
                  {/* Central spindle hole */}
                  <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-600 mt-1 shadow-inner"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Station Name & Info */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-1 line-clamp-1">
          {station.name}
        </h1>

        <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
          <span>{station.codec || 'MP3'}</span>
          <span>•</span>
          <span className="font-mono">{station.bitrate || 128} kbps</span>
          <span>•</span>
          <span>Écoute : {formatDuration(durationListened)}</span>
        </div>

        {/* Visualizer bars */}
        <div className="mb-4">
          <AudioVisualizer isPlaying={isPlaying} barCount={32} height={28} colorScheme="amber" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap justify-center gap-1.5 max-w-sm mb-4">
          {(station.tags || []).slice(0, 4).map((tag, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="max-w-xl mx-auto w-full space-y-5">
        {/* Playback action buttons */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={onPrev}
            aria-label="Radio précédente"
            className="p-3 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition active:scale-95 cursor-pointer"
          >
            <SkipBack className="w-6 h-6 fill-current" />
          </button>

          <button
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Pause' : 'Lecture'}
            className="w-16 h-16 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 transition transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            {isLoading ? (
              <span className="w-7 h-7 border-3 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
            ) : isPlaying ? (
              <Pause className="w-7 h-7 fill-current" />
            ) : (
              <Play className="w-7 h-7 fill-current ml-1" />
            )}
          </button>

          <button
            onClick={onNext}
            aria-label="Radio suivante"
            className="p-3 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white transition active:scale-95 cursor-pointer"
          >
            <SkipForward className="w-6 h-6 fill-current" />
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-3 px-4">
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
            className="p-1.5 text-slate-400 hover:text-white transition cursor-pointer"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-5 h-5 text-rose-400" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />

          <span className="font-mono text-xs text-slate-400 w-9 text-right">
            {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
          </span>
        </div>

        {/* Extra Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/70 text-xs text-slate-400">
          <button
            onClick={onOpenSleepTimer}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-800 transition cursor-pointer ${
              sleepTimerEnd ? 'text-indigo-400 bg-indigo-500/10' : ''
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Minuteur {sleepTimerEnd ? 'Actif' : ''}</span>
          </button>

          <button
            onClick={onOpenEqualizer}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-slate-800 transition cursor-pointer ${
              volumeBoost ? 'text-amber-400 bg-amber-500/10' : ''
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Égaliseur {volumeBoost ? 'Boost' : ''}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
