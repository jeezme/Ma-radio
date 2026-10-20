import React, { useState } from 'react';
import { Search, X, Globe, Radio, Plus, Filter, Music, Sparkles } from 'lucide-react';
import type { RadioStation } from '../types/radio.ts';
import { searchRadioBrowser } from '../services/radioBrowserApi.ts';
import { isValidStreamUrl } from '../utils/radioUtils.ts';

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStation: (station: RadioStation) => void;
  onAddCustomStation: (station: RadioStation) => void;
}

const COUNTRIES = [
  { code: '', label: 'Tous les pays' },
  { code: 'FR', label: 'France' },
  { code: 'GB', label: 'Royaume-Uni' },
  { code: 'US', label: 'États-Unis' },
  { code: 'DE', label: 'Allemagne' },
  { code: 'CH', label: 'Suisse' },
  { code: 'BE', label: 'Belgique' },
  { code: 'CA', label: 'Canada' },
  { code: 'ES', label: 'Espagne' },
  { code: 'IT', label: 'Italie' },
];

const GENRES = [
  { id: '', label: 'Tous les genres' },
  { id: 'news', label: 'Info & Actualités' },
  { id: 'jazz', label: 'Jazz & Blues' },
  { id: 'classical', label: 'Musique Classique' },
  { id: 'rock', label: 'Rock & Indie' },
  { id: 'electro', label: 'Électronique & Chill' },
  { id: 'pop', label: 'Pop & Top 40' },
  { id: 'rap', label: 'Hip-Hop & Urbain' },
  { id: 'reggae', label: 'Reggae & Dub' },
  { id: 'world', label: 'Musiques du Monde' },
];

const BITRATES = [
  { value: 0, label: 'Tous débits' },
  { value: 64, label: '64 kbps (Économie data)' },
  { value: 128, label: '128 kbps (Standard HD)' },
  { value: 192, label: '192 kbps (Haute fidélité)' },
  { value: 320, label: '320 kbps (Qualité Master)' },
];

export const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectStation,
  onAddCustomStation,
}) => {
  const [activeTab, setActiveTab] = useState<'search' | 'custom'>('search');

  // Search parameters
  const [searchName, setSearchName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('FR');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [minBitrate, setMinBitrate] = useState(0);

  // Search results
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<RadioStation[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Custom station form
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customGenre, setCustomGenre] = useState('Généraliste');
  const [customCountry, setCustomCountry] = useState('France');
  const [customError, setCustomError] = useState('');

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setHasSearched(true);

    try {
      const data = await searchRadioBrowser({
        name: searchName.trim() || undefined,
        tag: selectedGenre || undefined,
        countryCode: selectedCountry || undefined,
        minBitrate: minBitrate > 0 ? minBitrate : undefined,
        limit: 30,
        order: 'clickcount',
      });
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError('');

    if (!customName.trim()) {
      setCustomError('Veuillez entrer un nom de radio.');
      return;
    }

    if (!isValidStreamUrl(customUrl.trim())) {
      setCustomError('Veuillez entrer une URL de flux valide (commençant par http:// ou https://).');
      return;
    }

    const newStation: RadioStation = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      url: customUrl.trim(),
      tags: [customGenre.toLowerCase()],
      country: customCountry,
      countryCode: customCountry === 'France' ? 'FR' : 'INT',
      bitrate: 128,
      codec: 'MP3',
      isCustom: true,
    };

    onAddCustomStation(newStation);
    onSelectStation(newStation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl relative text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Recherche avancée & Explorateur</h2>
              <p className="text-xs text-slate-400">Accédez à plus de 30 000 stations mondiales ou ajoutez votre flux</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 px-5 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('search')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'search'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filtres avancés & Radio Browser</span>
          </button>

          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'custom'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une URL personnalisée</span>
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {activeTab === 'search' ? (
            <>
              {/* Filter controls form */}
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Name query */}
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Nom de la radio / mot-clé
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Ex: Jazz, Nova, BBC, Classic..."
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Pays d'origine
                    </label>
                    <select
                      value={selectedCountry}
                      onChange={(e) => setSelectedCountry(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Genre */}
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Genre musical / Thème
                    </label>
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      {GENRES.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Min Bitrate */}
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Qualité audio minimum
                    </label>
                    <select
                      value={minBitrate}
                      onChange={(e) => setMinBitrate(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                    >
                      {BITRATES.map((b) => (
                        <option key={b.value} value={b.value}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition"
                  >
                    {isSearching ? (
                      <>
                        <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                        <span>Recherche en cours...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 stroke-[2.5]" />
                        <span>Lancer la recherche</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Results List */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Résultats {hasSearched ? `(${results.length} stations)` : ''}
                  </span>
                </div>

                {isSearching ? (
                  <div className="py-12 text-center text-slate-400 text-sm flex flex-col items-center gap-3">
                    <span className="w-7 h-7 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></span>
                    <span>Interrogation des serveurs mondiaux Radio Browser...</span>
                  </div>
                ) : hasSearched && results.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-sm bg-slate-800/40 rounded-xl border border-slate-800">
                    Aucune station trouvée pour ces critères. Essayez d'élargir le pays ou de vider le filtre de genre.
                  </div>
                ) : results.length > 0 ? (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {results.map((station) => (
                      <div
                        key={station.id}
                        className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-between gap-3 transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-slate-700/60 flex items-center justify-center shrink-0 text-amber-400 font-bold text-xs overflow-hidden">
                            {station.favicon ? (
                              <img
                                src={station.favicon}
                                alt={station.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <span>{station.name.slice(0, 2).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-sm text-slate-100 truncate">
                              {station.name}
                            </div>
                            <div className="text-xs text-slate-400 flex items-center gap-2">
                              <span>{station.country || 'International'}</span>
                              <span>•</span>
                              <span>{station.bitrate} kbps</span>
                              {station.tags && station.tags[0] && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">#{station.tags[0]}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            onSelectStation(station);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer transition shadow-sm"
                        >
                          Écouter
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 rounded-xl bg-slate-800/30 border border-dashed border-slate-700/60 text-center text-slate-400 text-sm">
                    Configurez vos filtres ci-dessus et cliquez sur <strong>Lancer la recherche</strong> pour explorer des milliers de stations.
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Custom stream form */
            <form onSubmit={handleAddCustom} className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                Vous connaissez le flux direct d'une radio locale ou d'une webradio indépendante ? Entrez son URL de streaming (MP3, AAC, M3U8, Icecast, Shoutcast) pour l'écouter instantanément.
              </div>

              {customError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300">
                  {customError}
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Nom de la station *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Radio FMR, Radio Meuh, FIP Metal..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  URL du flux audio direct (HTTP ou HTTPS) *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://mon-serveur-radio.com/stream.mp3"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Genre musical
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Électro, Jazz, Talk..."
                    value={customGenre}
                    onChange={(e) => setCustomGenre(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Pays
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: France"
                    value={customCountry}
                    onChange={(e) => setCustomCountry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer transition"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Ajouter et écouter la radio</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
