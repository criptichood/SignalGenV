import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SimulationSetup, Exchange } from '@/types';

interface SimulationState {
  simulations: SimulationSetup[];
  setSimulations: (fn: (prev: SimulationSetup[]) => SimulationSetup[]) => void;
  exchange: Exchange;
  setExchange: (exchange: Exchange) => void;
  activeSimulation: SimulationSetup | null;
  setActiveSimulation: (sim: SimulationSetup | null) => void;
  isAutoPlay: boolean;
  setIsAutoPlay: (autoPlay: boolean) => void;
}

export const useSimulationStore = create<SimulationState>()(
  persist(
    (set) => ({
      simulations: [],
      setSimulations: (fn) => set(state => ({ simulations: fn(state.simulations) })),
      exchange: 'binance',
      setExchange: (exchange) => set({ exchange }),
      activeSimulation: null,
      setActiveSimulation: (sim) => set({ activeSimulation: sim }),
      isAutoPlay: false,
      setIsAutoPlay: (autoPlay) => set({ isAutoPlay: autoPlay }),
    }),
    {
      name: 'simulation-storage',
      partialize: (state) => ({
        simulations: state.simulations,
        exchange: state.exchange,
      }),
    }
  )
);