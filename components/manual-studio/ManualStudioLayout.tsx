import React from 'react';
import ManualControls from './ManualControls';
import ManualStudioDashboard from './ManualStudioDashboard';
import type { UserParams, Signal, AIFeedback, CandleStick, Exchange, Timeframe } from '@/types';
import { useManualSignalStore } from '@/store/manualSignalStore';

interface ManualStudioLayoutProps {
    formData: ManualSignalState['formData'];
    setFormData: ManualSignalState['setFormData'];
    symbols: string[];
    symbolsQueryError: Error | null;
    chartData: CandleStick[];
    isChartLoading: boolean;
    chartDataError: Error | null;
    manualSignal: Signal | null;
    setManualSignal: (signal: Signal | null) => void;
    aiFeedback: AIFeedback | null;
    setAiFeedback: (feedback: AIFeedback | null) => void;
    isStaging: boolean;
    onStageSignal: () => void;
}

interface ManualSignalState {
    formData: {
        exchange: Exchange;
        symbol: string;
        timeframe: Timeframe;
        direction: 'LONG' | 'SHORT';
        entry: string;
        sl: string;
        tp1: string;
        tp2: string;
        tp3: string;
        accountSize: string;
        riskPercent: string;
        leverage: string;
    };
    setFormData: (fn: (prev: ManualSignalState['formData']) => ManualSignalState['formData']) => void;
    // ... other properties
}

export const ManualStudioLayout = (props: ManualStudioLayoutProps) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div className="lg:col-span-1 xl:col-span-1">
                <ManualControls
                    formData={props.formData}
                    setFormData={props.setFormData}
                    symbols={props.symbols}
                    setManualSignal={props.setManualSignal}
                    isStaging={props.isStaging}
                    onStageSignal={props.onStageSignal}
                />
            </div>
            <div className="lg:col-span-2 xl:col-span-3">
                <ManualStudioDashboard
                    formData={props.formData}
                    chartData={props.chartData}
                    isChartLoading={props.isChartLoading}
                    manualSignal={props.manualSignal}
                    aiFeedback={props.aiFeedback}
                    setAiFeedback={props.setAiFeedback}
                />
            </div>
        </div>
    );
}

export default ManualStudioLayout;