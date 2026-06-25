import { TTSModel } from './types';

// Text-to-speech (provider hidden; users pick a voice).
// Kokoro has a ~4k token context window; the speech route chunks long inputs automatically.
export const TTS_MODELS: TTSModel[] = [
  {
    key: 'tts-standard', id: 'hexgrad/kokoro-82m', label: 'Standard', provider: 'openrouter',
    description: 'Natural, lightweight speech.', tier: 'free',
    voices: [
      { id: 'af_heart', label: 'Heart' },
      { id: 'af_bella', label: 'Bella' },
      { id: 'af_sarah', label: 'Sarah' },
      { id: 'am_adam', label: 'Adam' },
      { id: 'am_michael', label: 'Michael' },
      { id: 'bf_emma', label: 'Emma' },
    ],
  },
];

export const DEFAULT_TTS_KEY = 'tts-standard';
export const DEFAULT_TTS_VOICE = 'af_heart';
