import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ScreenerRun, ScreenerResult } from '@/types';

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

interface ScreenerState {
  runs: ScreenerRun[];
  startScan: (query: string) => string;
  completeScan: (id: string, results: ScreenerResult[]) => void;
  failScan: (id: string, error: string) => void;
  deleteScan: (id: string) => void;
  clearHistory: () => void;
  pruneOldScans: () => void;
}

export const useScreenerStore = create<ScreenerState>()(
  persist(
    (set, get) => ({
      runs: [],
      startScan: (query) => {
        const newRun: ScreenerRun = {
          id: crypto.randomUUID(),
          timestamp: Date.now(),
          query,
          results: [],
          isLoading: true,
          error: null,
        };
        set(state => ({ runs: [newRun, ...state.runs] }));
        return newRun.id;
      },
      completeScan: (id, results) => {
        set(state => ({
          runs: state.runs.map(run => 
            run.id === id ? { ...run, results, isLoading: false, error: null } : run
          ),
        }));
      },
      failScan: (id, error) => {
        set(state => ({
          runs: state.runs.map(run => 
            run.id === id ? { ...run, isLoading: false, error } : run
          ),
        }));
      },
      deleteScan: (id) => {
        set(state => ({ runs: state.runs.filter(run => run.id !== id) }));
      },
      clearHistory: () => {
        set({ runs: [] });
      },
      pruneOldScans: () => {
        const now = Date.now();
        set(state => ({
          runs: state.runs.filter(run => now - run.timestamp < SEVEN_DAYS_IN_MS),
        }));
      },
    }),
    {
      name: 'market-screener-storage',
    }
  )
);