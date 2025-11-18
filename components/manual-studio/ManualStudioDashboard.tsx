import React from 'react';
import { LivePriceChart } from '@/components/chart/LivePriceChart';
import ManualSignalCard from './ManualSignalCard';
import type { CandleStick, Signal, AIFeedback, Exchange, Timeframe } from '@/types';

interface ManualStudioDashboardProps {
    formData: { exchange?: Exchange; symbol?: string; timeframe?: Timeframe; };
    chartData: CandleStick[];
    isChartLoading: boolean;
    manualSignal: Signal | null;
    aiFeedback: AIFeedback | null;
    setAiFeedback: (feedback: AIFeedback | null) => void;
}

const ManualStudioDashboard = (props: ManualStudioDashboardProps) => {
    const livePrice = props.chartData.length > 0 ? props.chartData[props.chartData.length - 1].close : null;
    
    // FIX: Add timeframe to displaySignal so it can be used for AI analysis.
    const displaySignal = props.manualSignal ? {
        ...props.manualSignal,
        symbol: props.formData.symbol || '',
        timeframe: props.formData.timeframe || '1h',
        currentPrice: livePrice || 0,
        timestamp: Date.now(),
        type: 'Manual' as const
    } : null;

    return (
        <div className="space-y-6">
            <LivePriceChart
                data={props.chartData}
                symbol={props.formData.symbol ? `${props.formData.symbol} (${props.formData.exchange})` : 'Select a Symbol'}
                currentPrice={livePrice}
                isLoading={props.isChartLoading}
                signal={props.manualSignal}
                signalParams={null} // Not AI-generated
                hitTpLevels={[]}
            />
            <ManualSignalCard
                signal={displaySignal}
                aiFeedback={props.aiFeedback}
                setAiFeedback={props.setAiFeedback}
            />
        </div>
    );
};

export default ManualStudioDashboard;