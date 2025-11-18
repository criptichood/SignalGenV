import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  UserParams,
  ScalpingPreset,
  SavedSignal,
  LivePosition,
  PerpTrade,
  TrackedSignal,
  ScannerTimeframe,
  AutopilotState,
  AutopilotSettings,
  AutopilotSessionStats,
  AutopilotScanMode,
} from '@/types';
import { AI_MODELS } from '@/constants';

interface WindowsState {
  orderBook: { isOpen: boolean; isMinimized: boolean; position: { x: number; y: number } };
  timeAndSales: { isOpen: boolean; isMinimized: boolean; position: { x: number; y: number } };
  favorites: { isOpen: boolean; isMinimized: boolean; position: { x: number; y: number } };
}

// FIX: Export the ScalpingState interface.
export interface ScalpingState {
  // Form State from controller
  formData: Partial<UserParams>;
  setFormData: (fn: (prev: Partial<UserParams>) => Partial<UserParams>) => void;

  // States from useLocalStorage
  scalpingPresets: ScalpingPreset[];
  favoriteScalpSymbols: string[];
  livePositions: LivePosition[];
  activePositionIds: string[];
  perpTrades: PerpTrade[];
  trackedSignals: TrackedSignal[];
  isScannerEnabled: boolean;
  scannerTimeframe: ScannerTimeframe;
  isAutoExecutionEnabled: boolean;
  autoExecutionThreshold: number;
  autoExecutionType: 'market' | 'trailing';
  oneClickTradingEnabled: boolean;
  autopilotSettings: AutopilotSettings;
  autopilotScanMode: AutopilotScanMode;

  // States from useState
  isControlsOpen: boolean;
  selectedSignal: SavedSignal | null;
  isModalOpen: boolean;
  isNewSignal: boolean;
  isCurrentSignalExecuted: boolean;
  isSignalEntered: boolean;
  windowsState: WindowsState;
  isScanningSymbol: string | null;
  autopilotState: AutopilotState;
  autopilotSessionStats: AutopilotSessionStats;
  activeAutopilotPositionId: string | null;

  // Actions
  setScalpingPresets: (fn: (prev: ScalpingPreset[]) => ScalpingPreset[]) => void;
  // FIX: Update the type to be compatible with React's state setter pattern.
  setFavoriteScalpSymbols: (updater: string[] | ((prev: string[]) => string[])) => void;
  setLivePositions: (fn: (prev: LivePosition[]) => LivePosition[]) => void;
  setActivePositionIds: (fn: (prev: string[]) => string[]) => void;
  setPerpTrades: (fn: (prev: PerpTrade[]) => PerpTrade[]) => void;
  setTrackedSignals: (fn: (prev: TrackedSignal[]) => TrackedSignal[]) => void;
  setIsScannerEnabled: (enabled: boolean) => void;
  setScannerTimeframe: (timeframe: ScannerTimeframe) => void;
  setIsAutoExecutionEnabled: (enabled: boolean) => void;
  setAutoExecutionThreshold: (threshold: number) => void;
  setAutoExecutionType: (type: 'market' | 'trailing') => void;
  setOneClickTradingEnabled: (enabled: boolean) => void;
  setAutopilotSettings: (settings: AutopilotSettings) => void;
  setAutopilotScanMode: (mode: AutopilotScanMode) => void;

  setIsControlsOpen: (isOpen: boolean) => void;
  setSelectedSignal: (signal: SavedSignal | null) => void;
  setIsModalOpen: (isOpen: boolean) => void;
  setIsNewSignal: (isNew: boolean) => void;
  setIsCurrentSignalExecuted: (isExecuted: boolean) => void;
  setIsSignalEntered: (isEntered: boolean) => void;
  setIsScanningSymbol: (symbol: string | null) => void;
  setAutopilotState: (state: AutopilotState) => void;
  setAutopilotSessionStats: (fn: (prev: AutopilotSessionStats) => AutopilotSessionStats) => void;
  setActiveAutopilotPositionId: (id: string | null) => void;

  handlePositionChange: (id: keyof WindowsState, newPosition: { x: number, y: number }) => void;
  toggleWindow: (id: keyof WindowsState) => void;
  toggleMinimize: (id: keyof WindowsState) => void;
}

const functionalSetter = <T,>(set: (fn: (state: ScalpingState) => Partial<ScalpingState>) => void, key: keyof ScalpingState) =>
  (fn: (prev: T) => T) =>
    set(state => ({
      [key]: fn(state[key] as T)
    }));

export const useScalpingStore = create<ScalpingState>()(
  persist(
    (set) => ({
      // Form State
      formData: {
        exchange: 'binance',
        model: AI_MODELS[0].id,
        symbol: 'BTCUSDT',
        timeframe: '5m',
        margin: 50,
        risk: 0.2,
        leverage: 20,
        customLeverage: 50,
        allowHighLeverage: false,
        tradingStyle: 'Balanced',
      },

      // States from useLocalStorage
      scalpingPresets: [],
      favoriteScalpSymbols: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT', 'LINKUSDT', 'AVAXUSDT', 'ARBUSDT', 'OPUSDT', 'NEARUSDT', 'APTUSDT', 'MATICUSDT', 'ADAUSDT', 'SEIUSDT', 'TONUSDT', 'DOTUSDT', 'TRXUSDT', 'SUIUSDT', 'BLURUSDT', 'WLDUSDT', 'INJUSDT'],
      livePositions: [],
      activePositionIds: [],
      perpTrades: [],
      trackedSignals: [],
      isScannerEnabled: false,
      scannerTimeframe: '15m',
      isAutoExecutionEnabled: false,
      autoExecutionThreshold: 85,
      autoExecutionType: 'trailing',
      oneClickTradingEnabled: false,
      autopilotSettings: {
        sessionCapital: 1000, tradeSizeMode: 'fixed', tradeSizeValue: 25, cooldownMinutes: 5, maxSessionDrawdown: 10, maxTrades: 20,
      },
      autopilotScanMode: 'current',

      // States from useState
      isControlsOpen: true,
      selectedSignal: null,
      isModalOpen: false,
      isNewSignal: false,
      isCurrentSignalExecuted: false,
      isSignalEntered: false,
      windowsState: {
        orderBook: { isOpen: false, isMinimized: false, position: { x: window.innerWidth - 340, y: 96 } },
        timeAndSales: { isOpen: false, isMinimized: false, position: { x: window.innerWidth - 340, y: 560 } },
        favorites: { isOpen: false, isMinimized: false, position: { x: 400, y: 96 } },
      },
      isScanningSymbol: null,
      autopilotState: 'inactive',
      autopilotSessionStats: {
        initialCapital: 0, currentCapital: 0, startTime: null, pnl: 0, tradesExecuted: 0, drawdown: 0, statusMessage: 'Ready to start.',
      },
      activeAutopilotPositionId: null,

      // Actions
      setFormData: functionalSetter(set, 'formData'),
      setScalpingPresets: functionalSetter(set, 'scalpingPresets'),
      // FIX: Implement a more flexible setter to match React's SetStateAction type.
      setFavoriteScalpSymbols: (updater) => set(state => ({ favoriteScalpSymbols: typeof updater === 'function' ? updater(state.favoriteScalpSymbols) : updater })),
      setLivePositions: functionalSetter(set, 'livePositions'),
      setActivePositionIds: functionalSetter(set, 'activePositionIds'),
      setPerpTrades: functionalSetter(set, 'perpTrades'),
      setTrackedSignals: functionalSetter(set, 'trackedSignals'),
      setIsScannerEnabled: (enabled) => set({ isScannerEnabled: enabled }),
      setScannerTimeframe: (timeframe) => set({ scannerTimeframe: timeframe }),
      setIsAutoExecutionEnabled: (enabled) => set({ isAutoExecutionEnabled: enabled }),
      setAutoExecutionThreshold: (threshold) => set({ autoExecutionThreshold: threshold }),
      setAutoExecutionType: (type) => set({ autoExecutionType: type }),
      setOneClickTradingEnabled: (enabled) => set({ oneClickTradingEnabled: enabled }),
      setAutopilotSettings: (settings) => set({ autopilotSettings: settings }),
      setAutopilotScanMode: (mode) => set({ autopilotScanMode: mode }),

      setIsControlsOpen: (isOpen) => set({ isControlsOpen: isOpen }),
      setSelectedSignal: (signal) => set({ selectedSignal: signal }),
      setIsModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
      setIsNewSignal: (isNew) => set({ isNewSignal: isNew }),
      setIsCurrentSignalExecuted: (isExecuted) => set({ isCurrentSignalExecuted: isExecuted }),
      setIsSignalEntered: (isEntered) => set({ isSignalEntered: isEntered }),
      setIsScanningSymbol: (symbol) => set({ isScanningSymbol: symbol }),
      setAutopilotState: (state) => set({ autopilotState: state }),
      setAutopilotSessionStats: functionalSetter(set, 'autopilotSessionStats'),
      setActiveAutopilotPositionId: (id) => set({ activeAutopilotPositionId: id }),
      
      handlePositionChange: (id, newPosition) => set(state => ({
        windowsState: { ...state.windowsState, [id]: { ...state.windowsState[id], position: newPosition } }
      })),
      toggleWindow: (id) => set(state => ({
        windowsState: { ...state.windowsState, [id]: { ...state.windowsState[id], isOpen: !state.windowsState[id].isOpen } }
      })),
      toggleMinimize: (id) => set(state => ({
        windowsState: { ...state.windowsState, [id]: { ...state.windowsState[id], isMinimized: !state.windowsState[id].isMinimized } }
      })),
    }),
    {
      name: 'scalping-page-storage',
      partialize: (state) => ({
        formData: state.formData,
        scalpingPresets: state.scalpingPresets,
        favoriteScalpSymbols: state.favoriteScalpSymbols,
        livePositions: state.livePositions,
        activePositionIds: state.activePositionIds,
        perpTrades: state.perpTrades,
        trackedSignals: state.trackedSignals,
        isScannerEnabled: state.isScannerEnabled,
        scannerTimeframe: state.scannerTimeframe,
        isAutoExecutionEnabled: state.isAutoExecutionEnabled,
        autoExecutionThreshold: state.autoExecutionThreshold,
        autoExecutionType: state.autoExecutionType,
        oneClickTradingEnabled: state.oneClickTradingEnabled,
        autopilotSettings: state.autopilotSettings,
        autopilotScanMode: state.autopilotScanMode,
      }),
    }
  )
);