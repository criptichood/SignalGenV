import React from 'react';
import { LivePriceChart } from '@/components/chart/LivePriceChart';
import { SignalCard } from '@/components/signal/SignalCard';
import { HistoryTable } from '@/components/HistoryTable';
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/DropdownMenu';
import { LayoutIcon } from '@/components/icons/LayoutIcon';
import { CheckIcon } from '@/components/icons/CheckIcon';
import { ErrorMessage } from '@/components/ErrorMessage';
import ErrorBoundary from '@/components/ErrorBoundary';
import type { CandleStick, Signal, UserParams, SavedSignal, Page } from '@/types';
import { BybitTradeDetails } from '@/services/executionService';
import { SignalGenerationState } from '@/hooks/useSignalGenerator';
import { useSignalGenStore } from '@/store/signalGenStore';

interface SignalGenDashboardProps {
  // Error props
  error: string | null;
  symbolsQueryError: Error | null;
  chartDataError: Error | null;
  setGenerationState: (updates: Partial<SignalGenerationState>) => void;

  // Chart props
  chartData: CandleStick[];
  livePrice: number | null;
  isChartLoading: boolean;
  signal: Signal | null;
  currentParams: UserParams | null;
  hitTpPricesForChart: number[];

  // SignalCard props
  displaySignal: (Signal & { symbol: string; currentPrice: number; timestamp: number; type: "Swing"; lastDataTimestamp?: number | undefined; }) | null;
  isAnalyzing: boolean;
  handleUpdateSignal: (updates: Partial<Signal>) => void;
  handleExecuteTrade: (tradeDetails: BybitTradeDetails) => Promise<any>;
  setToast: (toast: { message: string; variant: 'success' | 'warning' | 'error' } | null) => void;
  handleShare: () => void;

  // HistoryTable props
  signalHistory: SavedSignal[];
  setSignalHistory: (fn: (prev: SavedSignal[]) => SavedSignal[]) => void;
  setCurrentPage: (page: Page) => void;
  handleRestoreFromHistory: (signal: SavedSignal) => void;
}

export const SignalGenDashboard = (props: SignalGenDashboardProps) => {
  const {
    isNewSignal, isCurrentSignalExecuted,
    windowsState, toggleWindow,
    setSelectedSignal, setIsModalOpen
  } = useSignalGenStore();
  const { formData } = useSignalGenStore();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Signal Generator</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 text-sm font-semibold bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 hover:bg-gray-700 transition-colors"><LayoutIcon className="w-4 h-4 text-cyan-400"/>Layout</button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => toggleWindow('favorites')}><span className="w-5">{windowsState.favorites.isOpen && <CheckIcon className="w-4 h-4 text-cyan-400" />}</span>Favorite Pairs</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleWindow('orderBook')}><span className="w-5">{windowsState.orderBook.isOpen && <CheckIcon className="w-4 h-4 text-cyan-400" />}</span>Order Book</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleWindow('timeAndSales')}><span className="w-5">{windowsState.timeAndSales.isOpen && <CheckIcon className="w-4 h-4 text-cyan-400" />}</span>Time &amp; Sales</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {props.error && <ErrorMessage message={props.error} onClose={() => props.setGenerationState({ error: null })} />}
      {props.symbolsQueryError && <ErrorMessage message={props.symbolsQueryError.message} onClose={() => {}} />}
      {props.chartDataError && <ErrorMessage message={`Failed to load chart data for ${formData.symbol}. Retrying...`} onClose={() => { }} />}

      <ErrorBoundary>
        <LivePriceChart
          symbol={formData.symbol ? `${formData.symbol} (${formData.exchange})` : ''}
          data={props.chartData}
          currentPrice={props.livePrice}
          isLoading={props.isChartLoading}
          signal={props.signal}
          signalParams={props.currentParams}
          hitTpLevels={props.hitTpPricesForChart}
        />
      </ErrorBoundary>

      <SignalCard
        signal={props.displaySignal}
        isLoading={props.isAnalyzing}
        isNew={isNewSignal}
        onUpdateSignal={!props.isAnalyzing && props.signal ? props.handleUpdateSignal : undefined}
        currentParams={props.currentParams}
        onExecute={(tradeDetails) => {
            if (props.signal && props.currentParams) { return props.handleExecuteTrade(tradeDetails); }
            const err = 'Cannot execute: signal/params missing.';
            props.setToast({ message: err, variant: 'error'});
            return Promise.reject(new Error(err));
        }}
        isExecuted={isCurrentSignalExecuted}
        onExpire={() => {
            if (props.signal) {
                props.setToast({ message: `Signal for ${props.currentParams?.symbol} expired.`, variant: 'warning' });
                props.setGenerationState({ signal: null, currentParams: null });
            }
        }}
        setToast={props.setToast}
        onShareAsPost={props.handleShare}
      />

      <div className="mt-6">
        <HistoryTable
          data={props.signalHistory}
          isDashboardView={true}
          onDelete={(id) => props.setSignalHistory(prev => prev.filter(s => s.id !== id))}
          onUpdateStatus={(id, status) => props.setSignalHistory(prev => prev.map(s => (s.id === id ? { ...s, status } : s)))}
          onViewDetails={(signal) => { setSelectedSignal(signal); setIsModalOpen(true); }}
          onViewAll={() => props.setCurrentPage('history')}
          onRestore={props.handleRestoreFromHistory}
        />
      </div>
    </div>
  );
};
