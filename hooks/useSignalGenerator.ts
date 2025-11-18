import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Page, UserParams, Signal, SavedSignal, AiModel, Timeframe, OrderBookUpdate, LiveTrade } from '@/types';
import { generateScalpingSignal } from '@/services/geminiService';
import { useLocalStorage } from './useLocalStorage';
import { AI_MODELS } from '@/constants';
import { playSound } from '@/utils/audio';
import { useGenerateSignalMutation } from './useGenerateSignalMutation';
import { useSignalGenStore } from '@/store/signalGenStore';
import { useScalpingStore } from '@/store/scalpingStore';
import { useHistoryStore } from '@/store/historyStore';
import * as exchangeService from '@/services/exchangeService';

export interface SignalGenerationState {
  isAnalyzing: boolean;
  signal: Signal | null;
  currentParams: UserParams | null;
  currentPrice: number;
  generationTimestamp: number | null;
  lastDataTimestamp: number | null;
  error: string | null;
}

export function useSignalGenerator(
    setCurrentPage: (page: Page) => void,
    audioAlertsEnabled: boolean
) {
  const { setSignalHistory } = useHistoryStore();
  const signalMutation = useGenerateSignalMutation();
  const scalpCancellationRef = useRef(false);

  const { formData: signalGenFormDataFromStore, setFormData: setSignalGenFormDataInStore } = useSignalGenStore();
  const { formData: scalpingFormDataFromStore, setFormData: setScalpingFormDataInStore } = useScalpingStore();

  const [signalGenerationState, setSignalGenerationState] = useState<SignalGenerationState>({
    isAnalyzing: false, signal: null, currentParams: null, currentPrice: 0, generationTimestamp: null, lastDataTimestamp: null, error: null,
  });

  const updateSignalGenerationState = useCallback((updates: Partial<SignalGenerationState>) => {
    setSignalGenerationState(prevState => ({ ...prevState, ...updates }));
  }, []);

  useEffect(() => {
    updateSignalGenerationState({ isAnalyzing: signalMutation.isPending });
  }, [signalMutation.isPending, updateSignalGenerationState]);

  const [scalpingGenerationState, setScalpingGenerationState] = useState<SignalGenerationState>({
    isAnalyzing: false, signal: null, currentParams: null, currentPrice: 0, generationTimestamp: null, lastDataTimestamp: null, error: null,
  });

  const updateScalpingGenerationState = useCallback((updates: Partial<SignalGenerationState>) => {
    setScalpingGenerationState(prevState => ({ ...prevState, ...updates }));
  }, []);

  const cancelSignalGeneration = useCallback(() => {
    signalMutation.reset();
    updateSignalGenerationState({
        isAnalyzing: false,
        signal: null,
        error: 'Analysis cancelled by user.',
    });
  }, [signalMutation, updateSignalGenerationState]);

  const cancelScalpGeneration = useCallback(() => {
    scalpCancellationRef.current = true;
    updateScalpingGenerationState({
        isAnalyzing: false,
        signal: null,
        error: 'Analysis cancelled by user.',
    });
  }, [updateScalpingGenerationState]);

  const runScalpGeneration = useCallback(async (params: UserParams, model: AiModel, extraData?: { orderBookData: OrderBookUpdate | null, liveTrades: LiveTrade[] }) => {
    scalpCancellationRef.current = false;
    updateScalpingGenerationState({ isAnalyzing: true, signal: null, error: null, currentParams: params, generationTimestamp: null, lastDataTimestamp: null });
    try {
      const ltfMarketData = await exchangeService.fetchData(params.exchange, params.symbol, params.timeframe, 1);
      if (scalpCancellationRef.current) return;

      const livePrice = ltfMarketData.length > 0 ? ltfMarketData[ltfMarketData.length - 1].close : 0;
      updateScalpingGenerationState({ currentPrice: livePrice });

      const generatedSignal = await generateScalpingSignal(params, [], [], extraData?.orderBookData ?? null, extraData?.liveTrades ?? []);

      if (scalpCancellationRef.current) return;
      const timestamp = Date.now();
      updateScalpingGenerationState({ signal: generatedSignal, currentPrice: livePrice, lastDataTimestamp: null, generationTimestamp: timestamp });
      if (audioAlertsEnabled) playSound('new-signal');

      const newScalp: SavedSignal = { ...generatedSignal, id: crypto.randomUUID(), symbol: params.symbol, timeframe: params.timeframe, timestamp, status: 'Pending', currentPrice: livePrice, type: 'Scalp', hitTps: [] };
      setSignalHistory(prev => [newScalp, ...prev]);

    } catch (err: any) {
      if (scalpCancellationRef.current) return;
      updateScalpingGenerationState({ error: err.message || 'An unknown error occurred.', signal: null });
    } finally {
      if (scalpCancellationRef.current) return;
      updateScalpingGenerationState({ isAnalyzing: false });
    }
  }, [updateScalpingGenerationState, audioAlertsEnabled, setSignalHistory]);


  const triggerSignalGeneration = useCallback((params: Partial<UserParams>, options?: { navigate?: boolean }) => {
    const shouldNavigate = options?.navigate ?? true;
    if (shouldNavigate) {
        setCurrentPage('signal-gen');
    }
    const newFormData = { ...signalGenFormDataFromStore, ...params };
    setSignalGenFormDataInStore(() => newFormData);

    const model = AI_MODELS.find(m => m.id === newFormData.model);

    if (!model) {
      updateSignalGenerationState({ error: "Invalid AI model selected for generation." });
      return;
    }

    updateSignalGenerationState({ signal: null, error: null, currentParams: newFormData as UserParams, generationTimestamp: null, lastDataTimestamp: null });

    try {
      signalMutation.mutate(
        { params: newFormData as UserParams, model },
        {
          onSuccess: ({ generatedSignal, params: successfulParams, lastClose, lastCandleTime }) => {
            try {
              const timestamp = Date.now();
              updateSignalGenerationState({
                signal: generatedSignal,
                currentPrice: lastClose,
                lastDataTimestamp: lastCandleTime,
                generationTimestamp: timestamp,
              });
              if (audioAlertsEnabled) playSound('new-signal');

              const newSignal: SavedSignal = {
                ...generatedSignal,
                id: crypto.randomUUID(),
                symbol: successfulParams.symbol,
                timeframe: successfulParams.timeframe,
                timestamp,
                status: 'Pending',
                currentPrice: lastClose,
                lastDataTimestamp: lastCandleTime ?? undefined,
                type: 'Swing',
                hitTps: [],
              };
              setSignalHistory(prev => [newSignal, ...prev]);
            } catch (error) {
              console.error('Error in onSuccess callback:', error);
              updateSignalGenerationState({ error: 'Failed to process generated signal: ' + (error instanceof Error ? error.message : 'Unknown error') });
            }
          },
          onError: (err) => {
            try {
              updateSignalGenerationState({ error: err.message || 'An unknown error occurred.', signal: null });
            } catch (error) {
              console.error('Error in onError callback:', error);
              updateSignalGenerationState({ error: 'Failed to handle error: ' + (error instanceof Error ? error.message : 'Unknown error') });
            }
          }
        }
      );
    } catch (error) {
      console.error('Error triggering signal generation:', error);
      updateSignalGenerationState({ error: 'Failed to start signal generation: ' + (error instanceof Error ? error.message : 'Unknown error') });
    }
  }, [signalGenFormDataFromStore, setSignalGenFormDataInStore, setCurrentPage, updateSignalGenerationState, signalMutation, audioAlertsEnabled, setSignalHistory]);

  const triggerScalpGeneration = useCallback((params: Partial<UserParams>, options?: { navigate?: boolean; extraData?: { orderBookData: OrderBookUpdate | null, liveTrades: LiveTrade[] } }) => {
    const shouldNavigate = options?.navigate ?? true;
    if (shouldNavigate) {
        setCurrentPage('scalping');
    }
    const newFormData = { ...scalpingFormDataFromStore, ...params };
    setScalpingFormDataInStore(() => newFormData);
    const model = AI_MODELS.find(m => m.id === newFormData.model);
    if (model) {
      runScalpGeneration(newFormData as UserParams, model, options?.extraData);
    } else {
        updateScalpingGenerationState({ error: "Invalid AI model selected for generation."});
    }
  }, [scalpingFormDataFromStore, setScalpingFormDataInStore, runScalpGeneration, setCurrentPage, updateScalpingGenerationState]);

  return {
    signalGenController: {
        generationState: { ...signalGenerationState, isAnalyzing: signalMutation.isPending },
        setGenerationState: updateSignalGenerationState,
        generate: triggerSignalGeneration,
        cancel: cancelSignalGeneration,
        audioAlertsEnabled,
    },
    scalpController: {
        generationState: scalpingGenerationState,
        setGenerationState: updateScalpingGenerationState,
        generate: triggerScalpGeneration,
        cancel: cancelScalpGeneration,
        audioAlertsEnabled,
    },
    triggerSignalGeneration,
    triggerScalpGeneration,
  };
}