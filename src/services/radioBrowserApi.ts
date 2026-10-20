import type { RadioStation } from '../types/radio.ts';

const SERVERS = [
  'https://de1.api.radio-browser.info',
  'https://nl1.api.radio-browser.info',
  'https://at1.api.radio-browser.info',
];

let activeServer = SERVERS[0];

export interface SearchRadioBrowserParams {
  name?: string;
  tag?: string;
  country?: string;
  countryCode?: string;
  minBitrate?: number;
  limit?: number;
  order?: 'clickcount' | 'votes' | 'bitrate' | 'name';
}

/**
 * Searches stations from open community Radio Browser API
 */
export async function searchRadioBrowser(
  params: SearchRadioBrowserParams
): Promise<RadioStation[]> {
  const queryParams = new URLSearchParams();

  if (params.name) queryParams.set('name', params.name);
  if (params.tag) queryParams.set('tag', params.tag);
  if (params.country) queryParams.set('country', params.country);
  if (params.countryCode) queryParams.set('countrycode', params.countryCode);
  if (params.minBitrate) queryParams.set('bitrateMin', params.minBitrate.toString());

  queryParams.set('limit', (params.limit || 24).toString());
  queryParams.set('order', params.order || 'clickcount');
  queryParams.set('reverse', 'true');
  queryParams.set('hidebroken', 'true');

  for (const server of SERVERS) {
    try {
      const url = `${server}/json/stations/search?${queryParams.toString()}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'MaRadioApp/1.0',
        },
      });

      if (!res.ok) continue;

      const data = await res.json();
      activeServer = server;

      return (data || []).map((item: any): RadioStation => {
        const rawTags = (item.tags || '')
          .split(',')
          .map((t: string) => t.trim())
          .filter(Boolean);

        return {
          id: `rb-${item.stationuuid}`,
          name: item.name?.trim() || 'Radio',
          url: item.url_resolved || item.url,
          homepage: item.homepage,
          favicon: item.favicon || undefined,
          tags: rawTags,
          country: item.country,
          countryCode: item.countrycode,
          language: item.language,
          bitrate: item.bitrate || 128,
          codec: item.codec || 'MP3',
          votes: item.votes || 0,
        };
      });
    } catch {
      // try next server
    }
  }

  return [];
}
