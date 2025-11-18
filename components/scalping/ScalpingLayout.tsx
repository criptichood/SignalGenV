import React from 'react';
import { ScalpingControls } from './ScalpingControls';
import { ScalpingDashboard } from './ScalpingDashboard';
import { FloatingWindows } from './FloatingWindows';
import { SignalDetailModal } from '@/components/SignalDetailModal';
import { ChevronsLeftIcon } from '@/components/icons/ChevronsLeftIcon';
import { ChevronsRightIcon } from '@/components/icons/ChevronsRightIcon';
import type { ScalpingState } from '@/store/scalpingStore';
import type { Signal, UserParams, AiModel, SavedSignal, CandleStick, LivePosition, LiveTrade, OrderBookUpdate } from '@/types';
import { BybitTradeDetails } from '@/services/executionService';

// This is a massive props object, but it's necessary to connect the container to the layout.
// In a larger app, we might use context, but for this refactor, prop drilling is okay.
interface ScalpingLayoutProps extends ScalpingState {
  symbols: string[];
  isAnalyzing: boolean;
  chartData: CandleStick[];
  livePrice: number | null;
  isChartLoading: boolean;
  signal: Signal | null;
  currentParams: UserParams | null;
  hitTpPricesForChart: number[];
  displaySignal: (Signal & { symbol: string; currentPrice: number; timestamp: number; type: "Scalp"; lastDataTimestamp?: number | undefined; }) | null;
  setToast: (toast: { message: string; variant: 'success' | 'warning' | 'error' } | null) => void;
  
  handleSubmit: (params: UserParams, model: AiModel) => void;
  handleCancel: () => void;
  handleExecuteTrade: (tradeDetails: BybitTradeDetails, execSignal: Signal, execParams: UserParams) => Promise<LivePosition>;
  handleManualClose: (position: LivePosition) => void;
  handleModifyPosition: (positionId: string, newTp?: number, newSl?: number) => Promise<void>;
  handleUpdateSignal: (updates: Partial<Signal>) => void;
  handleSignalExpire: () => void;
  handleShare: () => void;
  
  // History props
  signalHistory: SavedSignal[];
  handleHistoryDelete: (id: string) => void;
  handleHistoryUpdateStatus: (id: string, status: SavedSignal['status']) => void;
  handleRestoreFromHistory: (signal: SavedSignal) => void;
  handleHistoryViewDetails: (signal: SavedSignal) => void;
  
  // Floating windows props
  handleSelectFavorite: (symbol: string) => void;
  handleGenerateForFavorite: (symbol: string) => void;
  handleCloseTracker: (id: string) => void;
  handleToggleMinimizeTracker: (id: string) => void;
  handleTrackerPositionChange: (id: string, pos: { x: number; y: number }) => void;
  handleRestoreSignal: (id: string) => void;
  bybitApiKey: string; // Needed for controls
  bybitApiSecret: string; // Needed for controls
  onToggleAutopilot: () => void; // Pass down toggle handler

  liveTrades: LiveTrade[];
  orderBookData: OrderBookUpdate | null;
}

export const ScalpingLayout = (props: ScalpingLayoutProps) => {
  return (
    <>
      <div className={`fixed top-0 h-full z-50 transition-all duration-300 ease-in-out w-96 ${props.isControlsOpen ? 'left-0 lg:left-64' : '-left-96'}`}>
        <ScalpingControls
          symbols={props.symbols}
          isAnalyzing={props.isAnalyzing}
          onSubmit={props.handleSubmit}
          onCancel={props.handleCancel}
          formData={props.formData}
          setFormData={props.setFormData}
          scalpingPresets={props.scalpingPresets}
          setScalpingPresets={props.setScalpingPresets}
          onClose={() => props.setIsControlsOpen(false)}
          onToggleFavoritesWindow={() => props.toggleWindow('favorites')}
          isAutoExecutionEnabled={props.isAutoExecutionEnabled}
          setIsAutoExecutionEnabled={props.setIsAutoExecutionEnabled}
          autoExecutionThreshold={props.autoExecutionThreshold}
          setAutoExecutionThreshold={props.setAutoExecutionThreshold}
          autoExecutionType={props.autoExecutionType}
          setAutoExecutionType={props.setAutoExecutionType}
          oneClickTradingEnabled={props.oneClickTradingEnabled}
          setOneClickTradingEnabled={props.setOneClickTradingEnabled}
          autopilotState={props.autopilotState}
          onToggleAutopilot={props.onToggleAutopilot}
          autopilotSettings={props.autopilotSettings}
          onAutopilotSettingsChange={props.setAutopilotSettings}
          autopilotSessionStats={props.autopilotSessionStats}
          bybitApiKey={props.bybitApiKey}
          bybitApiSecret={props.bybitApiSecret}
          setToast={props.setToast}
          autopilotScanMode={props.autopilotScanMode}
          setAutopilotScanMode={props.setAutopilotScanMode}
          favorites={props.favoriteScalpSymbols}
          setFavorites={props.setFavoriteScalpSymbols}
        />
      </div>

      <button onClick={() => props.setIsControlsOpen(!props.isControlsOpen)} className={`fixed top-1/2 -translate-y-1/2 z-50 bg-gray-800/80 backdrop-blur-md p-2 rounded-r-lg border-y border-r border-gray-700/70 hover:bg-gray-700 transition-all duration-300 ease-in-out ${props.isControlsOpen ? 'left-96 lg:left-[40rem]' : 'left-0 lg:left-64'}`} aria-label={props.isControlsOpen ? "Close Controls" : "Open Controls"}>
        {props.isControlsOpen ? <ChevronsLeftIcon className="w-5 h-5 text-gray-300" /> : <ChevronsRightIcon className="w-5 h-5 text-cyan-400" />}
      </button>
      
      {props.isControlsOpen && (<div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => props.setIsControlsOpen(false)}></div>)}

      <div className={`transition-all duration-300 ease-in-out ${props.isControlsOpen ? 'lg:ml-96' : ''}`}>
        <ScalpingDashboard
          chartData={props.chartData}
          symbol={props.formData.symbol}
          exchange={props.formData.exchange}
          livePrice={props.livePrice}
          isChartLoading={props.isChartLoading}
          signal={props.signal}
          currentParams={props.currentParams}
          hitTpPricesForChart={props.hitTpPricesForChart}
          livePositions={props.livePositions}
          handleModifyPosition={props.handleModifyPosition}
          displaySignal={props.displaySignal}
          isAnalyzing={props.isAnalyzing}
          isNewSignal={props.isNewSignal}
          handleUpdateSignal={props.handleUpdateSignal}
          handleExecuteTrade={props.handleExecuteTrade}
          isCurrentSignalExecuted={props.isCurrentSignalExecuted}
          handleSignalExpire={props.handleSignalExpire}
          setToast={props.setToast}
          handleShare={props.handleShare}
          signalHistory={props.signalHistory}
          handleHistoryDelete={props.handleHistoryDelete}
          handleHistoryUpdateStatus={props.handleHistoryUpdateStatus}
          handleHistoryViewDetails={props.handleHistoryViewDetails}
          handleRestoreFromHistory={props.handleRestoreFromHistory}
          windowsState={props.windowsState}
          toggleWindow={props.toggleWindow}
          handleManualClose={props.handleManualClose}
          oneClickTradingEnabled={props.oneClickTradingEnabled}
          setFormData={props.setFormData}
        />
      </div>

      <FloatingWindows
        windowsState={props.windowsState}
        handlePositionChange={props.handlePositionChange}
        toggleWindow={props.toggleWindow}
        toggleMinimize={props.toggleMinimize}
        favoriteScalpSymbols={props.favoriteScalpSymbols}
        handleSelectFavorite={props.handleSelectFavorite}
        handleGenerateForFavorite={props.handleGenerateForFavorite}
        isAnalyzing={props.isAnalyzing}
        symbol={props.formData.symbol}
        orderBookData={props.orderBookData}
        livePrice={props.livePrice}
        liveTrades={props.liveTrades}
        trackedSignals={props.trackedSignals}
        handleCloseTracker={props.handleCloseTracker}
        handleToggleMinimizeTracker={props.handleToggleMinimizeTracker}
        handleTrackerPositionChange={props.handleTrackerPositionChange}
        handleRestoreSignal={props.handleRestoreSignal}
      />
      
      {props.isModalOpen && props.selectedSignal && (
        <SignalDetailModal signal={props.selectedSignal} onClose={() => props.setIsModalOpen(false)} setToast={props.setToast} />
      )}
    </>
  );
};