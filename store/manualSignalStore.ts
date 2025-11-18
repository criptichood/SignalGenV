import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserParams, Signal, AIFeedback, Exchange, Timeframe } from '@/types';

interface ManualSignalState {
    formData: {
        exchange: Exchange;
        symbol: string;
        timeframe: Timeframe;
        direction: 'LONG' | 'SHORT';
        entry: string;
        sl: string;
        tp1: string;
        tp2: string;
        tp3: string;
        margin: string;
        leverage: string;
        duration: string;
        reasoning: string;
    };
    setFormData: (fn: (prev: ManualSignalState['formData']) => ManualSignalState['formData']) => void;

    manualSignal: Signal | null;
    setManualSignal: (signal: Signal | null) => void;

    aiFeedback: AIFeedback | null;
    setAiFeedback: (feedback: AIFeedback | null) => void;

    isStaging: boolean;
    setIsStaging: (isStaging: boolean) => void;
}

const functionalSetter = <T,>(set: (fn: (state: ManualSignalState) => Partial<ManualSignalState>) => void, key: keyof ManualSignalState) =>
  (fn: (prev: T) => T) =>
    set(state => ({
      [key]: fn(state[key] as T)
    }));

export const useManualSignalStore = create<ManualSignalState>()(
  persist(
    (set) => ({
      formData: {
        exchange: 'binance',
        symbol: 'BTCUSDT',
        timeframe: '1h',
        direction: 'LONG',
        entry: '',
        sl: '',
        tp1: '',
        tp2: '',
        tp3: '',
        margin: '50',
        leverage: '20',
        duration: '1hr - 2hr',
        reasoning: '',
      },
      setFormData: functionalSetter(set, 'formData'),

      manualSignal: null,
      setManualSignal: (signal) => set({ manualSignal: signal }),

      aiFeedback: null,
      setAiFeedback: (feedback) => set({ aiFeedback: feedback }),

      isStaging: false,
      setIsStaging: (isStaging) => set({ isStaging }),
    }),
    {
      name: 'manual-signal-studio-storage',
      partialize: (state) => ({
        formData: state.formData,
      }),
    }
  )
);