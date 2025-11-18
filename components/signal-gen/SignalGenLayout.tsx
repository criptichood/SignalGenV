import React from 'react';
import { Controls } from '@/components/signal-gen/Controls';
import { SignalGenDashboard } from './SignalGenDashboard';
import { FloatingWindows } from './FloatingWindows';
import { SignalDetailModal } from '@/components/SignalDetailModal';
import { ChevronsLeftIcon } from '@/components/icons/ChevronsLeftIcon';
import { ChevronsRightIcon } from '@/components/icons/ChevronsRightIcon';
import type { Signal, SavedSignal, CandleStick, LiveTrade, OrderBookUpdate, Page } from '@/types';
import { BybitTradeDetails } from '@/services/executionService';
import { SignalGenerationState } from '@/hooks/useSignalGenerator';
import { useSignalGenStore } from '@/store/signalGenStore';

interface SignalGenLayoutProps {
  symbols: string[];
  isAnalyzing: boolean;
  chartData: CandleStick[];
  livePrice: number | null;
  isChartLoading: boolean;
  signal: Signal | null;
  currentParams: any;
  hitTpPricesForChart: number[];
  displaySignal: any;
  liveTrades: LiveTrade[];
  orderBookData: OrderBookUpdate | null;
  signalHistory: SavedSignal[];
  symbolsQueryError: Error | null;
  chartDataError: Error | null;
  error: string | null;
  setToast: (toast: { message: string; variant: 'success' | 'warning' | 'error' } | null) => void;

  setGenerationState: (updates: Partial<SignalGenerationState>) => void;
  setCurrentPage: (page: Page) => void;
  setSignalHistory: (fn: (prev: SavedSignal[]) => SavedSignal[]) => void;
  handleSubmit: (params: any, model: any) => void;
  handleExecuteTrade: (tradeDetails: BybitTradeDetails) => Promise<any>;
  handleUpdateSignal: (updates: Partial<Signal>) => void;
  handleRestoreFromHistory: (signalToRestore: SavedSignal) => void;
  handleShare: () => void;
  handleCancel: () => void;
}

export const SignalGenLayout = (props: SignalGenLayoutProps) => {
  const { isControlsOpen, setIsControlsOpen, isModalOpen, selectedSignal, setIsModalOpen } = useSignalGenStore();

  return (
    <>
      <div className={`fixed top-0 h-full z-50 transition-all duration-300 ease-in-out w-96 ${isControlsOpen ? 'left-0 lg:left-64' : '-left-96'}`}>
        <Controls
          symbols={props.symbols}
          isAnalyzing={props.isAnalyzing}
          onSubmit={props.handleSubmit}
          onCancel={props.handleCancel}
        />
      </div>

      <button onClick={() => setIsControlsOpen(!isControlsOpen)} className={`fixed top-1/2 -translate-y-1/2 z-50 bg-gray-800/80 backdrop-blur-md p-2 rounded-r-lg border-y border-r border-gray-700/70 hover:bg-gray-700 transition-all duration-300 ease-in-out ${isControlsOpen ? 'left-96 lg:left-[40rem]' : 'left-0 lg:left-64'}`} aria-label={isControlsOpen ? "Close Controls" : "Open Controls"}>
        {isControlsOpen ? <ChevronsLeftIcon className="w-5 h-5 text-gray-300" /> : <ChevronsRightIcon className="w-5 h-5 text-cyan-400" />}
      </button>
      
      {isControlsOpen && (<div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setIsControlsOpen(false)}></div>)}

      <div className={`transition-all duration-300 ease-in-out ${isControlsOpen ? 'lg:ml-96' : ''}`}>
        <SignalGenDashboard
            error={props.error}
            symbolsQueryError={props.symbolsQueryError}
            chartDataError={props.chartDataError}
            setGenerationState={props.setGenerationState}
            chartData={props.chartData}
            livePrice={props.livePrice}
            isChartLoading={props.isChartLoading}
            signal={props.signal}
            currentParams={props.currentParams}
            hitTpPricesForChart={props.hitTpPricesForChart}
            displaySignal={props.displaySignal}
            isAnalyzing={props.isAnalyzing}
            handleUpdateSignal={props.handleUpdateSignal}
            handleExecuteTrade={props.handleExecuteTrade}
            setToast={props.setToast}
            handleShare={props.handleShare}
            signalHistory={props.signalHistory}
            setSignalHistory={props.setSignalHistory}
            setCurrentPage={props.setCurrentPage}
            handleRestoreFromHistory={props.handleRestoreFromHistory}
        />
      </div>
      
      <FloatingWindows
        isAnalyzing={props.isAnalyzing}
        orderBookData={props.orderBookData}
        livePrice={props.livePrice}
        liveTrades={props.liveTrades}
      />

      {isModalOpen && selectedSignal && (
          <SignalDetailModal signal={selectedSignal} onClose={() => setIsModalOpen(false)} setToast={props.setToast} />
      )}
    </>
  );
};
