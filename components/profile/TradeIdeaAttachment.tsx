import React, { useState } from 'react';
import type { TradeIdea, AIFeedback, Timeframe } from '../../types';
import { Badge } from '../ui/Badge';
import { ArrowUpIcon } from '../icons/ArrowUpIcon';
import { ArrowDownIcon } from '../icons/ArrowDownIcon';
import { CloseIcon } from '../icons/CloseIcon';
import { LightbulbIcon } from '../icons/LightbulbIcon';
import { Button } from '../ui/Button';
import { SparklesIcon } from '../icons/SparklesIcon';
import { Loader2Icon } from '../icons/Loader2Icon';
import { FormattedReasoning } from '../FormattedReasoning';
import { getSecondOpinion } from '../../services/geminiService';
import { fetchData } from '../../services/exchangeService';

interface TradeIdeaAttachmentProps {
  idea: { userIdea: TradeIdea; aiFeedback?: AIFeedback; };
  setIdea?: (idea: { userIdea: TradeIdea; aiFeedback?: AIFeedback; } | null) => void;
  onClear?: () => void;
  isReadOnly?: boolean;
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: price < 1 ? 4 : 2,
        maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
};

const getConfidenceColor = (confidence: number) => {
    if (confidence >= 75) return 'text-green-400';
    if (confidence >= 50) return 'text-yellow-400';
    return 'text-red-400';
}

export const TradeIdeaAttachment = ({ idea, setIdea, onClear, isReadOnly = false }: TradeIdeaAttachmentProps) => {
    const { userIdea, aiFeedback } = idea;
    const isLong = userIdea.direction === 'LONG';
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGetFeedback = async () => {
        if (!setIdea) return;
        setIsLoading(true);
        setError(null);
        try {
            const marketData = await fetchData('binance', userIdea.symbol, userIdea.timeframe);
            const feedback = await getSecondOpinion(userIdea, marketData);
            setIdea({ ...idea, aiFeedback: feedback });
        } catch (err: any) {
            setError(err.message || "Failed to get AI analysis.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="relative border border-purple-500/50 rounded-lg overflow-hidden bg-gray-900/50">
            {onClear && (
                <button 
                    type="button" 
                    onClick={onClear} 
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-gray-300 hover:text-white z-10"
                    aria-label="Remove attached idea"
                >
                    <CloseIcon className="w-4 h-4" />
                </button>
            )}
            <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                    <LightbulbIcon className="w-5 h-5 text-purple-400" />
                    <h4 className="font-bold text-base">My Trade Idea: {userIdea.symbol}</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    {/* User's Idea */}
                    <div className="space-y-1"><p className="text-xs text-gray-400">Direction</p><Badge variant={isLong ? 'success' : 'danger'}>{isLong ? <ArrowUpIcon className="w-3 h-3 mr-1"/> : <ArrowDownIcon className="w-3 h-3 mr-1"/>}{userIdea.direction}</Badge></div>
                    <div className="space-y-1"><p className="text-xs text-gray-400">Timeframe</p><p className="font-semibold">{userIdea.timeframe.toUpperCase()}</p></div>
                    <div className="space-y-1"><p className="text-xs text-gray-400">Entry</p><p className="font-mono">{formatPrice(userIdea.entry)}</p></div>
                    <div className="space-y-1"><p className="text-xs text-gray-400">Take Profit</p><p className="font-mono text-green-400">{formatPrice(userIdea.takeProfit)}</p></div>
                    <div className="space-y-1 col-span-2"><p className="text-xs text-gray-400">Stop Loss</p><p className="font-mono text-red-400">{formatPrice(userIdea.stopLoss)}</p></div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700/50">
                    {aiFeedback ? (
                        <div className="space-y-3 animate-fade-in-down">
                            <div className="flex justify-between items-center">
                                <h5 className="font-semibold text-purple-300 flex items-center gap-2"><SparklesIcon className="w-4 h-4"/> AI Second Opinion</h5>
                                <p className={`font-bold text-lg ${getConfidenceColor(aiFeedback.confidence)}`}>{aiFeedback.confidence}% Confident</p>
                            </div>
                            <div className="text-sm text-gray-300 space-y-2">
                                <div><h6 className="font-bold text-xs uppercase text-gray-400">Rationale</h6><FormattedReasoning text={aiFeedback.rationale} /></div>
                                {aiFeedback.refinements && <div><h6 className="font-bold text-xs uppercase text-gray-400">Suggested Refinements</h6><FormattedReasoning text={aiFeedback.refinements} /></div>}
                            </div>
                        </div>
                    ) : (
                        isReadOnly ? (
                            <p className="text-xs text-center text-gray-500">No AI analysis was requested for this idea.</p>
                        ) : (
                            <>
                                {error && <p className="text-xs text-center text-red-400 mb-2">{error}</p>}
                                <Button onClick={handleGetFeedback} disabled={isLoading} className="w-full h-9 text-sm bg-transparent border border-purple-500 text-purple-400 hover:bg-purple-500/10">
                                    {isLoading ? <><Loader2Icon className="w-4 h-4 mr-2 animate-spin"/>Analyzing...</> : <><SparklesIcon className="w-4 h-4 mr-2"/>Get AI Second Opinion</>}
                                </Button>
                            </>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};
