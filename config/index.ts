import { PROVIDERS, provider } from './providers';
import { LLM_MODELS, DEFAULT_LLM_ID } from './llm';
import { STT_MODELS, DEFAULT_STT_ID } from './stt';
import { TTS_MODELS, DEFAULT_TTS_ID, DEFAULT_TTS_VOICE } from './tts';
import { IMAGE_MODELS } from './image';
import { VIDEO_MODELS } from './video';
import { PublicCatalog, LLMModel, STTModel, TTSModel } from './types';

const isOn = (m: { enabled?: boolean }) => m.enabled !== false;

export const enabledLLM = (): LLMModel[] => LLM_MODELS.filter(isOn);
export const enabledSTT = (): STTModel[] => STT_MODELS.filter(isOn);
export const enabledTTS = (): TTSModel[] => TTS_MODELS.filter(isOn);

export const llmModel = (id: string): LLMModel | undefined => LLM_MODELS.find((m) => m.id === id && isOn(m));
export const sttModel = (id: string): STTModel | undefined => STT_MODELS.find((m) => m.id === id && isOn(m));
export const ttsModel = (id: string): TTSModel | undefined => TTS_MODELS.find((m) => m.id === id && isOn(m));

export interface Upstream {
  providerId: string;
  baseUrl: string;
  key: string;
  model: string;
}

function resolve(model: { id: string; provider: string } | undefined): Upstream | null {
  if (!model) return null;
  const p = provider(model.provider);
  if (!p) return null;
  const key = process.env[p.apiKeyEnv];
  if (!key) return null;
  return { providerId: p.id, baseUrl: p.baseUrl, key, model: model.id };
}

/** Routing for an LLM model id (falls back to the default model). */
export const resolveLLM = (id?: string): Upstream | null =>
  resolve((id ? llmModel(id) : undefined) ?? llmModel(DEFAULT_LLM_ID));

export const resolveSTT = (id?: string): Upstream | null =>
  resolve((id ? sttModel(id) : undefined) ?? sttModel(DEFAULT_STT_ID));

export const resolveTTS = (id?: string): Upstream | null =>
  resolve((id ? ttsModel(id) : undefined) ?? ttsModel(DEFAULT_TTS_ID));

/** Client-safe catalog (no upstream URLs or key-env names). */
export function publicCatalog(): PublicCatalog {
  return {
    providers: Object.values(PROVIDERS).map((p) => ({ id: p.id, label: p.label })),
    llm: enabledLLM(),
    stt: enabledSTT(),
    tts: enabledTTS(),
    image: IMAGE_MODELS.filter(isOn),
    video: VIDEO_MODELS.filter(isOn),
  };
}

export { DEFAULT_LLM_ID, DEFAULT_STT_ID, DEFAULT_TTS_ID, DEFAULT_TTS_VOICE };
