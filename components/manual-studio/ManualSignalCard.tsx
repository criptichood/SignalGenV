import React, { useState } from 'react';
import type { Signal, AIFeedback, Timeframe } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { SignalCardLevels } from '@/components/signal/sections/SignalCardLevels';
import { SignalCardMetrics } from '@/components/signal/sections/SignalCardMetrics';
import { Button } from '@/components/ui/Button';
import { SparklesIcon } from '@/components/icons/SparklesIcon';
import { FormattedReasoning } from '@/components/FormattedReasoning';
import { Loader2Icon } from '@/components/icons/Loader2Icon';
import { getSecondOpinion } from '@/services/geminiService';
import { fetchData } from '@/services/exchangeService';
import { EmptyState } from '@/components/signal/states/EmptyState';

// FIX: Add timeframe to the DisplaySignal type.
type DisplaySignal = (Signal & { symbol: string; currentPrice: number; timestamp: number; type?: 'Manual', timeframe: Timeframe });

interface ManualSignalCardProps {
  signal: DisplaySignal | null;
  aiFeedback: AIFeedback | null;
  setAiFeedback: (feedback: AIFeedback | null) => void;
}

const getConfidenceColor = (confidence: number) => {
    if (confidence >= 75) return 'text-green-400';
    if (confidence >= 50) return 'text-yellow-400';
    return 'text-red-400';
}

export const ManualSignalCard = ({ signal, aiFeedback, setAiFeedback }: ManualSignalCardProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGetFeedback = async () => {
        if (!signal) return;
        setIsLoading(true);
        setError(null);
        setAiFeedback(null);
        try {
            const marketData = await fetchData('binance', signal.symbol, signal.timeframe);
            const tradeIdea = {
                symbol: signal.symbol,
                // FIX: Use timeframe from the signal object, which now gets it from the form.
                timeframe: signal.timeframe,
                direction: signal.direction,
                entry: signal.entryRange[0],
                takeProfit: signal.takeProfit[0],
                stopLoss: signal.stopLoss,
            };
            const feedback = await getSecondOpinion(tradeIdea, marketData);
            setAiFeedback(feedback);
        } catch (err: any) {
            setError(err.message || "Failed to get AI analysis.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!signal) {
        return <EmptyState />;
    }

    return (
        <Card className="relative backdrop-blur-sm bg-gray-800/70">
            <CardHeader>
                <CardTitle>Trade Blueprint: {signal.symbol}</CardTitle>
                <CardDescription>A review of your manually created trade plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SignalCardLevels signal={signal} />
                    <SignalCardMetrics signal={signal} />
                </div>
                <div className="pt-4 border-t border-gray-700">
                    <h4 className="text-base font-semibold text-gray-300 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <SparklesIcon className="w-4 h-4 text-purple-400"/> AI Second Opinion
                    </h4>
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 min-h-[150px] flex flex-col justify-center">
                        {isLoading ? (
                            <div className="text-center text-gray-400"><Loader2Icon className="w-6 h-6 animate-spin mx-auto mb-2"/>Analyzing your idea...</div>
                        ) : error ? (
                            <div className="text-center text-red-400">{error}</div>
                        ) : aiFeedback ? (
                            <div className="space-y-3 animate-fade-in-down">
                                <div className="flex justify-between items-center">
                                    <h5 className="font-semibold text-purple-300">Analysis Complete</h5>
                                    <p className={`font-bold text-lg ${getConfidenceColor(aiFeedback.confidence)}`}>{aiFeedback.confidence}% Confident</p>
                                </div>
                                <div className="text-sm text-gray-300 space-y-2">
                                    <div><h6 className="font-bold text-xs uppercase text-gray-400">Rationale</h6><FormattedReasoning text={aiFeedback.rationale} /></div>
                                    {aiFeedback.refinements && <div><h6 className="font-bold text-xs uppercase text-gray-400">Suggested Refinements</h6><FormattedReasoning text={aiFeedback.refinements} /></div>}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-sm text-gray-400 mb-3">Get Gemini's feedback on your trade setup.</p>
                                <Button onClick={handleGetFeedback} disabled={isLoading} className="bg-transparent border border-purple-500 text-purple-400 hover:bg-purple-500/10">
                                    <SparklesIcon className="w-4 h-4 mr-2"/> Analyze My Idea
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ManualSignalCard;