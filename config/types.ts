// Shared schema for Maverick's curated catalog. One consistent shape across
// every modality so the iOS app can render providers/models generically.

export type Modality = 'llm' | 'stt' | 'tts' | 'image' | 'video';

/** An upstream vendor. Carries server-only routing info (never sent to clients). */
export interface Provider {
  id: string;            // 'openrouter' | 'openai' | 'groq' | ...
  label: string;         // display name
  baseUrl: string;       // upstream API base, no trailing slash
  apiKeyEnv: string;     // env var holding the server-side key
  docsUrl?: string;
}

export type Tier = 'free' | 'pro';

/** Fields common to every model across modalities. */
export interface BaseModel {
  id: string;            // upstream model id
  label: string;         // UI display name (e.g. "Gemini 2.5 Flash")
  provider: string;      // Provider.id
  description?: string;
  badge?: string;        // 'New' | 'Beta' | ...
  tier?: Tier;           // gating (default 'free')
  enabled?: boolean;     // default true; false = defined but hidden/off
}

export interface LLMModel extends BaseModel {
  vision?: boolean;
  reasoning?: boolean;
  tools?: boolean;
  contextWindow?: number;
}

export interface STTModel extends BaseModel {
  realtime?: boolean;
}

export interface TTSVoice { id: string; label: string }
export interface TTSModel extends BaseModel {
  voices: TTSVoice[];
}

export interface ImageModel extends BaseModel {
  sizes?: string[];      // e.g. ['1024x1024','1024x1536']
  supportsEdit?: boolean;
}

export interface VideoModel extends BaseModel {
  durationsSec?: number[];
  aspectRatios?: string[];
}

/** Client-safe view (provider routing fields stripped). */
export interface PublicProvider { id: string; label: string }
export interface PublicCatalog {
  providers: PublicProvider[];
  llm: LLMModel[];
  stt: STTModel[];
  tts: TTSModel[];
  image: ImageModel[];
  video: VideoModel[];
}
