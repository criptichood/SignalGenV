import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Page, ChatIconType, Theme, ThemeMode, ThemeAccent } from '@/types';

interface AppState {
  // API Keys
  bybitApiKey: string;
  bybitApiSecret: string;
  binanceApiKey: string;
  binanceApiSecret: string;
  setBybitApiKey: (key: string) => void;
  setBybitApiSecret: (key: string) => void;
  setBinanceApiKey: (key: string) => void;
  setBinanceApiSecret: (key: string) => void;

  // Auth State
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;

  // UI State
  currentPage: Page;
  isSidebarOpen: boolean;
  isChatOpen: boolean;
  toast: { message: string; variant: 'success' | 'warning' | 'error' } | null;
  chatFabPosition: { x: number; y: number } | null;
  setCurrentPage: (page: Page) => void;
  setIsSidebarOpen: (isOpen: boolean) => void;
  setIsChatOpen: (isOpen: boolean) => void;
  setToast: (toast: AppState['toast']) => void;
  setChatFabPosition: (position: { x: number; y: number }) => void;

  // Settings
  theme: Theme;
  audioAlertsEnabled: boolean;
  cloudSyncEnabled: boolean;
  contextualChatEnabled: boolean;
  functionCallingEnabled: boolean;
  chatIcon: ChatIconType;
  setThemeMode: (mode: ThemeMode) => void;
  setThemeAccent: (accent: ThemeAccent) => void;
  setAudioAlertsEnabled: (enabled: boolean) => void;
  setCloudSyncEnabled: (enabled: boolean) => void;
  setContextualChatEnabled: (enabled: boolean) => void;
  setFunctionCallingEnabled: (enabled: boolean) => void;
  setChatIcon: (icon: ChatIconType) => void;
  
  // Onboarding State
  isTourActive: boolean;
  tourStep: number;
  isTourCompleted: boolean;
  startTour: () => void;
  endTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  setTourStep: (step: number) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // --- STATE & SETTERS ---
      bybitApiKey: '',
      bybitApiSecret: '',
      binanceApiKey: '',
      binanceApiSecret: '',
      isAuthenticated: false,
      currentPage: 'dashboard',
      isSidebarOpen: false,
      isChatOpen: false,
      toast: null,
      chatFabPosition: null,
      theme: { mode: 'dark', accent: 'cyan' },
      audioAlertsEnabled: true,
      cloudSyncEnabled: false,
      contextualChatEnabled: true,
      functionCallingEnabled: true,
      chatIcon: 'bot',
      isTourActive: false,
      tourStep: 0,
      isTourCompleted: false,

      setBybitApiKey: (key) => set({ bybitApiKey: key }),
      setBybitApiSecret: (key) => set({ bybitApiSecret: key }),
      setBinanceApiKey: (key) => set({ binanceApiKey: key }),
      setBinanceApiSecret: (key) => set({ binanceApiSecret: key }),
      login: () => set({ isAuthenticated: true }),
      logout: () => set({ isAuthenticated: false, currentPage: 'dashboard' }), // Reset to dashboard on logout
      setCurrentPage: (page) => set({ currentPage: page }),
      setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
      setIsChatOpen: (isOpen) => set({ isChatOpen: isOpen }),
      setToast: (toast) => set({ toast }),
      setChatFabPosition: (position) => set({ chatFabPosition: position }),
      setThemeMode: (mode) => set(state => ({ theme: { ...state.theme, mode } })),
      setThemeAccent: (accent) => set(state => ({ theme: { ...state.theme, accent } })),
      setAudioAlertsEnabled: (enabled) => set({ audioAlertsEnabled: enabled }),
      setCloudSyncEnabled: (enabled) => set({ cloudSyncEnabled: enabled }),
      setContextualChatEnabled: (enabled) => set({ contextualChatEnabled: enabled }),
      setFunctionCallingEnabled: (enabled) => set({ functionCallingEnabled: enabled }),
      setChatIcon: (icon) => set({ chatIcon: icon }),
      startTour: () => set({ isTourActive: true, tourStep: 0 }),
      endTour: () => set({ isTourActive: false, isTourCompleted: true }),
      nextTourStep: () => set(state => ({ tourStep: state.tourStep + 1 })),
      prevTourStep: () => set(state => ({ tourStep: Math.max(0, state.tourStep - 1) })),
      setTourStep: (step) => set({ tourStep: step }),
    }),
    {
      name: 'signal-gen-storage',
      // Persist only settings and API keys. UI state is transient.
      partialize: (state) => ({
        bybitApiKey: state.bybitApiKey,
        bybitApiSecret: state.bybitApiSecret,
        binanceApiKey: state.binanceApiKey,
        binanceApiSecret: state.binanceApiSecret,
        isAuthenticated: state.isAuthenticated, // Persist auth state
        theme: state.theme,
        audioAlertsEnabled: state.audioAlertsEnabled,
        cloudSyncEnabled: state.cloudSyncEnabled,
        contextualChatEnabled: state.contextualChatEnabled,
        functionCallingEnabled: state.functionCallingEnabled,
        chatIcon: state.chatIcon,
        chatFabPosition: state.chatFabPosition,
        isTourCompleted: state.isTourCompleted,
      }),
    }
  )
);