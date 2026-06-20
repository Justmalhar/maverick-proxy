// Shared schema for Maverick's curated catalog. One consistent shape across
// every modality so the iOS app can render providers/models generically.
//
// IMPORTANT: `key` is the stable, public alias the app sends (e.g. "fast").
// `id` is the real upstream model id and NEVER leaves the server — so we can
// swap the underlying model/provider from the proxy without an app update.

export type Modality = 'llm' | 'stt' | 'tts' | 'image' | 'video' | 'song';

/** An upstream vendor. Carries server-only routing info (never sent to clients). */
export interface Provider {
  id: string;
  label: string;
  baseUrl: string;
  apiKeyEnv: string;
  docsUrl?: string;
}

export type Tier = 'free' | 'pro';

/** Fields common to every model across modalities. */
export interface BaseModel {
  key: string;           // public, stable alias (what the app sends)
  id: string;            // real upstream model id (server-only)
  label: string;         // friendly UI name (e.g. "Fast")
  provider: string;      // Provider.id
  description?: string;
  badge?: string;
  tier?: Tier;
  enabled?: boolean;     // default true
}

export interface LLMModel extends BaseModel {
  vision?: boolean;
  reasoning?: boolean;
  tools?: boolean;
}
export interface STTModel extends BaseModel { realtime?: boolean }
export interface TTSVoice { id: string; label: string }
export interface TTSModel extends BaseModel { voices: TTSVoice[] }
export interface ImageModel extends BaseModel { sizes?: string[]; supportsEdit?: boolean }
export interface VideoModel extends BaseModel { durationsSec?: number[]; aspectRatios?: string[] }
export interface SongModel extends BaseModel { maxDurationSec?: number }

/** Internal model purposes — not user-facing, used by the backend. */
export type SystemPurpose = 'chatTitle' | 'chatSummary' | 'deepResearch';

// ── Client-safe (public) shapes — real id/provider stripped, `key` exposed as `id` ──

export interface PublicModel {
  id: string;            // == the model's public `key`
  label: string;
  description?: string;
  badge?: string;
  tier?: Tier;
}
export interface PublicLLM extends PublicModel { vision?: boolean; reasoning?: boolean; tools?: boolean }
export interface PublicSTT extends PublicModel { realtime?: boolean }
export interface PublicTTS extends PublicModel { voices: TTSVoice[] }
export interface PublicImage extends PublicModel { sizes?: string[]; supportsEdit?: boolean }
export interface PublicVideo extends PublicModel { durationsSec?: number[]; aspectRatios?: string[] }
export interface PublicSong extends PublicModel { maxDurationSec?: number }

export interface PublicProvider { id: string; label: string }
export interface PublicCatalog {
  providers: PublicProvider[];
  llm: PublicLLM[];
  stt: PublicSTT[];
  tts: PublicTTS[];
  image: PublicImage[];
  video: PublicVideo[];
  song: PublicSong[];
}
