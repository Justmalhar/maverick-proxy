import { PROVIDERS, provider } from './providers';
import { LLM_MODELS, DEFAULT_LLM_KEY } from './llm';
import { STT_MODELS, DEFAULT_STT_KEY } from './stt';
import { TTS_MODELS, DEFAULT_TTS_KEY, DEFAULT_TTS_VOICE } from './tts';
import { IMAGE_MODELS, DEFAULT_IMAGE_KEY } from './image';
import { VIDEO_MODELS, DEFAULT_VIDEO_KEY } from './video';
import { SONG_MODELS, DEFAULT_SONG_KEY } from './song';
import { SYSTEM_MODELS, SYSTEM_PROVIDER } from './system';
import {
  PublicCatalog, BaseModel, LLMModel, STTModel, TTSModel, ImageModel, VideoModel, SongModel, SystemPurpose,
} from './types';

const isOn = (m: BaseModel) => m.enabled !== false;
const byKey = <T extends BaseModel>(list: T[], key?: string): T | undefined =>
  key ? list.find((m) => m.key === key && isOn(m)) : undefined;

export const enabledLLM = (): LLMModel[] => LLM_MODELS.filter(isOn);
export const enabledSTT = (): STTModel[] => STT_MODELS.filter(isOn);
export const enabledTTS = (): TTSModel[] => TTS_MODELS.filter(isOn);
export const enabledImage = (): ImageModel[] => IMAGE_MODELS.filter(isOn);
export const enabledVideo = (): VideoModel[] => VIDEO_MODELS.filter(isOn);
export const enabledSong = (): SongModel[] => SONG_MODELS.filter(isOn);

export interface Upstream {
  providerId: string;
  baseUrl: string;
  key: string;       // upstream API key (server-side)
  model: string;     // real upstream model id
}

function resolve(model: BaseModel | undefined): Upstream | null {
  if (!model) return null;
  const p = provider(model.provider);
  if (!p) return null;
  const apiKey = process.env[p.apiKeyEnv];
  if (!apiKey) return null;
  return { providerId: p.id, baseUrl: p.baseUrl, key: apiKey, model: model.id };
}

// Each resolver takes the PUBLIC alias the app sends and falls back to default.
export const resolveLLM = (key?: string): Upstream | null =>
  resolve(byKey(LLM_MODELS, key) ?? byKey(LLM_MODELS, DEFAULT_LLM_KEY));
export const resolveSTT = (key?: string): Upstream | null =>
  resolve(byKey(STT_MODELS, key) ?? byKey(STT_MODELS, DEFAULT_STT_KEY));
export const resolveTTS = (key?: string): Upstream | null =>
  resolve(byKey(TTS_MODELS, key) ?? byKey(TTS_MODELS, DEFAULT_TTS_KEY));
export const resolveImage = (key?: string): Upstream | null =>
  resolve(byKey(IMAGE_MODELS, key) ?? byKey(IMAGE_MODELS, DEFAULT_IMAGE_KEY));
export const resolveVideo = (key?: string): Upstream | null =>
  resolve(byKey(VIDEO_MODELS, key) ?? byKey(VIDEO_MODELS, DEFAULT_VIDEO_KEY));
export const resolveSong = (key?: string): Upstream | null =>
  resolve(byKey(SONG_MODELS, key) ?? byKey(SONG_MODELS, DEFAULT_SONG_KEY));

/** Internal model for a backend task (chat title, summary, deep research). */
export const resolveSystem = (purpose: SystemPurpose): Upstream | null =>
  resolve({ key: purpose, id: SYSTEM_MODELS[purpose], label: purpose, provider: SYSTEM_PROVIDER });

// ── Public catalog (real id/provider stripped; `key` exposed as `id`) ──
const pubBase = (m: BaseModel) => ({
  id: m.key, label: m.label, description: m.description, badge: m.badge, tier: m.tier,
});

export function publicCatalog(): PublicCatalog {
  return {
    providers: Object.values(PROVIDERS).map((p) => ({ id: p.id, label: p.label })),
    llm: enabledLLM().map((m) => ({ ...pubBase(m), vision: m.vision, reasoning: m.reasoning, tools: m.tools })),
    stt: enabledSTT().map((m) => ({ ...pubBase(m), realtime: m.realtime })),
    tts: enabledTTS().map((m) => ({ ...pubBase(m), voices: m.voices })),
    image: enabledImage().map((m) => ({ ...pubBase(m), sizes: m.sizes, supportsEdit: m.supportsEdit })),
    video: enabledVideo().map((m) => ({ ...pubBase(m), durationsSec: m.durationsSec, aspectRatios: m.aspectRatios })),
    song: enabledSong().map((m) => ({ ...pubBase(m), maxDurationSec: m.maxDurationSec })),
  };
}

export {
  DEFAULT_LLM_KEY, DEFAULT_STT_KEY, DEFAULT_TTS_KEY, DEFAULT_TTS_VOICE,
  DEFAULT_IMAGE_KEY, DEFAULT_VIDEO_KEY, DEFAULT_SONG_KEY, SYSTEM_MODELS,
};
