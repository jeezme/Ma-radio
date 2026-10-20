import React, { useState, useEffect } from 'react';
import { Moon, X, Clock, Check } from 'lucide-react';
import { calculateSleepRemaining, formatDuration } from '../utils/radioUtils.ts';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sleepTimerEnd: number | null;
  onSetTimerMinutes: (minutes: number | null) => void;
}

const PRESET_MINUTES = [15, 30, 45, 60, 90];

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  isOpen,
  onClose,
  sleepTimerEnd,
  onSetTimerMinutes,
}) => {
  const [customMinutes, setCustomMinutes] = useState('');
  const [remainingSecs, setRemainingSecs] = useState(0);

  useEffect(() => {
    if (!sleepTimerEnd) {
      setRemainingSecs(0);
      return;
    }

    const update = () => {
      setRemainingSecs(calculateSleepRemaining(sleepTimerEnd, Date.now()));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [sleepTimerEnd]);

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customMinutes, 10);
    if (!isNaN(val) && val > 0 && val <= 480) {
      onSetTimerMinutes(val);
      setCustomMinutes('');
      onClose();
    }
  };

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
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Moon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Minuteur de sommeil</h2>
            <p className="text-xs text-slate-400">Arrête la radio automatiquement pour s'endormir</p>
          </div>
        </div>

        {/* Current status if active */}
        {sleepTimerEnd && remainingSecs > 0 && (
          <div className="mb-5 p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-indigo-400 animate-pulse" />
              <div>
                <span className="text-xs text-indigo-200">Arrêt programmé dans</span>
                <div className="font-mono text-base font-bold text-indigo-300">
                  {formatDuration(remainingSecs)}
                </div>
              </div>
            </div>
            <button
              onClick={() => onSetTimerMinutes(null)}
              className="px-3 py-1 text-xs rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-medium border border-rose-500/30 transition cursor-pointer"
            >
              Annuler
            </button>
          </div>
        )}

        {/* Presets */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {PRESET_MINUTES.map((min) => (
            <button
              key={min}
              onClick={() => {
                onSetTimerMinutes(min);
                onClose();
              }}
              className="py-3 px-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600/30 border border-slate-700/60 hover:border-indigo-500/50 text-center transition flex flex-col items-center gap-1 cursor-pointer group"
            >
              <span className="text-base font-bold text-white group-hover:text-indigo-300">
                {min} min
              </span>
              <span className="text-[10px] text-slate-400">veille auto</span>
            </button>
          ))}
        </div>

        {/* Custom Input */}
        <form onSubmit={handleCustomSubmit} className="flex gap-2 mb-4">
          <input
            type="number"
            min="1"
            max="480"
            placeholder="Durée personnalisée (min)"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!customMinutes}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-medium text-sm transition cursor-pointer"
          >
            Définir
          </button>
        </form>

        <div className="text-right">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
