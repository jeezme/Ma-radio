import React, { useState, useEffect, useMemo } from 'react';
import {
  CURATED_STATIONS,
  DEFAULT_FAVORITE_IDS,
} from './data/defaultStations.ts';
import type { RadioStation, RadioCategory } from './types/radio.ts';
import {
  FAVORITES_STORAGE_KEY,
  CUSTOM_STATIONS_KEY,
  getInitialFavorites,
  filterStations,
  getStationInitials,
} from './utils/radioUtils.ts';
import { useAudioPlayer } from './hooks/useAudioPlayer.ts';
import { Navbar } from './components/Navbar.tsx';
import { StationCard } from './components/StationCard.tsx';
import { AudioPlayerBar } from './components/AudioPlayerBar.tsx';
import { FullscreenPlayerModal } from './components/FullscreenPlayerModal.tsx';
import { AdvancedSearchModal } from './components/AdvancedSearchModal.tsx';
import { SleepTimerModal } from './components/SleepTimerModal.tsx';
import { EqualizerModal } from './components/EqualizerModal.tsx';
import { AndroidTipsModal } from './components/AndroidTipsModal.tsx';
import { AboutStreamsModal } from './components/AboutStreamsModal.tsx';
import { Star, Sparkles, Volume2, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  // Favorites persistence
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    return getInitialFavorites(localStorage.getItem(FAVORITES_STORAGE_KEY));
  });

  // Custom added stations persistence
  const [customStations, setCustomStations] = useState<RadioStation[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_STATIONS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Combine curated + custom stations
  const allStations = useMemo(() => {
    return [...customStations, ...CURATED_STATIONS];
  }, [customStations]);

  // Audio player hook
  const {
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
  } = useAudioPlayer(allStations);

  // Search & Navigation state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RadioCategory>('all');

  // Modals state
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isFullscreenPlayerOpen, setIsFullscreenPlayerOpen] = useState(false);
  const [isSleepTimerOpen, setIsSleepTimerOpen] = useState(false);
  const [isEqualizerOpen, setIsEqualizerOpen] = useState(false);
  const [isAndroidTipsOpen, setIsAndroidTipsOpen] = useState(false);
  const [isAboutStreamsOpen, setIsAboutStreamsOpen] = useState(false);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch {
      // storage error
    }
  }, [favoriteIds]);

  // Save custom stations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_STATIONS_KEY, JSON.stringify(customStations));
    } catch {
      // storage error
    }
  }, [customStations]);

  // Set default initial station on load if none selected
  useEffect(() => {
    if (!currentStation && allStations.length > 0) {
      // Pre-select France Musique as first default
      const defaultSt = allStations.find((s) => s.id === 'france-musique') || allStations[0];
      // Note: we don't autoplay automatically to respect browser policy, but set currentStation so player bar is ready
      // We will set current station directly through playStation when user clicks
    }
  }, [allStations, currentStation]);

  // Toggle favorite
  const handleToggleFavorite = (stationId: string) => {
    setFavoriteIds((prev) => {
      if (prev.includes(stationId)) {
        return prev.filter((id) => id !== stationId);
      } else {
        return [...prev, stationId];
      }
    });
  };

  // Add custom station
  const handleAddCustomStation = (station: RadioStation) => {
    setCustomStations((prev) => [station, ...prev]);
  };

  // Filtered stations for main view
  const displayedStations = useMemo(() => {
    return filterStations(allStations, {
      query: searchQuery,
      category: selectedCategory,
      favoriteIds,
    });
  }, [allStations, searchQuery, selectedCategory, favoriteIds]);

  // Dynamic Favorite Stations spotlight (updates in real time with user favorites!)
  const userFavoriteStations = useMemo(() => {
    return favoriteIds
      .map((id) => allStations.find((s) => s.id === id))
      .filter(Boolean) as RadioStation[];
  }, [allStations, favoriteIds]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-32">
      {/* Top Navigation */}
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        favoritesCount={favoriteIds.length}
        onOpenAdvancedSearch={() => setIsAdvancedSearchOpen(true)}
        onOpenAndroidTips={() => setIsAndroidTipsOpen(true)}
        onOpenAboutStreams={() => setIsAboutStreamsOpen(true)}
        wakeLockActive={wakeLockActive}
        onToggleWakeLock={toggleWakeLock}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex-1 w-full">
        {/* Dynamic Spotlight Banner: Reflects user favorites in real time */}
        {userFavoriteStations.length > 0 && selectedCategory !== 'favorites' && !searchQuery && (
          <section className="mb-8 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/20 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>Vos radios favorites ({userFavoriteStations.length})</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white">
                  {userFavoriteStations.map((s) => s.name).join(' • ')}
                </h2>
              </div>
              <button
                onClick={() => setSelectedCategory('favorites')}
                className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition cursor-pointer shrink-0"
              >
                Gérer les favoris ({favoriteIds.length})
              </button>
            </div>

            {/* Quick 1-tap buttons for user favorites */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
              {userFavoriteStations.map((st) => {
                const isActive = currentStation?.id === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => {
                      if (isActive) {
                        togglePlay();
                      } else {
                        playStation(st);
                      }
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 cursor-pointer ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-lg shadow-amber-500/20'
                        : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                        isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-amber-400'
                      }`}
                    >
                      {getStationInitials(st.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{st.name}</div>
                      <div
                        className={`text-[10px] ${
                          isActive ? 'text-slate-900 font-semibold' : 'text-slate-400'
                        }`}
                      >
                        {isActive && isPlaying ? '● En écoute' : 'Écouter'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Stations Grid Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              {selectedCategory === 'favorites' ? (
                <>
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  <span>Vos stations favorites ({displayedStations.length})</span>
                </>
              ) : searchQuery ? (
                <>
                  <span>Résultats pour "{searchQuery}"</span>
                  <span className="text-xs text-slate-400 font-normal">
                    ({displayedStations.length} trouvée{displayedStations.length > 1 ? 's' : ''})
                  </span>
                </>
              ) : (
                <span>
                  {selectedCategory === 'all'
                    ? 'Toutes les stations'
                    : selectedCategory === 'france'
                    ? 'Radios françaises'
                    : selectedCategory === 'news'
                    ? 'Radios d\'information & Débats'
                    : selectedCategory === 'jazz'
                    ? 'Jazz & Blues'
                    : selectedCategory === 'classical'
                    ? 'Musique Classique'
                    : selectedCategory === 'electro'
                    ? 'Électro & Chillout'
                    : selectedCategory === 'rock'
                    ? 'Rock & Alternative'
                    : 'Musiques du Monde'}{' '}
                  ({displayedStations.length})
                </span>
              )}
            </h2>
          </div>

          <button
            onClick={() => setIsAdvancedSearchOpen(true)}
            className="text-xs font-medium text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Recherche avancée</span>
          </button>
        </div>

        {/* Stations Grid */}
        {displayedStations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedStations.map((station) => {
              const isActive = currentStation?.id === station.id;
              const isFav = favoriteIds.includes(station.id);
              return (
                <StationCard
                  key={station.id}
                  station={station}
                  isActive={isActive}
                  isPlaying={isActive && isPlaying}
                  isLoading={isActive && isLoading}
                  isFavorite={isFav}
                  onTogglePlay={(st) => {
                    if (isActive) {
                      togglePlay();
                    } else {
                      playStation(st);
                    }
                  }}
                  onToggleFavorite={handleToggleFavorite}
                />
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 p-8">
            <p className="text-slate-300 text-base font-semibold mb-2">
              {selectedCategory === 'favorites'
                ? 'Aucune radio favorite pour le moment.'
                : 'Aucune radio ne correspond à votre recherche.'}
            </p>
            <p className="text-slate-400 text-xs max-w-md mx-auto mb-5">
              {selectedCategory === 'favorites'
                ? 'Cliquez sur le cœur d\'une station pour la garder en favori et y accéder rapidement.'
                : 'Utilisez la recherche avancée pour chercher parmi plus de 30 000 stations mondiales sur Radio Browser.'}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setIsAdvancedSearchOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 cursor-pointer"
            >
              Ouvrir la recherche avancée
            </button>
          </div>
        )}
      </main>

      {/* Floating Bottom Audio Player */}
      <AudioPlayerBar
        station={currentStation}
        isPlaying={isPlaying}
        isLoading={isLoading}
        error={error}
        volume={volume}
        isMuted={isMuted}
        isFavorite={currentStation ? favoriteIds.includes(currentStation.id) : false}
        durationListened={durationListened}
        sleepTimerEnd={sleepTimerEnd}
        volumeBoost={volumeBoost}
        onTogglePlay={togglePlay}
        onNext={playNext}
        onPrev={playPrevious}
        onVolumeChange={setVolume}
        onToggleMute={() => setIsMuted(!isMuted)}
        onToggleFavorite={handleToggleFavorite}
        onOpenSleepTimer={() => setIsSleepTimerOpen(true)}
        onOpenEqualizer={() => setIsEqualizerOpen(true)}
        onOpenFullscreen={() => setIsFullscreenPlayerOpen(true)}
      />

      {/* Fullscreen Player Modal */}
      {currentStation && (
        <FullscreenPlayerModal
          isOpen={isFullscreenPlayerOpen}
          onClose={() => setIsFullscreenPlayerOpen(false)}
          station={currentStation}
          isPlaying={isPlaying}
          isLoading={isLoading}
          volume={volume}
          isMuted={isMuted}
          isFavorite={favoriteIds.includes(currentStation.id)}
          durationListened={durationListened}
          sleepTimerEnd={sleepTimerEnd}
          volumeBoost={volumeBoost}
          onTogglePlay={togglePlay}
          onNext={playNext}
          onPrev={playPrevious}
          onVolumeChange={setVolume}
          onToggleMute={() => setIsMuted(!isMuted)}
          onToggleFavorite={handleToggleFavorite}
          onOpenSleepTimer={() => {
            setIsFullscreenPlayerOpen(false);
            setIsSleepTimerOpen(true);
          }}
          onOpenEqualizer={() => {
            setIsFullscreenPlayerOpen(false);
            setIsEqualizerOpen(true);
          }}
        />
      )}

      {/* Advanced Search Modal */}
      <AdvancedSearchModal
        isOpen={isAdvancedSearchOpen}
        onClose={() => setIsAdvancedSearchOpen(false)}
        onSelectStation={(st) => {
          playStation(st);
        }}
        onAddCustomStation={handleAddCustomStation}
      />

      {/* Sleep Timer Modal */}
      <SleepTimerModal
        isOpen={isSleepTimerOpen}
        onClose={() => setIsSleepTimerOpen(false)}
        sleepTimerEnd={sleepTimerEnd}
        onSetTimerMinutes={setSleepTimerMinutes}
      />

      {/* Equalizer Modal */}
      <EqualizerModal
        isOpen={isEqualizerOpen}
        onClose={() => setIsEqualizerOpen(false)}
        activePreset={equalizer}
        onSelectPreset={setEqualizer}
        volumeBoost={volumeBoost}
        onToggleBoost={() => setVolumeBoost(!volumeBoost)}
      />

      {/* Android Background Tips Modal */}
      <AndroidTipsModal
        isOpen={isAndroidTipsOpen}
        onClose={() => setIsAndroidTipsOpen(false)}
      />

      {/* About Streams & Ads Transparency Modal */}
      <AboutStreamsModal
        isOpen={isAboutStreamsOpen}
        onClose={() => setIsAboutStreamsOpen(false)}
      />
    </div>
  );
}
