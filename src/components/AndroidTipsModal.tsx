import React from 'react';
import { Smartphone, X, CheckCircle2, Battery, Bell, Cast } from 'lucide-react';

interface AndroidTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidTipsModal: React.FC<AndroidTipsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Lecture en arrière-plan sur Android</h2>
            <p className="text-xs text-slate-400">Écoutez vos radios l'écran éteint ou dans une autre application</p>
          </div>
        </div>

        <div className="space-y-4 mb-6 text-sm text-slate-300">
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-100">Contrôles sur l'écran de verrouillage</div>
              <p className="text-xs text-slate-400 mt-1">
                Grâce à l'API MediaSession intégrée, vous pouvez mettre en pause, reprendre et changer de station directement depuis la barre de notifications Android et l'écran de verrouillage.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-start gap-3">
            <Battery className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-100">Optimisation de batterie Android</div>
              <p className="text-xs text-slate-400 mt-1">
                Certains fabricants (Samsung, Xiaomi, Huawei) coupent les flux web en arrière-plan après quelques minutes. Si la musique s'arrête :
                <br />
                <span className="font-medium text-slate-300">Paramètres Android &gt; Applications &gt; Chrome/Navigateur &gt; Batterie &gt; Non restreinte</span>.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-start gap-3">
            <Cast className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-100">Installation comme application native (PWA)</div>
              <p className="text-xs text-slate-400 mt-1">
                Cliquez sur le bouton <strong>"Installer l'app"</strong> en haut pour avoir l'icône Ma radio sur votre écran d'accueil sans barre d'adresse de navigateur.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition cursor-pointer"
        >
          Super, j'ai compris !
        </button>
      </div>
    </div>
  );
};
