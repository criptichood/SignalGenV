import type { Timeframe } from '@/types';
import type { StateCreator } from 'zustand';
import type { SignalGenState } from '../types';

export interface FeaturesSlice {
  isScannerEnabled: boolean;
  scannerTimeframe: Timeframe;
  isAutoExecutionEnabled: boolean;
  autoExecutionThreshold: number;
  autoExecutionType: 'market' | 'trailing';
  isScanningSymbol: string | null;
  setIsScannerEnabled: (enabled: boolean) => void;
  setScannerTimeframe: (timeframe: Timeframe) => void;
  setIsAutoExecutionEnabled: (enabled: boolean) => void;
  setAutoExecutionThreshold: (threshold: number) => void;
  setAutoExecutionType: (type: 'market' | 'trailing') => void;
  setIsScanningSymbol: (symbol: string | null) => void;
}

export const createFeaturesSlice: StateCreator<SignalGenState, [], [], FeaturesSlice> = (set) => ({
  isScannerEnabled: false,
  scannerTimeframe: '4h',
  isAutoExecutionEnabled: false,
  autoExecutionThreshold: 85,
  autoExecutionType: 'trailing',
  isScanningSymbol: null,
  setIsScannerEnabled: (enabled) => set({ isScannerEnabled: enabled }),
  setScannerTimeframe: (timeframe) => set({ scannerTimeframe: timeframe }),
  setIsAutoExecutionEnabled: (enabled) => set({ isAutoExecutionEnabled: enabled }),
  setAutoExecutionThreshold: (threshold) => set({ autoExecutionThreshold: threshold }),
  setAutoExecutionType: (type) => set({ autoExecutionType: type }),
  setIsScanningSymbol: (symbol) => set({ isScanningSymbol: symbol }),
});
