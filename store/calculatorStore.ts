import { create } from 'zustand';

type Tab = 'leverage' | 'position' | 'risk';

interface CalculatorState {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export const useCalculatorStore = create<CalculatorState>((set) => ({
  activeTab: 'leverage',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
