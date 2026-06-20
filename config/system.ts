import { SystemPurpose } from './types';

// Internal, non-user-facing models for backend tasks. All via OpenRouter.
// `deepResearch` powers the Deep Research tool. `chatTitle` auto-names a chat
// from its first turn. `chatSummary` produces a running summary that is injected
// as context right after the system prompt on long conversations.
export const SYSTEM_MODELS: Record<SystemPurpose, string> = {
  chatTitle: 'nvidia/nemotron-3-ultra-550b-a55b:free',
  chatSummary: 'nvidia/nemotron-3-ultra-550b-a55b:free',
  deepResearch: 'deepseek/deepseek-v4-flash',
};

// All system models route through OpenRouter.
export const SYSTEM_PROVIDER = 'openrouter';
