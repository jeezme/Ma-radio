import React from 'react';
import { Sliders, X, Zap, Volume2 } from 'lucide-react';
import type { EqualizerPreset } from '../types/radio.ts';
import { EQUALIZER_PRESETS } from '../hooks/useAudioPlayer.ts';

interface EqualizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePreset: EqualizerPreset;
  onSelectPreset: (preset: EqualizerPreset) => void;
  volumeBoost: boolean;
  onToggleBoost: () => void;
}

export const EqualizerModal: React.FC<EqualizerModalProps> = ({
  isOpen,
  onClose,
  activePreset,
  onSelectPreset,
  volumeBoost,
  onToggleBoost,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Égaliseur & Effets Audio</h2>
            <p className="text-xs text-slate-400">Optimisez le rendu acoustique pour vos écouteurs ou enceintes</p>
          </div>
        </div>

        {/* Volume Booster option */}
        <div className="mb-6 p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${volumeBoost ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-400'}`}>
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <div className="font-semibold text-sm text-slate-200">Suramplification (+40%)</div>
              <div className="text-xs text-slate-400">Utile pour les radios au signal faible</div>
            </div>
          </div>
          <button
            onClick={onToggleBoost}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              volumeBoost
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {volumeBoost ? 'Activé' : 'Désactivé'}
          </button>
        </div>

        {/* Presets List */}
        <div className="mb-6">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-3">
            Profils sonores
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {EQUALIZER_PRESETS.map((preset) => {
              const isSelected = activePreset.name === preset.name;
              return (
                <button
                  key={preset.name}
                  onClick={() => onSelectPreset(preset)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 text-slate-300'
                  }`}
                >
                  <span className="font-semibold text-sm block mb-1">{preset.name}</span>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span>B:{preset.bass > 0 ? `+${preset.bass}` : preset.bass}</span>
                    <span>M:{preset.mid > 0 ? `+${preset.mid}` : preset.mid}</span>
                    <span>A:{preset.treble > 0 ? `+${preset.treble}` : preset.treble}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition cursor-pointer"
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
};
