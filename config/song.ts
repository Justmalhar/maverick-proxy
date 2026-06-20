import { SongModel } from './types';

// Song / music generation (real model hidden).
export const SONG_MODELS: SongModel[] = [
  {
    key: 'song-standard', id: 'google/lyria-3-pro-preview', label: 'Standard', provider: 'openrouter',
    description: 'Generate original songs.', tier: 'pro', badge: 'New',
    maxDurationSec: 120,
  },
];

export const DEFAULT_SONG_KEY = 'song-standard';
