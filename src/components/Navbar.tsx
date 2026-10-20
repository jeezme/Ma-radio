import React from 'react';
import {
  Radio,
  Search,
  SlidersHorizontal,
  Smartphone,
  Eye,
  EyeOff,
  Star,
  Sparkles,
} from 'lucide-react';
import type { RadioCategory } from '../types/radio.ts';
import { PWAInstallButton } from './PWAInstallButton.tsx';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: RadioCategory;
  onSelectCategory: (category: RadioCategory) => void;
  favoritesCount: number;
  onOpenAdvancedSearch: () => void;
  onOpenAndroidTips: () => void;
  onOpenAboutStreams?: () => void;
  wakeLockActive: boolean;
  onToggleWakeLock: () => void;
}

const CATEGORIES: { id: RadioCategory; label: string; icon?: React.ReactNode }[] = [
  { id: 'all', label: 'Toutes les radios' },
  { id: 'favorites', label: 'Favoris' },
  { id: 'france', label: 'France' },
  { id: 'news', label: 'Info & Talk' },
  { id: 'jazz', label: 'Jazz & Blues' },
  { id: 'classical', label: 'Classique' },
  { id: 'electro', label: 'Électro & Chill' },
  { id: 'rock', label: 'Rock' },
  { id: 'world', label: 'Monde' },
];

export const Navbar: React.FC<NavbarProps> = (props) => {
  const {
    searchQuery = '',
    onSearchChange = () => {},
    selectedCategory = 'all',
    onSelectCategory = () => {},
    favoritesCount = 0,
    onOpenAdvancedSearch = () => {},
    onOpenAndroidTips = () => {},
    onOpenAboutStreams = () => {},
    wakeLockActive = false,
    onToggleWakeLock = () => {},
  } = props;
  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        {/* Top brand row */}
        <div className="flex items-center justify-between gap-4 mb-3">
          {/* Logo / App Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-violet-600 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
                <Radio className="w-5 h-5 stroke-[2.2]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-xl sm:text-2xl tracking-tight text-white">
                  Ma radio
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                  Live FM & Web
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Vos stations en direct avec écoute en arrière-plan Android
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* About Streams & Ads info button */}
            <button
              onClick={() => (props.onOpenAboutStreams || onOpenAboutStreams)?.()}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              title="D'où viennent les radios et les pubs au lancement ?"
              aria-label="Infos sur les flux et publicités"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="hidden sm:inline">Origine & Pubs</span>
            </button>

            {/* Android background tip button */}
            <button
              onClick={onOpenAndroidTips}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              title="Conseils pour l'écoute en arrière-plan sur Android"
              aria-label="Conseils arrière-plan Android"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Arrière-plan Android</span>
            </button>

            {/* Screen wake lock toggle */}
            <button
              onClick={onToggleWakeLock}
              className={`p-2 rounded-xl transition border text-xs cursor-pointer ${
                wakeLockActive
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
              title={
                wakeLockActive
                  ? "Écran maintenu allumé (cliquez pour désactiver)"
                  : "Garder l'écran allumé (mode réveil / voiture)"
              }
              aria-label="Basculer le maintien de l'écran allumé"
            >
              {wakeLockActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>

            {/* PWA Install Button */}
            <PWAInstallButton />
          </div>
        </div>

        {/* Search Bar + Advanced Search Button */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Rechercher une radio (ex: France Musique, RMC, FIP, Nova, Jazz...)"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/70 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white bg-slate-800 px-1.5 py-0.5 rounded cursor-pointer"
              >
                Effacer
              </button>
            )}
          </div>

          <button
            onClick={onOpenAdvancedSearch}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-sm font-medium flex items-center gap-2 shrink-0 transition cursor-pointer shadow-sm hover:border-amber-500/40"
            aria-label="Ouvrir la recherche avancée"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Recherche avancée</span>
          </button>
        </div>

        {/* Categories / Filters Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : cat.id === 'favorites'
                    ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {cat.id === 'favorites' && (
                  <Star className={`w-3.5 h-3.5 ${isSelected ? 'fill-slate-950' : 'fill-rose-400'}`} />
                )}
                <span>{cat.label}</span>
                {cat.id === 'favorites' && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-rose-500/20 text-rose-300'}`}>
                    {favoritesCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
