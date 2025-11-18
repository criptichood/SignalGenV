import type { SavedSignal } from '@/types';
import type { StateCreator } from 'zustand';
import type { SignalGenState, WindowsState } from '../types';

export interface UISlice {
  selectedSignal: SavedSignal | null;
  isModalOpen: boolean;
  isNewSignal: boolean;
  isCurrentSignalExecuted: boolean;
  isSignalEntered: boolean;
  isControlsOpen: boolean;
  windowsState: WindowsState;
  setSelectedSignal: (signal: SavedSignal | null) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  setIsNewSignal: (isNew: boolean) => void;
  setIsCurrentSignalExecuted: (isExecuted: boolean) => void;
  setIsSignalEntered: (isEntered: boolean) => void;
  setIsControlsOpen: (isOpen: boolean) => void;
  handlePositionChange: (id: keyof WindowsState, newPosition: { x: number, y: number }) => void;
  toggleWindow: (id: keyof WindowsState) => void;
  toggleMinimize: (id: keyof WindowsState) => void;
}

export const createUISlice: StateCreator<SignalGenState, [], [], UISlice> = (set) => ({
  selectedSignal: null,
  isModalOpen: false,
  isNewSignal: false,
  isCurrentSignalExecuted: false,
  isSignalEntered: false,
  isControlsOpen: true,
  windowsState: {
    orderBook: { isOpen: false, isMinimized: false, position: { x: window.innerWidth - 340, y: 96 } },
    timeAndSales: { isOpen: false, isMinimized: false, position: { x: window.innerWidth - 340, y: 560 } },
    favorites: { isOpen: false, isMinimized: false, position: { x: 400, y: 96 } },
  },
  setSelectedSignal: (signal) => set({ selectedSignal: signal }),
  setIsModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
  setIsNewSignal: (isNew) => set({ isNewSignal: isNew }),
  setIsCurrentSignalExecuted: (isExecuted) => set({ isCurrentSignalExecuted: isExecuted }),
  setIsSignalEntered: (isEntered) => set({ isSignalEntered: isEntered }),
  setIsControlsOpen: (isOpen) => set({ isControlsOpen: isOpen }),
  handlePositionChange: (id, newPosition) => set(state => ({
    windowsState: { ...state.windowsState, [id]: { ...state.windowsState[id], position: newPosition } }
  })),
  toggleWindow: (id) => set(state => ({
    windowsState: { ...state.windowsState, [id]: { ...state.windowsState[id], isOpen: !state.windowsState[id].isOpen } }
  })),
  toggleMinimize: (id) => set(state => ({
    windowsState: { ...state.windowsState, [id]: { ...state.windowsState[id], isMinimized: !state.windowsState[id].isMinimized } }
  })),
});
