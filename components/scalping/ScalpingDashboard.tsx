import React from 'react';
import { LivePriceChart } from '@/components/chart/LivePriceChart';
import { SignalCard } from '@/components/signal/SignalCard';
import { HistoryTable } from '@/components/HistoryTable';
import { LivePositions } from './LivePositions';
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/DropdownMenu';
import { LayoutIcon } from '@/components/icons/LayoutIcon';
import { CheckIcon } from '@/components/icons/CheckIcon';
import ErrorBoundary from '@/components/ErrorBoundary';
import type { CandleStick, Signal, UserParams, SavedSignal, LivePosition } from '@/types';
import { BybitTradeDetails } from '@/services/executionService';

interface ScalpingDashboardProps {
  // Chart props
  chartData: CandleStick[];
  symbol: string | undefined;
  exchange: string | undefined;
  livePrice: number | null;
  isChartLoading: boolean;
  signal: Signal | null;
  currentParams: UserParams | null;
  hitTpPricesForChart: number[];
  livePositions: LivePosition[];
  handleModifyPosition: (positionId: string, newTp?: number, newSl?: number) => Promise<void>;

  // SignalCard props
  displaySignal: (Signal & { symbol: string; currentPrice: number; timestamp: number; type: "Scalp"; lastDataTimestamp?: number | undefined; }) | null;
  isAnalyzing: boolean;
  isNewSignal: boolean;
  handleUpdateSignal: (updates: Partial<Signal>) => void;
  handleExecuteTrade: (tradeDetails: BybitTradeDetails, execSignal: Signal, execParams: UserParams) => Promise<LivePosition>;
  isCurrentSignalExecuted: boolean;
  handleSignalExpire: () => void;
  setToast: (toast: { message: string; variant: 'success' | 'warning' | 'error' } | null) => void;
  handleShare: () => void;

  // HistoryTable props
  signalHistory: SavedSignal[];
  handleHistoryDelete: (id: string) => void;
  handleHistoryUpdateStatus: (id: string, status: SavedSignal['status']) => void;
  handleHistoryViewDetails: (signal: SavedSignal) => void;
  handleRestoreFromHistory: (signal: SavedSignal) => void;

  // Layout props
  windowsState: { favorites: { isOpen: boolean }; orderBook: { isOpen: boolean }; timeAndSales: { isOpen: boolean } };
  toggleWindow: (id: 'favorites' | 'orderBook' | 'timeAndSales') => void;

  // LivePositions props
  handleManualClose: (position: LivePosition) => void;

  // One-click trading props
  oneClickTradingEnabled?: boolean;
  setFormData: (fn: (prev: Partial<UserParams>) => Partial<UserParams>) => void;
}

export const ScalpingDashboard = (props: ScalpingDashboardProps) => {

  const handleOneClickTrade = (tradeDetails: BybitTradeDetails) => {
    const { currentParams, livePrice, handleExecuteTrade, setToast } = props;

    if (!currentParams || !livePrice) {
      setToast({ message: 'Cannot execute one-click trade: context is missing.', variant: 'error' });
      return;
    }

    const mockSignal: Signal = {
      direction: tradeDetails.side === 'Buy' ? 'LONG' : 'SHORT',
      entryRange: [livePrice, livePrice],
      takeProfit: [parseFloat(tradeDetails.takeProfit!)],
      stopLoss: parseFloat(tradeDetails.stopLoss!),
      leverage: (currentParams.leverage as number) || 20,
      confidence: 100, // Manual action
      rrRatio: 1.5, // Assumed by logic in LivePriceChart
      tradeDuration: '1m-5m',
      reasoning: 'One-click chart trade.',
    };

    handleExecuteTrade(tradeDetails, mockSignal, currentParams);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Scalping</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 text-sm font-semibold bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 hover:bg-gray-700 transition-colors"><LayoutIcon className="w-4 h-4 text-cyan-400" />Layout</button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => props.toggleWindow('favorites')}><span className="w-5">{props.windowsState.favorites.isOpen && <CheckIcon className="w-4 h-4 text-cyan-400" />}</span>Favorite Pairs</DropdownMenuItem>
            <DropdownMenuItem onClick={() => props.toggleWindow('orderBook')}><span className="w-5">{props.windowsState.orderBook.isOpen && <CheckIcon className="w-4 h-4 text-cyan-400" />}</span>Order Book</DropdownMenuItem>
            <DropdownMenuItem onClick={() => props.toggleWindow('timeAndSales')}><span className="w-5">{props.windowsState.timeAndSales.isOpen && <CheckIcon className="w-4 h-4 text-cyan-400" />}</span>Time &amp; Sales</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ErrorBoundary>
        <LivePriceChart
          data={props.chartData}
          symbol={props.symbol ? `${props.symbol} (${props.exchange})` : ''}
          currentPrice={props.livePrice}
          isLoading={props.isChartLoading}
          signal={props.signal}
          signalParams={props.currentParams}
          hitTpLevels={props.hitTpPricesForChart}
          oneClickTradingEnabled={props.oneClickTradingEnabled}
          onOneClickTrade={handleOneClickTrade}
          oneClickTradeMargin={props.currentParams?.margin}
          onOneClickMarginChange={(margin) => props.setFormData(prev => ({...prev, margin}))}
          isSubmittingOneClick={props.isAnalyzing}
          livePositions={props.livePositions}
          onModifyPosition={props.handleModifyPosition}
        />
      </ErrorBoundary>

      <SignalCard
        signal={props.displaySignal}
        isLoading={props.isAnalyzing}
        isNew={props.isNewSignal}
        onUpdateSignal={!props.isAnalyzing && props.signal ? props.handleUpdateSignal : undefined}
        viewContext="generation"
        onExecute={(tradeDetails) => {
          if (props.signal && props.currentParams) {
            return props.handleExecuteTrade(tradeDetails, props.signal, props.currentParams);
          }
          const err = 'Cannot execute: signal/params missing.';
          props.setToast({ message: err, variant: 'error' });
          return Promise.reject(new Error(err));
        }}
        currentParams={props.currentParams}
        isExecuted={props.isCurrentSignalExecuted}
        onExpire={props.handleSignalExpire}
        setToast={props.setToast}
        onShareAsPost={props.handleShare}
      />

      <LivePositions
        livePositions={props.livePositions}
        livePrice={props.livePrice}
        onManualClose={props.handleManualClose}
        onModifyPosition={props.handleModifyPosition}
      />

      <div className="mt-6">
        <HistoryTable
          data={props.signalHistory}
          isDashboardView={true}
          onDelete={props.handleHistoryDelete}
          onUpdateStatus={props.handleHistoryUpdateStatus}
          onViewDetails={props.handleHistoryViewDetails}
          onViewAll={() => { /* Not implemented for this view */ }}
          onRestore={props.handleRestoreFromHistory}
        />
      </div>
    </div>
  );
};
