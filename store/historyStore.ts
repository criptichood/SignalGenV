import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SavedSignal, SpotTrade, PerpTrade } from '@/types';

interface HistoryState {
  signalHistory: SavedSignal[];
  spotTrades: SpotTrade[];
  perpTrades: PerpTrade[];
  setSignalHistory: (fn: (prev: SavedSignal[]) => SavedSignal[]) => void;
  setSpotTrades: (fn: (prev: SpotTrade[]) => SpotTrade[]) => void;
  setPerpTrades: (fn: (prev: PerpTrade[]) => PerpTrade[]) => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      signalHistory: [],
      spotTrades: [],
      perpTrades: [],
      setSignalHistory: (fn) => set(state => ({ signalHistory: fn(state.signalHistory) })),
      setSpotTrades: (fn) => set(state => ({ spotTrades: fn(state.spotTrades) })),
      setPerpTrades: (fn) => set(state => ({ perpTrades: fn(state.perpTrades) })),
    }),
    {
      name: 'trading-history-storage',
    }
  )
);