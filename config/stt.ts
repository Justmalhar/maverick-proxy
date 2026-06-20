import { STTModel } from './types';

// Curated speech-to-text models.
export const STT_MODELS: STTModel[] = [
  {
    id: 'whisper-large-v3-turbo', label: 'Whisper Turbo', provider: 'groq',
    description: 'Fast, accurate transcription.', tier: 'free',
  },
  {
    id: 'whisper-large-v3', label: 'Whisper v3', provider: 'groq',
    description: 'Highest-accuracy Whisper.', tier: 'free',
  },
  {
    id: 'nova-3', label: 'Deepgram Nova 3', provider: 'deepgram',
    description: 'Realtime-grade transcription.', tier: 'pro', realtime: true,
  },
  {
    id: 'gpt-4o-transcribe', label: 'GPT-4o Transcribe', provider: 'openai',
    description: 'OpenAI transcription.', tier: 'pro',
  },
];

export const DEFAULT_STT_ID = 'whisper-large-v3-turbo';
