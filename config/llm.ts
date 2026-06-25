import { LLMModel } from './types';

// User-facing chat tiers. `key` is the stable public alias; `id` is the real
// model (server-only) and can be swapped anytime without an app update.
export const LLM_MODELS: LLMModel[] = [
  {
    key: 'fast', id: 'google/gemini-3.5-flash', label: 'Fast', provider: 'openrouter',
    description: 'Quick replies for everyday chat.', tier: 'free',
    vision: true, tools: true,
  },
  {
    key: 'balanced', id: 'deepseek/deepseek-v4-flash', label: 'Balanced', provider: 'openrouter',
    description: 'A smart balance of speed and depth.', tier: 'free',
    tools: true,
  },
  {
    key: 'pro', id: 'deepseek/deepseek-v4-pro', label: 'Pro', provider: 'openrouter',
    description: 'Maximum reasoning for hard problems.', tier: 'pro', badge: 'Pro',
    reasoning: true, tools: true,
  },
  // Voice transform: fast, cheap Llama 3.1 8B via Groq — used by the desktop
  // Maverick Voice app for transcript cleanup and formatting passes.
  {
    key: 'voice-transform', id: 'llama-3.1-8b-instant', label: 'Voice Transform', provider: 'groq',
    description: 'Transcript cleanup and formatting.', tier: 'free',
  },
];

export const DEFAULT_LLM_KEY = 'fast';
