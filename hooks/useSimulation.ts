import { useState, useEffect, useRef, useCallback } from 'react';
import type { SimulationSetup, CandleStick } from '@/types';

interface UseSimulationProps {
    simulation: SimulationSetup;
    onComplete: (result: SimulationSetup) => void;
    onPause: () => void;
    onResume: () => void;
    autoPlay?: boolean;
}

const VISIBLE_CANDLE_COUNT = 100; // Number of candles to display on the chart at once
const FRAME_RATE = 30; // UI updates per second

export function useSimulation({ simulation, onComplete, onPause, onResume, autoPlay = false }: UseSimulationProps) {
    const [state, setState] = useState({
        status: 'loading' as 'loading' | 'running' | 'paused' | 'completed',
        isPlaying: false,
        candleIndex: -1,
        speed: 1, // candles per second
        outcome: null as string | null,
    });
    
    // State for what's visually displayed, allows for scrubbing without altering simulation state
    const [displayState, setDisplayState] = useState({
        chartData: [] as CandleStick[],
        currentCandle: null as CandleStick | null,
        pnl: 0,
        elapsedTime: '0m',
        displayIndex: -1,
    });
    
    const fullHistoricalData = useRef<CandleStick[]>([]);
    const intervalRef = useRef<number | null>(null);
    const timeAccumulatorRef = useRef(0);
    const stateRef = useRef(state);
    const simulationRef = useRef(simulation);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);
    
    useEffect(() => {
        simulationRef.current = simulation;
    }, [simulation]);

    const tradeStateRef = useRef({
        isActive: false,
        entryPrice: 0,
        entryCandleIndex: -1,
        hitTpLevels: [] as number[],
    });

    const stopInterval = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const completeSimulation = useCallback((outcome: string, pnl: number, finalIndex: number) => {
        stopInterval();
        const currentSim = simulationRef.current;
        const elapsedMs = Date.now() - currentSim.timestamp;
        const finalElapsedMinutes = currentSim.mode === 'live' ? Math.floor(elapsedMs / 60000) : finalIndex + 1;
        const finalElapsedTime = `${finalElapsedMinutes}m`;

        const finalState = {
            ...currentSim,
            status: 'completed' as const,
            result: {
                outcome: outcome as any,
                duration: finalElapsedTime,
                pnl,
            }
        };

        if (stateRef.current.status !== 'completed') {
            setState(prev => ({...prev, status: 'completed', outcome, isPlaying: false }));
            setDisplayState(prev => ({...prev, pnl, elapsedTime: finalElapsedTime}));
            onComplete(finalState);
        }
    }, [onComplete, stopInterval]);
    
    const calculateDisplayStateForIndex = useCallback((index: number) => {
        if (index < 0 || !fullHistoricalData.current[index]) return {};
        
        const candle = fullHistoricalData.current[index];
        const currentSim = simulationRef.current;

        const { isActive, entryPrice } = tradeStateRef.current;
        const isLong = currentSim.direction === 'LONG';
        let pnl = 0;
        
        if (isActive) {
            pnl = ((candle.close - entryPrice) / entryPrice) * 100 * currentSim.leverage * (isLong ? 1 : -1);
        }
        
        const windowStart = Math.max(0, index - VISIBLE_CANDLE_COUNT + 1);
        const chartData = fullHistoricalData.current.slice(windowStart, index + 1);

        return {
            chartData,
            currentCandle: candle,
            pnl,
            elapsedTime: `${index + 1}m`,
            displayIndex: index,
        };
    }, []);

    const tick = useCallback(() => {
        const currentState = stateRef.current;
        if (currentState.status !== 'running' || !currentState.isPlaying) {
            stopInterval();
            return;
        }
        
        const msPerFrame = 1000 / FRAME_RATE;
        timeAccumulatorRef.current += msPerFrame;
        const msPerCandle = 1000 / currentState.speed;
        
        if (timeAccumulatorRef.current < msPerCandle) return;

        const candlesToProcess = Math.floor(timeAccumulatorRef.current / msPerCandle);
        timeAccumulatorRef.current %= msPerCandle;
        
        let nextIndex = currentState.candleIndex;
        
        for (let i = 0; i < candlesToProcess; i++) {
            if (stateRef.current.status === 'completed') break;
            
            nextIndex++;

            if (nextIndex >= fullHistoricalData.current.length) {
                const lastCandle = fullHistoricalData.current[fullHistoricalData.current.length - 1];
                let finalPnl = 0;
                if (tradeStateRef.current.isActive) {
                    const { entryPrice } = tradeStateRef.current;
                    const isLong = simulationRef.current.direction === 'LONG';
                    finalPnl = ((lastCandle.close - entryPrice) / entryPrice) * 100 * simulationRef.current.leverage * (isLong ? 1 : -1);
                }
                completeSimulation("Expired", finalPnl, nextIndex - 1);
                return;
            }

            const candle = fullHistoricalData.current[nextIndex];
            const currentSim = simulationRef.current;
            const { isActive, entryPrice, hitTpLevels } = tradeStateRef.current;
            const isLong = currentSim.direction === 'LONG';
            
            if (!isActive) {
                if ((isLong && candle.low <= currentSim.entryRange[0]) || (!isLong && candle.high >= currentSim.entryRange[0])) {
                    tradeStateRef.current.isActive = true;
                    tradeStateRef.current.entryPrice = currentSim.entryRange[0];
                    tradeStateRef.current.entryCandleIndex = nextIndex;
                }
            }
            
            if (tradeStateRef.current.isActive) {
                if ((isLong && candle.low <= currentSim.stopLoss) || (!isLong && candle.high >= currentSim.stopLoss)) {
                    const finalPnl = ((currentSim.stopLoss - entryPrice) / entryPrice) * 100 * currentSim.leverage * (isLong ? 1 : -1);
                    completeSimulation("SL Hit", finalPnl, nextIndex);
                    return;
                }
                
                const remainingTps = currentSim.takeProfit.filter(tp => !hitTpLevels.includes(tp));
                if (remainingTps.length > 0) {
                    const nextTp = isLong ? Math.min(...remainingTps) : Math.max(...remainingTps);
                    if ((isLong && candle.high >= nextTp) || (!isLong && candle.low <= nextTp)) {
                        tradeStateRef.current.hitTpLevels.push(nextTp);
                        const hitTpIndex = currentSim.takeProfit.indexOf(nextTp) + 1;
                        const newOutcome = `TP${hitTpIndex} Hit`;

                        if (remainingTps.length === 1) {
                            const finalPnl = ((nextTp - entryPrice) / entryPrice) * 100 * currentSim.leverage * (isLong ? 1 : -1);
                            completeSimulation(newOutcome, finalPnl, nextIndex);
                            return;
                        } else {
                            setState(prev => ({ ...prev, outcome: newOutcome }));
                        }
                    }
                }
            }
        }
        
        const newDisplayState = calculateDisplayStateForIndex(nextIndex);
        setDisplayState(prev => ({...prev, ...newDisplayState}));
        setState(prev => ({ ...prev, candleIndex: nextIndex }));

    }, [completeSimulation, calculateDisplayStateForIndex, stopInterval]);

    const liveUpdate = useCallback((candle: CandleStick) => {
        const currentSim = simulationRef.current;
        const currentState = stateRef.current;
        if (currentSim.mode !== 'live' || currentState.status === 'completed' || !currentState.isPlaying) return;

        if (currentState.status === 'paused') {
            setState(prev => ({ ...prev, status: 'running' }));
            onResume();
        }

        const { isActive, entryPrice, hitTpLevels } = tradeStateRef.current;
        const isLong = currentSim.direction === 'LONG';

        if (!isActive) {
            if ((isLong && candle.low <= currentSim.entryRange[0]) || (!isLong && candle.high >= currentSim.entryRange[0])) {
                tradeStateRef.current.isActive = true;
                tradeStateRef.current.entryPrice = currentSim.entryRange[0];
            }
        }

        if (tradeStateRef.current.isActive) {
            if ((isLong && candle.low <= currentSim.stopLoss) || (!isLong && candle.high >= currentSim.stopLoss)) {
                const finalPnl = ((currentSim.stopLoss - entryPrice) / entryPrice) * 100 * currentSim.leverage * (isLong ? 1 : -1);
                completeSimulation("SL Hit", finalPnl, 0);
                return;
            }

            const remainingTps = currentSim.takeProfit.filter(tp => !hitTpLevels.includes(tp));
            if (remainingTps.length > 0) {
                const nextTp = isLong ? Math.min(...remainingTps) : Math.max(...remainingTps);
                if ((isLong && candle.high >= nextTp) || (!isLong && candle.low <= nextTp)) {
                    tradeStateRef.current.hitTpLevels.push(nextTp);
                    const hitTpIndex = currentSim.takeProfit.indexOf(nextTp) + 1;
                    const newOutcome = `TP${hitTpIndex} Hit`;
                    if (remainingTps.length === 1) {
                        const finalPnl = ((nextTp - entryPrice) / entryPrice) * 100 * currentSim.leverage * (isLong ? 1 : -1);
                        completeSimulation(newOutcome, finalPnl, 0);
                        return;
                    } else {
                        setState(prev => ({ ...prev, outcome: newOutcome }));
                    }
                }
            }
        }

        let pnl = 0;
        if (tradeStateRef.current.isActive) {
            pnl = ((candle.close - entryPrice) / entryPrice) * 100 * currentSim.leverage * (isLong ? 1 : -1);
        }
        const elapsedMs = Date.now() - currentSim.timestamp;
        const elapsedMins = Math.floor(elapsedMs / 60000);
        
        setDisplayState(prev => ({
            ...prev,
            currentCandle: candle,
            pnl,
            elapsedTime: `${elapsedMins}m`,
        }));
    }, [completeSimulation, onResume]);

    const startSimulation = useCallback(() => {
        if (simulationRef.current.mode === 'live') {
            setState(prev => ({...prev, isPlaying: true, status: 'running' }));
            onResume();
            return;
        }

        if (intervalRef.current) clearInterval(intervalRef.current);
        const newIndex = state.candleIndex === displayState.displayIndex ? state.candleIndex : displayState.displayIndex;
        
        setState(prev => ({...prev, isPlaying: true, status: 'running', candleIndex: newIndex }));
        onResume();
        intervalRef.current = window.setInterval(tick, 1000 / FRAME_RATE);
    }, [tick, state.candleIndex, displayState.displayIndex, onResume]);
    
    const pauseSimulation = useCallback(() => {
        if (simulationRef.current.mode === 'replay') stopInterval();
        setState(prev => ({ ...prev, isPlaying: false, status: 'paused' }));
        onPause();
    }, [stopInterval, onPause]);

    useEffect(() => {
        stopInterval();
        tradeStateRef.current = { isActive: false, entryPrice: 0, hitTpLevels: [], entryCandleIndex: -1 };
        
        if (simulation.mode === 'replay' && simulation.historicalData) {
            fullHistoricalData.current = simulation.historicalData;
            setState({ status: 'paused', candleIndex: -1, outcome: null, isPlaying: false, speed: 1 });
            setDisplayState({
                chartData: simulation.historicalData.slice(0, VISIBLE_CANDLE_COUNT),
                currentCandle: null, pnl: 0, elapsedTime: '0m', displayIndex: -1,
            });
            if (autoPlay) setTimeout(() => startSimulation(), 100);

        } else if (simulation.mode === 'live') {
            setState({ status: 'paused', candleIndex: -1, outcome: null, isPlaying: autoPlay, speed: 1 });
            setDisplayState({
                chartData: [], currentCandle: null, pnl: 0, elapsedTime: '0m', displayIndex: -1,
            });
            if (autoPlay) onResume();
        }
        
        return () => stopInterval();
    }, [simulation.id, autoPlay, startSimulation, onResume, stopInterval]);

    const controls = {
        togglePlay: () => stateRef.current.isPlaying ? pauseSimulation() : startSimulation(),
        reset: () => {
            if (simulationRef.current.mode === 'live') return;
            stopInterval();
            tradeStateRef.current = { isActive: false, entryPrice: 0, hitTpLevels: [], entryCandleIndex: -1 };
            setState({ status: 'paused', isPlaying: false, candleIndex: -1, speed: 1, outcome: null });
            setDisplayState({
                chartData: fullHistoricalData.current.slice(0, VISIBLE_CANDLE_COUNT),
                currentCandle: null, pnl: 0, elapsedTime: '0m', displayIndex: -1,
            });
        },
        setSpeed: (speed: number) => setState(prev => ({...prev, speed})),
        stop: () => {
            if (stateRef.current.status !== 'completed') {
                completeSimulation('Stopped', displayState.pnl, state.candleIndex);
            }
        },
        scrubTo: (index: number) => {
            if (state.isPlaying || state.status === 'completed' || simulationRef.current.mode === 'live') return;
            const scrubIndex = Math.max(0, Math.min(state.candleIndex, index));
            const newDisplayState = calculateDisplayStateForIndex(scrubIndex);
            setDisplayState(prev => ({ ...prev, ...newDisplayState }));
        },
        liveUpdate,
    };

    return { state, displayState, controls };
}