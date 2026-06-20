import { ImageModel } from './types';

// Curated image-generation models. (Routes are a future phase; these power the
// UI today so we can show what's coming and gate by tier.)
export const IMAGE_MODELS: ImageModel[] = [
  {
    id: 'gpt-image-1', label: 'GPT Image', provider: 'openai',
    description: 'High-quality image generation and editing.', tier: 'pro', badge: 'New',
    sizes: ['1024x1024', '1024x1536', '1536x1024'], supportsEdit: true,
  },
  {
    id: 'black-forest-labs/flux-1.1-pro', label: 'FLUX 1.1 Pro', provider: 'replicate',
    description: 'Fast, photorealistic generations.', tier: 'pro',
    sizes: ['1024x1024', '1344x768', '768x1344'],
  },
];

export const DEFAULT_IMAGE_ID = 'gpt-image-1';
