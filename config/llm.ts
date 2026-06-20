import { LLMModel } from './types';

// Curated chat models offered by Maverick. Add/remove here — the app's model
// picker and the chat route's allow-list both derive from this list.
export const LLM_MODELS: LLMModel[] = [
  {
    id: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash', provider: 'openrouter',
    description: 'Fast, great default for everyday chat.', tier: 'free',
    vision: true, tools: true, contextWindow: 1_000_000,
  },
  {
    id: 'openai/gpt-4o-mini', label: 'GPT-4o mini', provider: 'openrouter',
    description: 'Quick and capable.', tier: 'free',
    vision: true, tools: true, contextWindow: 128_000,
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B', provider: 'openrouter',
    description: 'Open-weight, strong all-rounder.', tier: 'free',
    tools: true, contextWindow: 131_000,
  },
  {
    id: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro', provider: 'openrouter',
    description: 'Deeper reasoning and long context.', tier: 'pro', badge: 'Pro',
    vision: true, reasoning: true, tools: true, contextWindow: 1_000_000,
  },
  {
    id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', provider: 'openrouter',
    description: 'Excellent writing and coding.', tier: 'pro', badge: 'Pro',
    vision: true, tools: true, contextWindow: 200_000,
  },
  {
    id: 'anthropic/claude-3.7-sonnet', label: 'Claude 3.7 Sonnet', provider: 'openrouter',
    description: 'Hybrid reasoning, top-tier coding.', tier: 'pro', badge: 'Pro',
    vision: true, reasoning: true, tools: true, contextWindow: 200_000,
  },
  {
    id: 'deepseek/deepseek-r1', label: 'DeepSeek R1', provider: 'openrouter',
    description: 'Open reasoning model.', tier: 'pro',
    reasoning: true, contextWindow: 128_000,
  },
];

/** The default model used when the client sends an unknown/disallowed one. */
export const DEFAULT_LLM_ID = 'google/gemini-2.5-flash';
