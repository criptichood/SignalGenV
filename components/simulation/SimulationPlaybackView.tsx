import React, { useState, useEffect } from 'react';
import type { CandleStick, SimulationSetup } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { ReplayChart } from '@/components/simulation/ReplayChart';
import { useSimulation } from '@/hooks/useSimulation';
import { Loader2, X, CandlestickChart, LineChart } from 'lucide-react';
import { SimulationControlPanel } from '@/components/simulation/SimulationControlPanel';

interface SimulationPlaybackViewProps {
    simulation: SimulationSetup;
    onCloseView: () => void;
    onComplete: (result: SimulationSetup) => void;
    onPause: () => void;
    onResume: () => void;
    autoPlay?: boolean;
    liveChartData?: CandleStick[];
    isChartLoading?: boolean;
}

export const SimulationPlaybackView = ({
    simulation,
    onCloseView,
    onComplete,
    onPause,
    onResume,
    autoPlay = false,
    liveChartData = [],
    isChartLoading = false
}: SimulationPlaybackViewProps) => {
    const { state, displayState, controls } = useSimulation({
        simulation,
        onComplete,
        onPause,
        onResume,
        autoPlay,
    });
    
    const [chartType, setChartType] = useState<'candle' | 'line'>('candle');

    useEffect(() => {
        if (simulation.mode === 'live' && liveChartData.length > 0) {
            const latestCandle = liveChartData[liveChartData.length - 1];
            controls.liveUpdate(latestCandle);
        }
    }, [liveChartData, simulation.mode, controls]);

    const chartDataSource = simulation.mode === 'live' ? liveChartData : displayState.chartData;
    const isLiveMode = simulation.mode === 'live';

    if (isChartLoading || state.status === 'loading' || (isLiveMode && chartDataSource.length === 0)) {
        return (
            <Card className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 animate-spin text-cyan-400" />
                <p className="mt-4 text-lg">
                    {isLiveMode ? 'Connecting to live data stream...' : 'Preparing simulation...'}
                </p>
            </Card>
        );
    }
    
    const handleClose = () => {
        if (state.status === 'running' || state.status === 'paused') {
            controls.stop();
        }
        onCloseView();
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-4">
                            <CardTitle>Simulation: {simulation.symbol} ({simulation.mode.toUpperCase()})</CardTitle>
                            <div className="flex items-center gap-1 rounded-lg bg-gray-700 p-1">
                                <button onClick={() => setChartType('candle')} className={`p-1.5 rounded-md ${chartType === 'candle' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:bg-gray-600'}`}>
                                    <CandlestickChart className="w-5 h-5"/>
                                </button>
                                <button onClick={() => setChartType('line')} className={`p-1.5 rounded-md ${chartType === 'line' ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:bg-gray-600'}`}>
                                    <LineChart className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>
                         <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-700 transition-colors">
                            <X className="w-5 h-5 text-gray-400"/>
                        </button>
                    </CardHeader>
                    <CardContent>
                        <ReplayChart 
                            data={chartDataSource} 
                            simulation={simulation}
                            chartType={chartType}
                        />
                    </CardContent>
                     <CardFooter>
                        <div className="w-full flex items-center gap-3">
                            <span className="text-xs text-gray-400">Pan</span>
                            <input
                                type="range"
                                min={0}
                                max={state.candleIndex}
                                value={displayState.displayIndex}
                                onChange={(e) => controls.scrubTo(Number(e.target.value))}
                                disabled={state.isPlaying || state.candleIndex <= 0 || isLiveMode}
                            />
                        </div>
                    </CardFooter>
                </Card>
            </div>
            <div className="xl:col-span-1">
                <SimulationControlPanel
                    simulation={simulation}
                    state={state}
                    displayState={displayState}
                    controls={controls}
                />
            </div>
        </div>
    );
};