import { useEffect } from 'react';
import type { Signal, UserParams } from '@/types';
import { useHistoryStore } from '@/store/historyStore';
import { useStore } from '@/store';
import { playSound } from '@/utils/audio';

interface UseSignalHitDetectionProps {
    signal: Signal | null;
    currentParams: UserParams | null;
    livePrice: number | null;
    generationTimestamp: number | null;
    isAnalyzing: boolean;
    currentSymbol: string | undefined;
    isSignalEntered: boolean;
    setIsSignalEntered: (isEntered: boolean) => void;
    setToast: (toast: { message: string; variant: 'success' | 'warning' | 'error' } | null) => void;
}

export function useSignalHitDetection({
    signal,
    currentParams,
    livePrice,
    generationTimestamp,
    isAnalyzing,
    currentSymbol,
    isSignalEntered,
    setIsSignalEntered,
    setToast,
}: UseSignalHitDetectionProps) {
    const { signalHistory, setSignalHistory } = useHistoryStore();
    const { audioAlertsEnabled } = useStore();

    useEffect(() => {
        const historySignal = generationTimestamp ? signalHistory.find(s => s.timestamp === generationTimestamp) : null;
        if (!signal || !currentParams || !livePrice || !historySignal || isAnalyzing || currentSymbol !== currentParams.symbol) {
            return;
        }

        const isLong = signal.direction.toUpperCase() === 'LONG';

        // 1. Check for entry price hit
        if (!isSignalEntered) {
            const [entryStart, entryEnd] = signal.entryRange.sort((a, b) => a - b);
            
            // For a LONG, we wait for price to come DOWN to the entry zone (pullback).
            // For a SHORT, we wait for price to come UP to the entry zone (rally).
            if ((isLong && livePrice <= entryEnd) || (!isLong && livePrice >= entryStart)) {
                setIsSignalEntered(true);
                setToast({ message: `${currentParams.symbol} signal is now active! Entry price reached.`, variant: 'success' });
                if (audioAlertsEnabled) playSound('new-signal');
                // Return here to process SL/TP on the *next* price update, not this one.
                return;
            }
        }
        
        // If entry is hit, proceed to check SL/TP.
        // Do not continue if the trade is already resolved.
        if (historySignal.status === 'Loss' || historySignal.status === 'Closed') {
            return;
        }

        // 2. Check for Stop Loss hit
        if ((isLong && livePrice <= signal.stopLoss) || (!isLong && livePrice >= signal.stopLoss)) {
            setSignalHistory(prev => prev.map(s => s.id === historySignal.id ? { ...s, status: 'Loss' } : s));
            setToast({ message: `SL hit for ${currentParams.symbol}. Status set to LOSS.`, variant: 'warning' });
            if (audioAlertsEnabled) playSound('sl-hit');
            return; // Stop further checks once SL is hit
        }
        
        // 3. Check for Take Profit hits
        let newlyHitTpIndices: number[] = [];
        signal.takeProfit.forEach((tp, index) => {
            const alreadyHit = historySignal.hitTps?.includes(index);
            if (alreadyHit) return;

            const isHit = (isLong && livePrice >= tp) || (!isLong && livePrice <= tp);
            if (isHit) {
                newlyHitTpIndices.push(index);
                setToast({ message: `TP${index + 1} hit for ${currentParams.symbol}!`, variant: 'success' });
                if (audioAlertsEnabled) playSound('tp-hit');
            }
        });

        if (newlyHitTpIndices.length > 0) {
            setSignalHistory(prev => prev.map(s => {
                if (s.id === historySignal.id) {
                    const updatedHitTps = [...(s.hitTps || []), ...newlyHitTpIndices].sort((a, b) => a - b);
                    return { ...s, status: 'Win', hitTps: updatedHitTps };
                }
                return s;
            }));
        }
    }, [
        livePrice, 
        signal, 
        currentParams, 
        isAnalyzing, 
        isSignalEntered, 
        currentSymbol, 
        audioAlertsEnabled, 
        generationTimestamp, 
        signalHistory, 
        setSignalHistory, 
        setIsSignalEntered, 
        setToast
    ]);
}