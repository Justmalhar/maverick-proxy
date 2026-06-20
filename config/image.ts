import { ImageModel } from './types';

// Image generation / editing (real models hidden behind friendly tiers).
export const IMAGE_MODELS: ImageModel[] = [
  {
    key: 'image-fast', id: 'google/gemini-3.1-flash-image', label: 'Fast', provider: 'openrouter',
    description: 'Quick image generation and editing.', tier: 'free',
    supportsEdit: true,
  },
  {
    key: 'image-quality', id: 'x-ai/grok-imagine-image-quality', label: 'Quality', provider: 'openrouter',
    description: 'Richer, more detailed images.', tier: 'pro',
    supportsEdit: true,
  },
  {
    key: 'image-pro', id: 'openai/gpt-5.4-image-2', label: 'Pro', provider: 'openrouter',
    description: 'Highest-fidelity generation and editing.', tier: 'pro', badge: 'Pro',
    supportsEdit: true,
  },
];

export const DEFAULT_IMAGE_KEY = 'image-fast';
