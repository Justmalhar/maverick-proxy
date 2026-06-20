import { Provider } from './types';

// Vendor registry. baseUrl + apiKeyEnv are server-only; clients only ever see
// id + label (via the public catalog).
export const PROVIDERS: Record<string, Provider> = {
  openrouter: {
    id: 'openrouter', label: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1', apiKeyEnv: 'OPENROUTER_API_KEY',
    docsUrl: 'https://openrouter.ai/models',
  },
  openai: {
    id: 'openai', label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1', apiKeyEnv: 'OPENAI_API_KEY',
  },
  groq: {
    id: 'groq', label: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1', apiKeyEnv: 'GROQ_API_KEY',
  },
  deepgram: {
    id: 'deepgram', label: 'Deepgram',
    baseUrl: 'https://api.deepgram.com/v1', apiKeyEnv: 'DEEPGRAM_API_KEY',
  },
  elevenlabs: {
    id: 'elevenlabs', label: 'ElevenLabs',
    baseUrl: 'https://api.elevenlabs.io/v1', apiKeyEnv: 'ELEVENLABS_API_KEY',
  },
  replicate: {
    id: 'replicate', label: 'Replicate',
    baseUrl: 'https://api.replicate.com/v1', apiKeyEnv: 'REPLICATE_API_KEY',
  },
};

export function provider(id: string): Provider | undefined {
  return PROVIDERS[id];
}
