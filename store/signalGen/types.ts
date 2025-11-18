import type { UserParams, SavedSignal, ScalpingPreset, Timeframe } from '@/types';
import { FormSlice } from './slices/formSlice';
import { SettingsSlice } from './slices/settingsSlice';
import { FeaturesSlice } from './slices/featuresSlice';
import { UISlice } from './slices/uiSlice';

export interface WindowsState {
  orderBook: { isOpen: boolean; isMinimized: boolean; position: { x: number; y: number } };
  timeAndSales: { isOpen: boolean; isMinimized: boolean; position: { x: number; y: number } };
  favorites: { isOpen: boolean; isMinimized: boolean; position: { x: number; y: number } };
}

// The complete state is an intersection of all slice types
export type SignalGenState = FormSlice & SettingsSlice & FeaturesSlice & UISlice;
