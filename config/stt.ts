import { STTModel } from './types';

// Speech-to-text (provider hidden from users).
export const STT_MODELS: STTModel[] = [
  {
    key: 'stt-standard', id: 'nova-3', label: 'Standard', provider: 'deepgram',
    description: 'Fast, accurate transcription.', tier: 'free', realtime: true,
  },
];

export const DEFAULT_STT_KEY = 'stt-standard';
