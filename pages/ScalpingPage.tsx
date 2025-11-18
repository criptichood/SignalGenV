import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { UserParams, Signal, SavedSignal, AiModel, CandleStick, OrderBookUpdate, LiveTrade, LivePosition, PerpTrade, TrackedSignal } from '@/types';
import { executeBybitTrade, closeBybitPosition, BybitTradeDetails, modifyBybitTrade } from '../services/executionService';
import { useExchangeWebSocket } from '../hooks/useExchangeWebSocket';
import { useSignalHitDetection } from '../hooks/useSignalHitDetection';
import { AI_MODELS } from '../constants';
import { playSound } from '../utils/audio';
import { useStore } from '../store';
import { useScalpingStore } from '../store/scalpingStore';
import { useSymbolsQuery } from '../hooks/useSymbolsQuery';
import { useChartDataQuery } from '../hooks/useChartDataQuery';
import { useHistoryStore } from '../store/historyStore';
import { ScalpingLayout } from '@/components/scalping/ScalpingLayout';
import { chartConnectionManager } from '@/services/chartConnectionManager';

interface ScalpingPageProps {
  bybitApiKey: string;
  bybitApiSecret: string;
  controller: {
      generationState: any; // Simplified for this context
      setGenerationState: (updates: Partial<any>) => void;
      generate: (params: Partial<UserParams>, options?: any) => void;
      cancel: () => void;
      audioAlertsEnabled: boolean;
  };
  onShareSignalAsPost: (signal: SavedSignal) => void;
}

const MAX_CHART_CANDLES = 1440;
const MAX_LIVE_TRADES = 20;

const formatCurrency = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 6 });

export default function ScalpingPage({
  bybitApiKey,
  bybitApiSecret,
  controller,
  onShareSignalAsPost,
}: ScalpingPageProps) {
  const { setToast } = useStore();
  const { generationState, setGenerationState, generate, cancel, audioAlertsEnabled } = controller;
  const { signalHistory, setSignalHistory } = useHistoryStore();
  const scalpingStore = useScalpingStore();

  const simulationIntervalRef = useRef<number | null>(null);

  const {
    formData, setFormData, setLivePositions, setPerpTrades, setActivePositionIds,
    setTrackedSignals, setIsCurrentSignalExecuted, isSignalEntered, setIsSignalEntered,
    setActiveAutopilotPositionId, setAutopilotSessionStats, setAutopilotState,
    setSelectedSignal, setIsModalOpen, setIsNewSignal,
    livePositions, activePositionIds, trackedSignals, activeAutopilotPositionId,
    setIsControlsOpen,
    oneClickTradingEnabled, setOneClickTradingEnabled, // One-click trading state
    autopilotState, autopilotSettings, autoExecutionThreshold,
  } = scalpingStore;

  const { data: symbols = [] } = useSymbolsQuery(formData.exchange);

  const { data: initialChartData, isLoading: isChartLoadingInitial } = useChartDataQuery(formData.exchange, formData.symbol);

  const [chartData, setChartData] = useState<CandleStick[]>(initialChartData || []);
  const [orderBookData, setOrderBookData] = useState<OrderBookUpdate | null>(null);
  const [liveTrades, setLiveTrades] = useState<LiveTrade[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(isChartLoadingInitial);

  const { isAnalyzing, signal, currentParams, generationTimestamp, lastDataTimestamp, error } = generationState;

  // Update chart data from query when it changes
  useEffect(() => {
    if (initialChartData) {
      setChartData(initialChartData);
    }
  }, [initialChartData]);

  // Reset order book and live trades when symbol/exchange changes
  useEffect(() => {
    setOrderBookData(null);
    setLiveTrades([]);
  }, [formData.symbol, formData.exchange]);

  const livePrice = chartData.length > 0 ? chartData[chartData.length - 1].close : null;

  const klineWebSocket = useExchangeWebSocket({
    exchange: formData.exchange || 'binance',
    symbol: formData.symbol || 'BTCUSDT',
    type: 'kline',
    interval: '1m',
    onMessage: (candle) => {
      setChartData(prevData => {
        const lastCandle = prevData[prevData.length - 1];
        if (lastCandle && candle.time === lastCandle.time) {
          const newData = [...prevData];
          newData[newData.length - 1] = candle;
          return newData;
        } else {
          return [...prevData, candle].slice(-MAX_CHART_CANDLES);
        }
      });
    },
    onConnectionError: (message) => setToast({ message, variant: 'warning' }),
    enabled: !!formData.symbol && !!formData.exchange,
  });

  const depthWebSocket = useExchangeWebSocket({
    exchange: formData.exchange || 'binance',
    symbol: formData.symbol || 'BTCUSDT',
    type: 'depth',
    onMessage: (data) => {
      if (data && 'bids' in data && 'asks' in data) setOrderBookData(data as OrderBookUpdate);
    },
    onConnectionError: (message) => setToast({ message, variant: 'warning' }),
    enabled: !!formData.symbol && !!formData.exchange && scalpingStore.windowsState.orderBook.isOpen,
  });

  const tradeWebSocket = useExchangeWebSocket({
    exchange: formData.exchange || 'binance',
    symbol: formData.symbol || 'BTCUSDT',
    type: 'trade',
    onMessage: (trade) => {
      const newTrades = Array.isArray(trade) ? trade : [trade];
      setLiveTrades(prev => [...newTrades, ...prev].slice(0, MAX_LIVE_TRADES));
    },
    onConnectionError: (message) => setToast({ message, variant: 'warning' }),
    enabled: !!formData.symbol && !!formData.exchange && scalpingStore.windowsState.timeAndSales.isOpen,
  });

  // Manage WebSocket lifecycle with chart connection manager
  useEffect(() => {
    const exchange = formData.exchange;
    const symbol = formData.symbol;

    if (exchange && symbol) {
      // Check if we can reuse an existing connection with a grace period to allow for smooth transitions
      if (chartConnectionManager.isConnectionActiveWithGracePeriod(exchange, symbol, '1m', 500)) {
        const cachedData = chartConnectionManager.getCachedData(exchange, symbol, '1m');
        if (cachedData) {
          setChartData(cachedData);
        }
      }

      // Register the connection when it's active
      const unsubscribe = () => {
        klineWebSocket && klineWebSocket();
      };
      chartConnectionManager.registerConnection(exchange, symbol, '1m', chartData, unsubscribe);

      // Update connection status
      if (klineWebSocket) {
        chartConnectionManager.activateConnection(exchange, symbol, '1m');
      } else {
        chartConnectionManager.deactivateConnection(exchange, symbol, '1m');
      }

      // Cleanup function
      return () => {
        chartConnectionManager.deactivateConnection(exchange, symbol, '1m');
        chartConnectionManager.cleanupInactiveConnections(2000); // Clean up after 2 seconds
      };
    }
  }, [formData.exchange, formData.symbol, klineWebSocket, chartData]);

  // Handle chart loading state with transition - extend the loading time slightly for smoother transitions
  useEffect(() => {
    setIsChartLoading(true);

    // Add a small delay to ensure smooth transitions between pages
    const timer = setTimeout(() => {
      setIsChartLoading(isChartLoadingInitial);
    }, 200); // 200ms delay helps smoothen page transitions

    return () => clearTimeout(timer);
  }, [isChartLoadingInitial]);

  // Update cached data when chart data changes
  useEffect(() => {
    if (formData.exchange && formData.symbol && chartData.length > 0) {
      chartConnectionManager.updateCachedData(formData.exchange, formData.symbol, '1m', chartData);
    }
  }, [chartData, formData.exchange, formData.symbol]);

  useEffect(() => {
    if (generationState.signal && !generationState.isAnalyzing) {
      setIsNewSignal(true);
      const timer = setTimeout(() => setIsNewSignal(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [generationState.signal, generationState.isAnalyzing, setIsNewSignal]);

  useSignalHitDetection({
    signal, currentParams, livePrice, generationTimestamp, isAnalyzing,
    currentSymbol: formData.symbol, isSignalEntered, setIsSignalEntered, setToast,
  });

  const handleClosePosition = useCallback(async (position: LivePosition, exitPriceOverride?: number) => {
    const exitPrice = exitPriceOverride ?? livePrice;
    if (exitPrice === null) { setToast({ message: 'Error: Cannot close position, exit price unavailable.', variant: 'error' }); throw new Error('Live price unavailable'); }
    try {
      // await closeBybitPosition(position.symbol, String(position.quantity), position.side === 'Long' ? 'Sell' : 'Buy'); // MOCK
      const pnl = (exitPrice - position.entryPrice) * position.quantity * (position.side === 'Long' ? 1 : -1);
      const pnlPercentage = position.margin > 0 ? (pnl / position.margin) * 100 : 0;
      setPerpTrades(prev => [{
        id: position.id, symbol: position.symbol, side: position.side, status: 'Closed', entryDate: position.entryDate, exitDate: Date.now(), entryPrice: position.entryPrice,
        exitPrice, quantity: position.quantity, margin: position.margin, leverage: position.leverage, pnl, pnlPercentage, fees: 0, notes: exitPriceOverride ? 'Closed by SL/TP.' : 'Closed manually.'
      }, ...prev]);
      setLivePositions(prev => prev.filter(p => p.id !== position.id));
      setActivePositionIds(prev => prev.filter(id => id !== position.id));

      if (position.id === activeAutopilotPositionId) {
        setActiveAutopilotPositionId(null);
        setAutopilotSessionStats(prev => {
            const newCapital = prev.currentCapital + pnl; const newPnl = prev.pnl + pnl;
            const pnlPercentOfInitial = newPnl / prev.initialCapital * 100;
            const newDrawdown = Math.min(prev.drawdown, pnlPercentOfInitial);
            return { ...prev, currentCapital: newCapital, pnl: newPnl, tradesExecuted: prev.tradesExecuted + 1, drawdown: newDrawdown, statusMessage: 'Position closed. Cooling down...' };
        });
        if(scalpingStore.autopilotState === 'monitoring') setAutopilotState('cooldown');
      }
      return { pnl, pnlPercentage };
    } catch (error: any) {
      setToast({ message: `Error closing position: ${error.message}`, variant: 'error' });
      if (position.id === activeAutopilotPositionId) setAutopilotState('stopped');
      throw error;
    }
  }, [livePrice, setLivePositions, setPerpTrades, activeAutopilotPositionId, setActiveAutopilotPositionId, setActivePositionIds, setAutopilotSessionStats, setAutopilotState, setToast, scalpingStore.autopilotState]);

  const handleExecuteTrade = useCallback(async (tradeDetails: BybitTradeDetails, execSignal: Signal, execParams: UserParams): Promise<LivePosition> => {
    if (!bybitApiKey || !bybitApiSecret) {
      const msg = 'Error: Bybit API keys are not set in Settings.';
      setToast({ message: msg, variant: 'error' }); throw new Error(msg);
    }
    setToast({ message: 'Sending order to backend...', variant: 'success' });
    try {
      const result = await executeBybitTrade(tradeDetails);
      const newPosition: LivePosition = {
        id: result.result.orderId, symbol: tradeDetails.symbol, side: tradeDetails.side === 'Buy' ? 'Long' : 'Short', entryPrice: execSignal.entryRange[0],
        quantity: parseFloat(tradeDetails.qty), margin: (execParams.margin || 0), leverage: (execSignal.leverage || 0),
        entryDate: Date.now(), takeProfit: execSignal.takeProfit[0], stopLoss: execSignal.stopLoss,
      };
      setLivePositions(prev => [...prev, newPosition]);
      setIsCurrentSignalExecuted(true);
      return newPosition;
    } catch (error: any) { setToast({ message: `Error executing trade: ${error.message}`, variant: 'error' }); throw error; }
  }, [bybitApiKey, bybitApiSecret, setLivePositions, setIsCurrentSignalExecuted, setToast]);

  const handleManualClose = useCallback(async (position: LivePosition) => {
      const result = await handleClosePosition(position);
      if (result) setToast({ message: `Position closed! P/L: ${result.pnl.toFixed(2)} (${result.pnlPercentage.toFixed(2)}%)`, variant: 'success' });
  }, [handleClosePosition, setToast]);

  const handleModifyPosition = useCallback(async (positionId: string, newTp?: number, newSl?: number) => {
    const position = livePositions.find(p => p.id === positionId);
    if (!position) { setToast({ message: 'Position not found.', variant: 'error' }); return; }
    await modifyBybitTrade(position.id, position.symbol, newTp?.toString(), newSl?.toString());
    setLivePositions(prev => prev.map(p => p.id === positionId ? { ...p, takeProfit: newTp, stopLoss: newSl } : p));
    setToast({ message: 'Position updated!', variant: 'success' });
  }, [livePositions, setLivePositions, setToast]);
  
  // --- AUTOPILOT SIMULATION LOGIC ---
  const clearSimulationTimers = useCallback(() => {
    if (simulationIntervalRef.current) {
        clearTimeout(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
    }
  }, []);

  const handleToggleAutopilot = useCallback(() => {
    if (autopilotState === 'inactive' || autopilotState === 'stopped') {
        setAutopilotSessionStats(() => ({
            initialCapital: autopilotSettings.sessionCapital,
            currentCapital: autopilotSettings.sessionCapital,
            startTime: Date.now(),
            pnl: 0, tradesExecuted: 0, drawdown: 0,
            statusMessage: 'Starting...'
        }));
        setAutopilotState('searching');
        setToast({ message: "Autopilot session started!", variant: 'success' });
    } else {
        setAutopilotState('stopped');
        setAutopilotSessionStats(prev => ({ ...prev, statusMessage: 'Session stopped by user.' }));
        clearSimulationTimers();
        setToast({ message: "Autopilot session stopped.", variant: 'warning' });
    }
  }, [autopilotState, autopilotSettings.sessionCapital, setAutopilotState, setAutopilotSessionStats, clearSimulationTimers, setToast]);
  
  useEffect(() => {
    const runSimulationStep = () => {
        if (simulationIntervalRef.current) clearTimeout(simulationIntervalRef.current);
        const { tradesExecuted, drawdown } = scalpingStore.autopilotSessionStats;
        const { maxTrades, maxSessionDrawdown } = autopilotSettings;
        if (tradesExecuted >= maxTrades || Math.abs(drawdown) >= maxSessionDrawdown) {
            setAutopilotState('stopped');
            setAutopilotSessionStats(prev => ({ ...prev, statusMessage: 'Session ended due to limits.' }));
            return;
        }

        switch (scalpingStore.autopilotState) {
            case 'searching':
                setAutopilotSessionStats(prev => ({ ...prev, statusMessage: `Scanning ${formData.symbol}...` }));
                simulationIntervalRef.current = window.setTimeout(() => {
                    const mockConfidence = 70 + Math.random() * 25; // Random confidence between 70-95%
                    if (mockConfidence >= autoExecutionThreshold) {
                        const isLong = Math.random() > 0.5;
                        const entry = livePrice ?? 0;
                        const slDistance = entry * 0.002; // 0.2% SL
                        const tpDistance = slDistance * 1.5; // 1.5 R:R
                        const mockSignal: Signal = {
                            direction: isLong ? 'LONG' : 'SHORT', entryRange: [entry, entry], stopLoss: isLong ? entry - slDistance : entry + slDistance,
                            takeProfit: [isLong ? entry + tpDistance : entry - tpDistance], confidence: mockConfidence, rrRatio: 1.5, leverage: 20,
                            tradeDuration: '1m-5m', reasoning: 'Autopilot simulated signal.',
                        };
                        const positionSize = autopilotSettings.tradeSizeMode === 'fixed' ? autopilotSettings.tradeSizeValue : scalpingStore.autopilotSessionStats.currentCapital * (autopilotSettings.tradeSizeValue / 100);
                        const mockPosition: LivePosition = {
                            id: `sim_${Date.now()}`, symbol: formData.symbol!, side: isLong ? 'Long' : 'Short', entryPrice: entry, quantity: entry > 0 ? positionSize / entry : 0,
                            margin: positionSize, leverage: 20, entryDate: Date.now(), takeProfit: mockSignal.takeProfit[0], stopLoss: mockSignal.stopLoss,
                        };
                        setLivePositions(prev => [...prev, mockPosition]);
                        setActiveAutopilotPositionId(mockPosition.id);
                        setAutopilotState('monitoring');
                    } else {
                        // Loop back to searching
                        runSimulationStep();
                    }
                }, 2000 + Math.random() * 3000); // Scan for 2-5 seconds
                break;

            case 'monitoring':
                setAutopilotSessionStats(prev => ({ ...prev, statusMessage: 'Monitoring position...' }));
                simulationIntervalRef.current = window.setTimeout(() => {
                    const activePosition = scalpingStore.livePositions.find(p => p.id === scalpingStore.activeAutopilotPositionId);
                    if (activePosition) {
                        const isWin = Math.random() > 0.4; // 60% win rate
                        const exitPrice = isWin ? activePosition.takeProfit! : activePosition.stopLoss!;
                        handleClosePosition(activePosition, exitPrice);
                    }
                }, 5000 + Math.random() * 5000); // Monitor for 5-10 seconds
                break;

            case 'cooldown':
                simulationIntervalRef.current = window.setTimeout(() => {
                    setAutopilotState('searching');
                }, autopilotSettings.cooldownMinutes * 60 * 1000);
                break;
        }
    };

    if (autopilotState !== 'inactive' && autopilotState !== 'stopped') {
        runSimulationStep();
    }
    
    return () => clearSimulationTimers();
  }, [autopilotState, livePrice]);

  const handleSubmit = (params: UserParams, model: AiModel) => {
    setIsSignalEntered(false);
    setIsCurrentSignalExecuted(false);
    generate(params, { extraData: { orderBookData, liveTrades } });
    if (window.innerWidth < 1024) {
      setIsControlsOpen(false);
    }
  };
  const handleSelectFavorite = (symbol: string) => setFormData(prev => ({...prev, symbol}));
  const handleGenerateForFavorite = (symbol: string) => {
    const newParams = { ...formData, symbol } as UserParams;
    const model = AI_MODELS.find(m => m.id === newParams.model);
    if (model) { setFormData(() => newParams); handleSubmit(newParams, model); }
    else { setToast({ message: "Invalid AI model selected.", variant: 'error' }); }
  };
  const handleRestoreSignal = (id: string) => {
    const signalToRestore = trackedSignals.find(ts => ts.id === id);
    if (!signalToRestore) return;
    setFormData(() => signalToRestore.params);
    setGenerationState({ signal: signalToRestore.signal, currentParams: signalToRestore.params, generationTimestamp: signalToRestore.timestamp });
    setTrackedSignals(prev => prev.filter(ts => ts.id !== id));
    setToast({ message: `Restored view for ${signalToRestore.params.symbol}.`, variant: 'success' });
  };
  const handleShare = () => {
    const historySignal = generationTimestamp ? signalHistory.find(s => s.timestamp === generationTimestamp) : null;
    if (!historySignal) { setToast({ message: 'Cannot share transient signal.', variant: 'error'}); return; }
    onShareSignalAsPost(historySignal);
  };
  const hitTpPricesForChart = useMemo(() => {
    const historySignal = generationTimestamp ? signalHistory.find(s => s.timestamp === generationTimestamp) : null;
    if (!historySignal || !signal || !historySignal.hitTps) return [];
    return historySignal.hitTps.map(index => signal.takeProfit[index]);
  }, [generationTimestamp, signalHistory, signal]);
  const displaySignal = signal && currentParams && generationTimestamp ? { ...signal, symbol: currentParams.symbol, currentPrice: livePrice || generationState.currentPrice, timestamp: generationTimestamp, lastDataTimestamp: lastDataTimestamp ?? undefined, type: 'Scalp' as const, } : null;

  return (
    <ScalpingLayout
      {...scalpingStore}
      setToast={setToast}
      symbols={symbols}
      isAnalyzing={isAnalyzing}
      chartData={chartData}
      livePrice={livePrice}
      isChartLoading={isChartLoading}
      signal={signal}
      currentParams={currentParams}
      hitTpPricesForChart={hitTpPricesForChart}
      displaySignal={displaySignal}
      liveTrades={liveTrades}
      orderBookData={orderBookData}
      signalHistory={signalHistory}
      
      // Handlers
      handleSubmit={handleSubmit}
      handleCancel={cancel}
      handleExecuteTrade={handleExecuteTrade}
      handleManualClose={handleManualClose}
      handleModifyPosition={handleModifyPosition}
      handleUpdateSignal={(updates) => {
        if (!generationState.signal) return;
        const newSignal = { ...generationState.signal, ...updates };
        setGenerationState({ signal: newSignal });
        setSignalHistory(prev => prev.map(s => s.timestamp === generationTimestamp ? { ...s, ...newSignal } : s));
      }}
      handleSignalExpire={() => {
        if (generationState.signal) setGenerationState({ signal: null, currentParams: null });
      }}
      handleShare={handleShare}
      handleHistoryDelete={(id) => setSignalHistory(prev => prev.filter(s => s.id !== id))}
      handleHistoryUpdateStatus={(id, status) => setSignalHistory(prev => prev.map(s => (s.id === id ? { ...s, status } : s)))}
      handleRestoreFromHistory={(sig) => {
        setFormData(prev => ({ ...prev, symbol: sig.symbol, timeframe: sig.timeframe }));
        setGenerationState({ signal: sig, currentParams: { ...formData, symbol: sig.symbol, timeframe: sig.timeframe } as UserParams, generationTimestamp: sig.timestamp });
      }}
      handleSelectFavorite={handleSelectFavorite}
      handleGenerateForFavorite={handleGenerateForFavorite}
      handleCloseTracker={(id) => setTrackedSignals(prev => prev.filter(ts => ts.id !== id))}
      handleToggleMinimizeTracker={(id) => setTrackedSignals(prev => prev.map(ts => ts.id === id ? { ...ts, windowState: { ...ts.windowState, isMinimized: !ts.windowState.isMinimized } } : ts))}
      handleTrackerPositionChange={(id, pos) => setTrackedSignals(prev => prev.map(ts => ts.id === id ? { ...ts, windowState: { ...ts.windowState, position: pos } } : ts))}
      handleRestoreSignal={handleRestoreSignal}
      onToggleAutopilot={handleToggleAutopilot}
      bybitApiKey={bybitApiKey}
      bybitApiSecret={bybitApiSecret}
      handleHistoryViewDetails={(sig) => { setSelectedSignal(sig); setIsModalOpen(true); }}
    />
  );
}