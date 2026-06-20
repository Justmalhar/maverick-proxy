import { VideoModel } from './types';

// Curated video-generation models. (Routes are a future phase; configs power
// the UI and tier gating now.)
export const VIDEO_MODELS: VideoModel[] = [
  {
    id: 'minimax/video-01', label: 'MiniMax Video', provider: 'replicate',
    description: 'Text-to-video generation.', tier: 'pro', badge: 'New',
    durationsSec: [6], aspectRatios: ['16:9', '9:16', '1:1'],
  },
  {
    id: 'sora-2', label: 'Sora', provider: 'openai',
    description: 'Coming soon.', tier: 'pro', enabled: false,
    durationsSec: [5, 10], aspectRatios: ['16:9', '9:16'],
  },
];

export const DEFAULT_VIDEO_ID = 'minimax/video-01';
