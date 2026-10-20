export interface RadioStation {
  id: string;
  name: string;
  url: string;
  urlResolved?: string;
  homepage?: string;
  favicon?: string;
  tags?: string[];
  country?: string;
  countryCode?: string;
  language?: string;
  bitrate?: number;
  codec?: string;
  votes?: number;
  isCustom?: boolean;
  alternativeUrls?: string[];
  hasPreRollAd?: boolean;
}

export type RadioCategory =
  | 'all'
  | 'favorites'
  | 'france'
  | 'news'
  | 'music'
  | 'jazz'
  | 'classical'
  | 'electro'
  | 'rock'
  | 'world';

export interface AdvancedSearchFilters {
  query: string;
  genre: string;
  country: string;
  minBitrate: number;
  onlyFavorites: boolean;
  searchOnline: boolean;
}

export interface EqualizerPreset {
  name: string;
  bass: number; // dB (-12 to +12)
  mid: number;
  treble: number;
}
