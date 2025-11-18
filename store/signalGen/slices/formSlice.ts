import type { UserParams } from '@/types';
import type { StateCreator } from 'zustand';
import type { SignalGenState } from '../types';
import { AI_MODELS } from '@/constants';

export interface FormSlice {
  formData: Partial<UserParams>;
  setFormData: (fn: (prev: Partial<UserParams>) => Partial<UserParams>) => void;
}

export const createFormSlice: StateCreator<SignalGenState, [], [], FormSlice> = (set) => ({
  formData: {
    exchange: 'binance',
    model: AI_MODELS[0].id,
    symbol: 'BTCUSDT',
    timeframe: '4h',
    opportunityDuration: 'Any time frame',
    margin: 50,
    risk: 0.2,
    leverage: 20,
    customLeverage: 100,
    forceLeverage: false,
    allowHighLeverage: false,
    customAiParams: '',
  },
  setFormData: (fn) => set(state => ({ formData: fn(state.formData) })),
});
