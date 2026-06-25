import { STTModel } from './types';

// Speech-to-text (provider hidden from users).
export const STT_MODELS: STTModel[] = [
  {
    key: 'stt-standard', id: 'whisper-large-v3-turbo', label: 'Standard', provider: 'groq',
    description: 'Fast, accurate transcription.', tier: 'free', realtime: true,
  },
];

export const DEFAULT_STT_KEY = 'stt-standard';
