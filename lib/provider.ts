import { createOpenAI } from '@ai-sdk/openai';
import { PROVIDERS } from '../config/providers';

/** AI SDK provider pointed at OpenRouter (OpenAI-compatible). */
export function openrouter() {
  const p = PROVIDERS.openrouter;
  return createOpenAI({
    baseURL: p.baseUrl,
    apiKey: process.env[p.apiKeyEnv] ?? '',
    name: 'openrouter',
    headers: { 'HTTP-Referer': 'https://mobii.world', 'X-Title': 'Maverick Chat' },
  });
}

/** A LanguageModel for a real (server-side) OpenRouter model id. */
export const orModel = (realId: string) => openrouter()(realId);
