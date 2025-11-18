import React from 'react';
import type { SimulationSetup } from '@/types';
import type { useSimulation } from '@/hooks/useSimulation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PlayIcon } from '@/components/icons/PlayIcon';
import { PauseIcon } from '@/components/icons/PauseIcon';
import { RestartIcon } from '@/components/icons/RestartIcon';

interface SimulationControlPanelProps {
  simulation: SimulationSetup;
  state: ReturnType<typeof useSimulation>['state'];
  displayState: ReturnType<typeof useSimulation>['displayState'];
  controls: ReturnType<typeof useSimulation>['controls'];
}

const StatItem = ({ label, value, className }: { label: string; value: string | React.ReactNode; className?: string }) => (
    <div className="flex justify-between items-baseline">
        <span className="text-sm text-gray-400">{label}</span>
        <span className={`font-mono text-lg font-bold ${className}`}>{value}</span>
    </div>
);

export const SimulationControlPanel = ({ simulation, state, displayState, controls }: SimulationControlPanelProps) => {
    const isLong = simulation.direction === 'LONG';
    const pnlColor = displayState.pnl > 0 ? 'text-green-400' : displayState.pnl < 0 ? 'text-red-400' : 'text-white';
    const speedOptions = [ {label: '1x', value: 1}, {label: '2x', value: 2}, {label: '5x', value: 5}, {label: '10x', value: 10}, ];
    const isLiveMode = simulation.mode === 'live';
    const currentOutcome = state.status === 'completed' ? state.outcome : (state.outcome || simulation.status);

    const renderPlayButton = () => {
        if (state.status === 'completed') {
            return (
                <Button onClick={controls.reset} className="w-full" disabled={isLiveMode}>
                    <RestartIcon className="w-5 h-5 mr-2"/> Replay
                </Button>
            );
        }
        return (
            <Button onClick={controls.togglePlay} className="w-full">
                {state.isPlaying ? <PauseIcon className="w-5 h-5 mr-2"/> : <PlayIcon className="w-5 h-5 mr-2"/>}
                {state.isPlaying ? 'Pause' : 'Play'}
            </Button>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Trade Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <StatItem label="Direction" value={<span className={isLong ? 'text-green-400' : 'text-red-400'}>{simulation.direction}</span>} />
                <StatItem label="Entry Price" value={`$${simulation.entryRange[0].toFixed(2)}`} />
                <StatItem label="Current Price" value={`$${displayState.currentCandle?.close.toFixed(2) ?? '...'}`} />
                <StatItem label="Unrealized PnL" value={`${displayState.pnl.toFixed(2)}%`} className={pnlColor} />
                <StatItem label="Duration" value={displayState.elapsedTime} />
                <StatItem label="Status" value={<span className="capitalize text-cyan-400">{currentOutcome}</span>} />
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
                {renderPlayButton()}
                <div className="grid grid-cols-4 gap-1 w-full">
                    {speedOptions.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => controls.setSpeed(opt.value)}
                            className={`py-2 rounded-lg text-xs font-bold transition-colors ${state.speed === opt.value ? 'bg-cyan-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
                            disabled={isLiveMode || state.status === 'completed'}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </CardFooter>
        </Card>
    );
};