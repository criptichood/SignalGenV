import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Page, UserParams, Signal, SavedSignal, AiModel, CandleStick, OrderBookUpdate, LiveTrade } from '@/types';
import { useStore } from '@/store';
import { useSignalGenStore } from '@/store/signalGenStore';
import { useHistoryStore } from '@/store/historyStore';
import { useSymbolsQuery } from '@/hooks/useSymbolsQuery';
import { useChartDataQuery } from '@/hooks/useChartDataQuery';
import { useExchangeWebSocket } from '@/hooks/useExchangeWebSocket';
import { executeBybitTrade, BybitTradeDetails } from '@/services/executionService';
import { useSignalHitDetection } from '@/hooks/useSignalHitDetection';
import type { SignalGenerationState } from '@/hooks/useSignalGenerator';
import { AI_MODELS } from '@/constants';
import { SignalGenLayout } from '@/components/signal-gen/SignalGenLayout';

interface SignalGenPageProps {
  bybitApiKey: string;
  bybitApiSecret: string;
  controller: {
    generationState: SignalGenerationState;
    setGenerationState: (updates: Partial<SignalGenerationState>) => void;
    generate: (params: Partial<UserParams>) => void;
    cancel: () => void;
    audioAlertsEnabled: boolean;
  };
  onShareSignalAsPost: (signal: SavedSignal) => void;
}

const MAX_CHART_CANDLES = 1440;
const MAX_LIVE_TRADES = 50;

export default function SignalGenPage({
  bybitApiKey,
  bybitApiSecret,
  controller,
  onShareSignalAsPost,
}: SignalGenPageProps) {
  const { setCurrentPage, setToast } = useStore();
  const { generationState, setGenerationState, generate, cancel } = controller;
  const { signalHistory, setSignalHistory } = useHistoryStore();

  const {
    formData, setFormData, isSignalEntered, setIsSignalEntered,
    isCurrentSignalExecuted, setIsCurrentSignalExecuted,
    setIsNewSignal, setIsControlsOpen, windowsState
  } = useSignalGenStore();
  
  const { data: symbols = [], error: symbolsQueryError } = useSymbolsQuery(formData.exchange);
  const { data: initialChartData, isLoading: isChartLoading, error: chartDataError } = useChartDataQuery(formData.exchange, formData.symbol);

  const [chartData, setChartData] = useState<CandleStick[]>([]);
  const [orderBookData, setOrderBookData] = useState<OrderBookUpdate | null>(null);
  const [liveTrades, setLiveTrades] = useState<LiveTrade[]>([]);
  
  useEffect(() => {
    if (initialChartData) setChartData(initialChartData);
  }, [initialChartData]);
  
  useEffect(() => {
    setOrderBookData(null);
    setLiveTrades([]);
  }, [formData.symbol, formData.exchange]);
  
  const { isAnalyzing, signal, currentParams, generationTimestamp, lastDataTimestamp, error } = generationState;
  const livePrice = chartData.length > 0 ? chartData[chartData.length - 1].close : null;

  useExchangeWebSocket({
    exchange: formData.exchange || 'binance', symbol: formData.symbol || 'BTCUSDT', type: 'kline', interval: '1m',
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

  useExchangeWebSocket({
    exchange: formData.exchange || 'binance', symbol: formData.symbol || 'BTCUSDT', type: 'depth',
    onMessage: (data) => { if (data && 'bids' in data && 'asks' in data) { setOrderBookData(data as OrderBookUpdate); } },
    onConnectionError: (message) => setToast({ message, variant: 'warning' }), enabled: !!formData.symbol && !!formData.exchange && windowsState.orderBook.isOpen,
  });
  
  useExchangeWebSocket({
    exchange: formData.exchange || 'binance', symbol: formData.symbol || 'BTCUSDT', type: 'trade',
    onMessage: (trade) => { const newTrades = Array.isArray(trade) ? trade : [trade]; setLiveTrades(prev => [...newTrades, ...prev].slice(0, MAX_LIVE_TRADES)); },
    onConnectionError: (message) => setToast({ message, variant: 'warning' }), enabled: !!formData.symbol && !!formData.exchange && windowsState.timeAndSales.isOpen,
  });
  
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

  const handleSubmit = (params: UserParams, model: AiModel) => {
    setIsSignalEntered(false);
    setIsCurrentSignalExecuted(false);
    setIsNewSignal(false);
    generate(params);
    if (window.innerWidth < 1024) {
      setIsControlsOpen(false);
    }
  };

  const handleExecuteTrade = useCallback(async (tradeDetails: BybitTradeDetails) => {
    if (!bybitApiKey || !bybitApiSecret) {
      setToast({ message: 'Error: Bybit API keys are not set in Settings.', variant: 'error' });
      return;
    }
    setToast({ message: 'Sending order to backend...', variant: 'success' });
    try {
      await executeBybitTrade(tradeDetails);
      setToast({ message: `Order placed! Position for ${tradeDetails.symbol} is live.`, variant: 'success' });
      setIsCurrentSignalExecuted(true);
    } catch (error: any) {
      setToast({ message: `Error executing trade: ${error.message}`, variant: 'error' });
    }
  }, [bybitApiKey, bybitApiSecret, setToast, setIsCurrentSignalExecuted]);
  
  const handleUpdateSignal = useCallback((updates: Partial<Signal>) => {
    if (generationState.signal && generationState.currentParams && generationState.generationTimestamp) {
        const newSignal = { ...generationState.signal, ...updates };
        const entryPrice = newSignal.entryRange[0]; const stopLoss = newSignal.stopLoss; const takeProfit1 = newSignal.takeProfit[0];
        if(entryPrice && stopLoss && takeProfit1) {
            const risk = Math.abs(entryPrice - stopLoss);
            const reward = Math.abs(takeProfit1 - entryPrice);
            newSignal.rrRatio = risk > 0 ? reward / risk : 0;
        }
        setGenerationState({ signal: newSignal });

        const timestampToFind = generationState.generationTimestamp;
        setSignalHistory(prev => prev.map(s => (s.timestamp === timestampToFind) ? { ...s, ...newSignal } : s));
        setToast({ message: 'Signal levels updated.', variant: 'success' });
    }
  }, [generationState, setGenerationState, setSignalHistory, setToast]);

  const handleRestoreFromHistory = useCallback((signalToRestore: SavedSignal) => {
    const restoredParams: UserParams = {
        exchange: formData.exchange || 'binance', model: formData.model || AI_MODELS[0].id,
        symbol: signalToRestore.symbol, timeframe: signalToRestore.timeframe,
        opportunityDuration: formData.opportunityDuration || 'Any time frame', margin: formData.margin || 50,
        risk: formData.risk || 0.2, leverage: signalToRestore.leverage, customLeverage: formData.customLeverage,
        forceLeverage: formData.forceLeverage || false, allowHighLeverage: formData.allowHighLeverage || false,
        customAiParams: formData.customAiParams || '',
    };
    
    setFormData(() => restoredParams);
    setGenerationState({
        isAnalyzing: false, signal: signalToRestore, currentParams: restoredParams,
        currentPrice: signalToRestore.currentPrice, generationTimestamp: signalToRestore.timestamp,
        lastDataTimestamp: signalToRestore.lastDataTimestamp ?? null, error: null,
    });
    setToast({ message: `Restored signal view for ${signalToRestore.symbol}.`, variant: 'success'});
  }, [formData, setFormData, setGenerationState, setToast]);
  
  const handleShare = () => {
    const historySignal = generationTimestamp ? signalHistory.find(s => s.timestamp === generationTimestamp) : null;
    if (!historySignal) { setToast({ message: 'Cannot share a transient signal.', variant: 'error'}); return; }
    onShareSignalAsPost(historySignal);
  };

  const displaySignal = signal && currentParams && generationTimestamp ? { ...signal, symbol: currentParams.symbol, currentPrice: livePrice || generationState.currentPrice, timestamp: generationTimestamp, lastDataTimestamp: lastDataTimestamp ?? undefined, type: 'Swing' as const, } : null;
  const hitTpPricesForChart = useMemo(() => {
    const historySignal = generationTimestamp ? signalHistory.find(s => s.timestamp === generationTimestamp) : null;
    if (!historySignal || !signal || !historySignal.hitTps) return [];
    return historySignal.hitTps.map(index => signal.takeProfit[index]);
  }, [generationTimestamp, signalHistory, signal]);

  return (
    <SignalGenLayout
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
        symbolsQueryError={symbolsQueryError}
        chartDataError={chartDataError}
        error={error}
        setToast={setToast}
        setGenerationState={setGenerationState}
        setCurrentPage={setCurrentPage}
        setSignalHistory={setSignalHistory}
        handleSubmit={handleSubmit}
        handleExecuteTrade={handleExecuteTrade}
        handleUpdateSignal={handleUpdateSignal}
        handleRestoreFromHistory={handleRestoreFromHistory}
        handleShare={handleShare}
        handleCancel={cancel}
    />
  );
}