import { TTSModel } from './types';

const OPENAI_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer', 'ash', 'coral', 'sage']
  .map((v) => ({ id: v, label: v.charAt(0).toUpperCase() + v.slice(1) }));

// Curated text-to-speech models + their voices.
export const TTS_MODELS: TTSModel[] = [
  {
    id: 'gpt-4o-mini-tts', label: 'OpenAI Voice', provider: 'openai',
    description: 'Natural, expressive speech.', tier: 'free',
    voices: OPENAI_VOICES,
  },
  {
    id: 'eleven_turbo_v2_5', label: 'ElevenLabs Turbo', provider: 'elevenlabs',
    description: 'Ultra-realistic voices.', tier: 'pro', badge: 'Pro',
    voices: [
      { id: '21m00Tcm4TlvDq8ikWAM', label: 'Rachel' },
      { id: 'pNInz6obpgDQGcFmaJgB', label: 'Adam' },
      { id: 'ErXwobaYiN019PkySvjV', label: 'Antoni' },
      { id: 'EXAVITQu4vr4xnSDxMaL', label: 'Bella' },
      { id: 'TxGEqnHWrfWFTfGW9XjX', label: 'Josh' },
    ],
  },
];

export const DEFAULT_TTS_ID = 'gpt-4o-mini-tts';
export const DEFAULT_TTS_VOICE = 'alloy';
