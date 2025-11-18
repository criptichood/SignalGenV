import type { ScalpingPreset } from '@/types';
import type { StateCreator } from 'zustand';
import type { SignalGenState } from '../types';

export interface SettingsSlice {
  swingPresets: ScalpingPreset[];
  favoriteSwingSymbols: string[];
  setSwingPresets: (fn: (prev: ScalpingPreset[]) => ScalpingPreset[]) => void;
  setFavoriteSwingSymbols: (fn: (prev: string[]) => string[]) => void;
}

export const createSettingsSlice: StateCreator<SignalGenState, [], [], SettingsSlice> = (set) => ({
  swingPresets: [],
  favoriteSwingSymbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'LINKUSDT', 'AVAXUSDT', 'MATICUSDT'],
  setSwingPresets: (fn) => set(state => ({ swingPresets: fn(state.swingPresets) })),
  setFavoriteSwingSymbols: (fn) => set(state => ({ favoriteSwingSymbols: fn(state.favoriteSwingSymbols) })),
});
