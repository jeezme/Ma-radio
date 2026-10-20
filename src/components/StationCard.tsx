import React, { useState } from 'react';
import { Play, Pause, Heart, Radio, Sparkles } from 'lucide-react';
import type { RadioStation } from '../types/radio.ts';
import { getStationInitials } from '../utils/radioUtils.ts';
import { AudioVisualizer } from './AudioVisualizer.tsx';

interface StationCardProps {
  station: RadioStation;
  isPlaying: boolean;
  isActive: boolean;
  isLoading: boolean;
  isFavorite: boolean;
  onTogglePlay: (station: RadioStation) => void;
  onToggleFavorite: (stationId: string) => void;
}

export const StationCard: React.FC<StationCardProps> = ({
  station,
  isPlaying,
  isActive,
  isLoading,
  isFavorite,
  onTogglePlay,
  onToggleFavorite,
}) => {
  const [imgError, setImgError] = useState(false);
  const initials = getStationInitials(station.name);

  return (
    <div
      className={`group relative rounded-2xl p-4 transition-all duration-300 border flex flex-col justify-between ${
        isActive
          ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-amber-500/50 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
          : 'bg-slate-900/70 hover:bg-slate-800/80 border-slate-800/80 hover:border-slate-700 shadow-sm'
      }`}
    >
      <div>
        {/* Top Header: Logo + Favorite Button */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="relative">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden border shadow-inner ${
                isActive
                  ? 'border-amber-400 bg-amber-500/10 shadow-amber-500/20'
                  : 'border-slate-700/60 bg-slate-800'
              }`}
            >
              {station.favicon && !imgError ? (
                <img
                  src={station.favicon}
                  alt={station.name}
                  loading="lazy"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover p-1.5 rounded-xl"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-amber-400 font-bold text-sm tracking-wider">
                  <span>{initials}</span>
                </div>
              )}
            </div>

            {/* Live Indicator on Logo when active */}
            {isActive && (
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-slate-900"></span>
              </span>
            )}
          </div>

          {/* Action: Favorite toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(station.id);
            }}
            aria-label={isFavorite ? `Retirer ${station.name} des favoris` : `Ajouter ${station.name} aux favoris`}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isFavorite
                ? 'text-rose-500 hover:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20'
                : 'text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/60'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 stroke-rose-500' : ''}`} />
          </button>
        </div>

        {/* Station Name & Info */}
        <div className="mb-2">
          <h3
            className={`font-semibold text-base line-clamp-1 transition-colors ${
              isActive ? 'text-amber-400' : 'text-slate-100 group-hover:text-white'
            }`}
            title={station.name}
          >
            {station.name}
          </h3>

          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span>{station.country || 'International'}</span>
            {station.bitrate ? (
              <>
                <span>•</span>
                <span className="font-mono text-[11px] text-slate-400">{station.bitrate} kbps</span>
              </>
            ) : null}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {(station.tags || []).slice(0, 3).map((tag, idx) => (
            <span
              key={idx}
              className="inline-block px-2 py-0.5 rounded-md bg-slate-800/70 border border-slate-700/50 text-[11px] text-slate-300 font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom control row */}
      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between mt-auto">
        {/* Visualizer when playing or LIVE badge */}
        <div>
          {isActive && isPlaying ? (
            <div className="flex items-center gap-1.5">
              <AudioVisualizer isPlaying={true} barCount={8} height={14} colorScheme="amber" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 animate-pulse">
                Direct
              </span>
            </div>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
              <Radio className="w-3 h-3 text-slate-400" />
              {station.codec || 'MP3'}
            </span>
          )}
        </div>

        {/* Play / Pause button */}
        <button
          onClick={() => onTogglePlay(station)}
          aria-label={isActive && isPlaying ? `Pause ${station.name}` : `Écouter ${station.name}`}
          className={`px-3 py-1.5 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
            isActive && isPlaying
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-amber-500/25'
              : isActive && isLoading
              ? 'bg-slate-700 text-slate-300 animate-pulse'
              : 'bg-slate-800 hover:bg-amber-500 text-slate-200 hover:text-slate-950 hover:font-bold'
          }`}
        >
          {isActive && isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause</span>
            </>
          ) : isActive && isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin"></span>
              <span>Connexion...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Écouter</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
