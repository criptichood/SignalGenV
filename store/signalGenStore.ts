import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SignalGenState } from './signalGen/types';
import { createFormSlice } from './signalGen/slices/formSlice';
import { createSettingsSlice } from './signalGen/slices/settingsSlice';
import { createFeaturesSlice } from './signalGen/slices/featuresSlice';
import { createUISlice } from './signalGen/slices/uiSlice';

export const useSignalGenStore = create<SignalGenState>()(
  persist(
    (set, get, api) => ({
      ...createFormSlice(set, get, api),
      ...createSettingsSlice(set, get, api),
      ...createFeaturesSlice(set, get, api),
      ...createUISlice(set, get, api),
    }),
    {
      name: 'signal-gen-page-storage',
      partialize: (state) => ({
        // Persist form data, user settings, and window positions
        formData: state.formData,
        swingPresets: state.swingPresets,
        favoriteSwingSymbols: state.favoriteSwingSymbols,
        isScannerEnabled: state.isScannerEnabled,
        scannerTimeframe: state.scannerTimeframe,
        isAutoExecutionEnabled: state.isAutoExecutionEnabled,
        autoExecutionThreshold: state.autoExecutionThreshold,
        autoExecutionType: state.autoExecutionType,
        windowsState: state.windowsState,
      }),
    }
  )
);
