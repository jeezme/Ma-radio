import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getInitialFavorites,
  filterStations,
  getStationInitials,
  formatDuration,
  calculateSleepRemaining,
  isValidStreamUrl
} from './radioUtils.ts';
import { CURATED_STATIONS, DEFAULT_FAVORITE_IDS } from '../data/defaultStations.ts';

test('getInitialFavorites initializes with the required default stations without RFI', () => {
  const result = getInitialFavorites(null);
  assert.deepEqual(result, ['france-musique', 'rmc', 'fip', 'radio-nova']);
  assert.equal(result.includes('france-musique'), true);
  assert.equal(result.includes('rmc'), true);
  assert.equal(result.includes('fip'), true);
  assert.equal(result.includes('radio-nova'), true);
  assert.equal(result.includes('rfi'), false);
});

test('getInitialFavorites preserves saved favorites and strips rfi if present', () => {
  const saved = JSON.stringify(['rmc', 'fip', 'rfi']);
  const result = getInitialFavorites(saved);
  assert.deepEqual(result, ['rmc', 'fip']);
});

test('filterStations filters by favorites category', () => {
  const favIds = ['fip', 'radio-nova'];
  const filtered = filterStations(CURATED_STATIONS, {
    category: 'favorites',
    favoriteIds: favIds
  });
  assert.equal(filtered.length, 2);
  assert.equal(filtered.every(s => favIds.includes(s.id)), true);
});

test('filterStations filters by text search query matching name or tags', () => {
  const queryResult = filterStations(CURATED_STATIONS, { query: 'musique' });
  assert.equal(queryResult.some(s => s.name === 'France Musique'), true);

  const jazzResult = filterStations(CURATED_STATIONS, { category: 'jazz' });
  assert.equal(jazzResult.some(s => s.id === 'tsf-jazz'), true);
});

test('filterStations filters by minimum bitrate', () => {
  const highBitrate = filterStations(CURATED_STATIONS, { minBitrate: 190 });
  assert.equal(highBitrate.every(s => (s.bitrate || 0) >= 190), true);
  assert.equal(highBitrate.length > 0, true);
});

test('getStationInitials returns two uppercase characters', () => {
  assert.equal(getStationInitials('France Musique'), 'FM');
  assert.equal(getStationInitials('RMC'), 'RM');
  assert.equal(getStationInitials('Radio Nova'), 'RN');
});

test('formatDuration formats seconds to human readable strings', () => {
  assert.equal(formatDuration(0), '00:00');
  assert.equal(formatDuration(65), '01:05');
  assert.equal(formatDuration(3661), '1:01:01');
});

test('calculateSleepRemaining calculates delta in seconds accurately', () => {
  const now = 1000000;
  const target = now + 60000; // +60s
  assert.equal(calculateSleepRemaining(target, now), 60);
  assert.equal(calculateSleepRemaining(null, now), 0);
  assert.equal(calculateSleepRemaining(now - 1000, now), 0);
});

test('isValidStreamUrl validates http and https URLs', () => {
  assert.equal(isValidStreamUrl('https://icecast.radiofrance.fr/fip-midfi.mp3'), true);
  assert.equal(isValidStreamUrl('http://audio.bfmtv.com/rmcradio_128.mp3'), true);
  assert.equal(isValidStreamUrl('not-a-url'), false);
  assert.equal(isValidStreamUrl(''), false);
});
