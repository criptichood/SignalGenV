import type { AiModel } from '@/types';

export const AI_MODELS: AiModel[] = [
  { 
    id: 'gemini-2.5-flash', 
    name: 'Gemini 2.5 Flash', 
    provider: 'gemini',
    description: 'Fast, efficient, and cost-effective. Ideal for general purpose tasks.'
  },
  { 
    id: 'gemini-2.5-pro', 
    name: 'Gemini 2.5 Pro', 
    provider: 'gemini',
    description: "Google's most capable model, for advanced reasoning and complex analysis."
  },
];