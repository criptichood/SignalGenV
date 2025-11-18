import React, { useState } from 'react';
import type { Signal, UserParams } from '@/types';
import { CopyIcon } from '@/components/icons/CopyIcon';
import { CheckIcon } from '@/components/icons/CheckIcon';
import { SparklesIcon } from '@/components/icons/SparklesIcon';
import { TrendingUpIcon } from '@/components/icons/TrendingUpIcon';
import { ZapIcon } from '@/components/icons/ZapIcon';
import { ClockIcon } from '@/components/icons/ClockIcon';

interface SignalCardMetricsProps {
    signal: Signal;
}

export const SignalCardMetrics = ({ signal }: SignalCardMetricsProps) => {
    const [isMetricsCopied, setIsMetricsCopied] = useState(false);

    let averageEntryPrice = (signal.entryRange[0] + signal.entryRange[1]) / 2;
    const stopLossDistancePercent = averageEntryPrice > 0 ? (Math.abs(averageEntryPrice - signal.stopLoss) / averageEntryPrice) * 100 : 0;
    const leveragedLossPercent = stopLossDistancePercent * signal.leverage;

    const handleCopyMetrics = () => {
        const textToCopy = `**Key Metrics**\nConfidence: ${signal.confidence}%\nLeverage: ${signal.leverage}x\nR/R (TP1): ${signal.rrRatio.toFixed(2)}\nLoss on Margin: ${leveragedLossPercent.toFixed(2)}%\nDuration: ${signal.tradeDuration}`;
        navigator.clipboard.writeText(textToCopy);
        setIsMetricsCopied(true);
        setTimeout(() => setIsMetricsCopied(false), 2000);
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 85) return 'bg-green-500';
        if (confidence >= 70) return 'bg-yellow-500';
        return 'bg-orange-500';
    };

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-300">Key Metrics</h4>
                <button onClick={handleCopyMetrics} className="p-1.5 rounded-md text-gray-400 hover:bg-gray-700 hover:text-gray-200 transition-colors" aria-label="Copy key metrics">
                    {isMetricsCopied ? <CheckIcon className="w-4 h-4 text-green-400" /> : <CopyIcon className="w-4 h-4" />}
                </button>
            </div>
            <div className="grid grid-cols-2 gap-3 flex-grow content-center">
                <div className="p-3 bg-gray-800 rounded-lg text-center flex flex-col justify-center">
                    <p className="text-xs text-cyan-300 font-semibold flex items-center justify-center gap-1.5"><SparklesIcon className="w-3 h-3"/> Confidence</p>
                    <p className="text-3xl font-bold font-mono text-white">{signal.confidence}<span className="text-xl">%</span></p>
                    <div className={`h-1 rounded-full mx-auto mt-1 w-1/2 ${getConfidenceColor(signal.confidence)}`}></div>
                </div>
                 <div className="p-3 bg-gray-800 rounded-lg text-center flex flex-col justify-center">
                    <p className="text-xs text-gray-400 font-semibold flex items-center justify-center gap-1.5"><TrendingUpIcon className="w-3 h-3"/> R/R (TP1)</p>
                    <p className="text-3xl font-bold font-mono text-white">1:{signal.rrRatio.toFixed(2)}</p>
                    <p className="text-xs text-red-400 font-mono mt-1">Loss: {leveragedLossPercent.toFixed(2)}%</p>
                </div>
                 <div className="p-3 bg-gray-800 rounded-lg text-center flex flex-col justify-center">
                    <p className="text-xs text-gray-400 font-semibold flex items-center justify-center gap-1.5"><ZapIcon className="w-3 h-3"/> Leverage</p>
                    <p className="text-3xl font-bold font-mono text-white">{signal.leverage}x</p>
                </div>
                 <div className="p-3 bg-gray-800 rounded-lg text-center flex flex-col justify-center">
                    <p className="text-xs text-gray-400 font-semibold flex items-center justify-center gap-1.5"><ClockIcon className="w-3 h-3"/> Duration</p>
                    <p className="text-lg font-semibold text-white truncate mt-1.5">{signal.tradeDuration}</p>
                </div>
            </div>
        </div>
    );
};