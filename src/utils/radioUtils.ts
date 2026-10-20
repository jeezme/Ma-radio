import type { RadioStation } from '../types/radio.ts';
import { DEFAULT_FAVORITE_IDS } from '../data/defaultStations.ts';

export const FAVORITES_STORAGE_KEY = 'ma_radio_favorites_v1';
export const RECENTS_STORAGE_KEY = 'ma_radio_recents_v1';
export const CUSTOM_STATIONS_KEY = 'ma_radio_custom_stations_v1';

/**
 * Loads favorite station IDs, ensuring the 5 requested default stations are included on initial run
 */
export function getInitialFavorites(savedJson: string | null): string[] {
  if (!savedJson) {
    return [...DEFAULT_FAVORITE_IDS];
  }
  try {
    const parsed = JSON.parse(savedJson);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Exclude 'rfi' per user request
      return parsed.filter((id) => id !== 'rfi');
    }
  } catch {
    // fallback
  }
  return [...DEFAULT_FAVORITE_IDS];
}

/**
 * Filter stations according to multiple criteria
 */
export function filterStations(
  stations: RadioStation[],
  options: {
    query?: string;
    category?: string;
    country?: string;
    minBitrate?: number;
    favoriteIds?: string[];
  }
): RadioStation[] {
  const { query, category, country, minBitrate, favoriteIds } = options;
  const q = query ? query.trim().toLowerCase() : '';

  return stations.filter((station) => {
    // Favorites check
    if (category === 'favorites') {
      if (!favoriteIds || !favoriteIds.includes(station.id)) {
        return false;
      }
    }

    // Min bitrate check
    if (minBitrate && minBitrate > 0) {
      if ((station.bitrate || 0) < minBitrate) {
        return false;
      }
    }

    // Country check
    if (country && country !== 'all') {
      const stationCountry = (station.country || '').toLowerCase();
      const stationCountryCode = (station.countryCode || '').toLowerCase();
      const targetCountry = country.toLowerCase();
      if (
        stationCountry !== targetCountry &&
        stationCountryCode !== targetCountry &&
        !stationCountry.includes(targetCountry)
      ) {
        return false;
      }
    }

    // Category / genre tag check
    if (category && category !== 'all' && category !== 'favorites') {
      const tags = (station.tags || []).map((t) => t.toLowerCase());
      const name = station.name.toLowerCase();

      switch (category) {
        case 'france':
          if (station.countryCode !== 'FR' && station.country !== 'France') {
            return false;
          }
          break;
        case 'news':
          if (
            !tags.some((t) =>
              ['info', 'actualités', 'talk', 'news', 'politique', 'sport'].some((k) =>
                t.includes(k)
              )
            ) &&
            !name.includes('info') &&
            !name.includes('rmc')
          ) {
            return false;
          }
          break;
        case 'classical':
          if (
            !tags.some((t) =>
              ['classique', 'classical', 'symphonie', 'opéra', 'baroque'].some((k) =>
                t.includes(k)
              )
            ) &&
            !name.includes('musique') &&
            !name.includes('classique')
          ) {
            return false;
          }
          break;
        case 'jazz':
          if (
            !tags.some((t) =>
              ['jazz', 'blues', 'swing', 'soul', 'groove'].some((k) => t.includes(k))
            ) &&
            !name.includes('jazz')
          ) {
            return false;
          }
          break;
        case 'electro':
          if (
            !tags.some((t) =>
              ['electro', 'techno', 'house', 'chillout', 'downtempo', 'dance', 'electronic'].some((k) =>
                t.includes(k)
              )
            )
          ) {
            return false;
          }
          break;
        case 'rock':
          if (
            !tags.some((t) =>
              ['rock', 'indie', 'alternative', 'metal', 'garage'].some((k) => t.includes(k))
            )
          ) {
            return false;
          }
          break;
        case 'world':
          if (
            !tags.some((t) =>
              ['monde', 'world', 'reggae', 'latin', 'afro', 'international'].some((k) =>
                t.includes(k)
              )
            ) &&
            !name.includes('rfi')
          ) {
            return false;
          }
          break;
        default:
          break;
      }
    }

    // Text search query
    if (q) {
      const inName = station.name.toLowerCase().includes(q);
      const inTags = (station.tags || []).some((t) => t.toLowerCase().includes(q));
      const inCountry = (station.country || '').toLowerCase().includes(q);
      const inLanguage = (station.language || '').toLowerCase().includes(q);
      if (!inName && !inTags && !inCountry && !inLanguage) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Returns station acronym/initials (e.g. "FM" for France Musique)
 */
export function getStationInitials(name: string): string {
  if (!name) return 'RA';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * Format duration in seconds to mm:ss or hh:mm:ss
 */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate remaining seconds for sleep timer
 */
export function calculateSleepRemaining(targetTimestamp: number | null, now: number): number {
  if (!targetTimestamp) return 0;
  const diffMs = targetTimestamp - now;
  return Math.max(0, Math.ceil(diffMs / 1000));
}

/**
 * Validate audio stream URL
 */
export function isValidStreamUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
