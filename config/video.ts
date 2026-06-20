import { VideoModel } from './types';

// Video generation (real models hidden behind friendly tiers).
export const VIDEO_MODELS: VideoModel[] = [
  {
    key: 'video-fast', id: 'bytedance/seedance-2.0-fast', label: 'Fast', provider: 'openrouter',
    description: 'Faster, lower-cost video.', tier: 'pro',
    durationsSec: [5], aspectRatios: ['16:9', '9:16'],
  },
  {
    key: 'video-pro', id: 'bytedance/seedance-2.0', label: 'Pro', provider: 'openrouter',
    description: 'Highest-quality text-to-video.', tier: 'pro', badge: 'Pro',
    durationsSec: [5, 10], aspectRatios: ['16:9', '9:16', '1:1'],
  },
];

export const DEFAULT_VIDEO_KEY = 'video-fast';
