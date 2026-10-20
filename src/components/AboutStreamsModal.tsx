import React from 'react';
import { Radio, X, ShieldCheck, CheckCircle2, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';

interface AboutStreamsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchRmcStream?: () => void;
}

export const AboutStreamsModal: React.FC<AboutStreamsModalProps> = ({
  isOpen,
  onClose,
  onSwitchRmcStream,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 p-6 shadow-2xl relative text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Origine des flux & Publicités</h2>
            <p className="text-xs text-slate-400">Comprendre d'où viennent les radios et les pubs de démarrage</p>
          </div>
        </div>

        <div className="space-y-4 mb-6 text-sm text-slate-300">
          {/* Section 1: Origine */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/50">
            <div className="flex items-center gap-2 font-semibold text-slate-100 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>D'où viennent les radios ?</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Les flux proviennent directement des serveurs de diffusion officiels (CDN Icecast, Revma, Infomaniak) des groupes audiovisuels (Radio France pour France Musique et FIP, Altice pour RMC, Combat Media pour Radio Nova, etc.) et de l'annuaire mondial ouvert Radio-Browser.
            </p>
          </div>

          {/* Section 2: Pourquoi une pub ? */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="flex items-center gap-2 font-semibold text-amber-300 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Pourquoi une pub se déclenche à chaque lecture ?</span>
            </div>
            <p className="text-xs text-amber-200/90 leading-relaxed mb-2">
              <strong>L'application Ma radio n'ajoute AUCUNE publicité</strong> (zéro pub, zéro bandeau publicitaire).
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              La publicité audio (spot "pre-roll" de 15 à 30 secondes) que vous entendez au lancement est <strong>injectée directement par la régie de la radio commerciale</strong> (comme RMC, RTL ou Skyrock via leurs serveurs de streaming AdsWizz / AIS / Triton) dès qu'un internaute se connecte à leur flux web.
            </p>
          </div>

          {/* Section 3: Radios sans pub */}
          <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/50">
            <div className="flex items-center gap-2 font-semibold text-slate-100 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Les radios garanties SANS pub au lancement :</span>
            </div>
            <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4 mt-2">
              <li><strong className="text-slate-200">France Musique</strong> (Service public Radio France)</li>
              <li><strong className="text-slate-200">FIP</strong> (sans aucune interruption pub, programmation éclectique)</li>
              <li><strong className="text-slate-200">RFI</strong> (Radio France Internationale)</li>
              <li><strong className="text-slate-200">France Inter & France Culture</strong></li>
              <li><strong className="text-slate-200">Radio Nova</strong> (flux direct Infomaniak)</li>
              <li><strong className="text-slate-200">Radio Swiss Jazz & SomaFM</strong> (webradios sans pub commerciale)</li>
            </ul>
          </div>

          {/* Solution mise en place */}
          <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200">
            <div className="font-semibold text-emerald-300 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Ce que nous avons fait pour RMC :</span>
            </div>
            <p className="leading-relaxed">
              Nous avons configuré pour RMC un flux de relais direct (serveur Revma) qui évite l'injection systématique du pré-roll publicitaire d'Altice Media.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition cursor-pointer"
        >
          Fermer
        </button>
      </div>
    </div>
  );
};
