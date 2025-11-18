import React from 'react';
import type { Signal, SavedSignal } from '@/types';
import { CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowUpIcon } from '@/components/icons/ArrowUpIcon';
import { ArrowDownIcon } from '@/components/icons/ArrowDownIcon';
import { HistoryIcon } from '@/components/icons/HistoryIcon';
import { ClockIcon } from '@/components/icons/ClockIcon';
import { DatabaseIcon } from '@/components/icons/DatabaseIcon';
import { StarIcon } from '@/components/icons/StarIcon';
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/DropdownMenu';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { Tooltip } from '@/components/ui/Tooltip';
import { formatDistanceToNow } from '@/utils/date';
import { formatPrice, formatDataTimestamp, formatRemainingTime } from '@/utils/formatting';
import { CircleDashed, TrendingUp, TrendingDown, StopCircle } from 'lucide-react';


type DisplaySignal = (Signal & { symbol: string; currentPrice: number; timestamp: number; lastDataTimestamp?: number; type?: 'Scalp' | 'Swing' }) | SavedSignal;

interface SignalCardHeaderProps {
    signal: DisplaySignal;
    isFavorite?: boolean;
    onToggleFavorite?: () => void;
    remainingTime: number | null;
    isExpired: boolean;
    setExtendedDurationMs: React.Dispatch<React.SetStateAction<number>>;
    viewContext: 'generation' | 'history';
}

export const SignalCardHeader = ({ signal, isFavorite, onToggleFavorite, remainingTime, isExpired, setExtendedDurationMs, viewContext }: SignalCardHeaderProps) => {
    const isLong = signal.direction === 'LONG';
    const currentPrice = 'currentPrice' in signal ? signal.currentPrice : 0;

    const StatusBadge = () => {
        if (viewContext !== 'history' || !('status' in signal)) {
            return null;
        }

        const { status, hitTps } = signal;
        const hitTpsCount = hitTps?.length || 0;

        const statusConfig: Record<SavedSignal['status'], { variant: 'default' | 'success' | 'danger' | 'warning', icon: React.ReactNode }> = {
            Pending: { variant: 'default', icon: <CircleDashed className="w-3 h-3 mr-1"/> },
            Win: { variant: 'success', icon: <TrendingUp className="w-3 h-3 mr-1"/> },
            Loss: { variant: 'danger', icon: <TrendingDown className="w-3 h-3 mr-1"/> },
            Closed: { variant: 'warning', icon: <StopCircle className="w-3 h-3 mr-1"/> },
        };

        const currentConfig = statusConfig[status];
        const displayText = status === 'Win' && hitTpsCount > 0 ? `Win (TP ${hitTpsCount})` : status;

        return (
            <Badge variant={currentConfig.variant} className="text-sm px-3 py-1">
                {currentConfig.icon}
                <span>{displayText}</span>
            </Badge>
        );
    };

    return (
        <CardHeader className="border-b border-gray-700/50 pb-4">
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold tracking-wider">{signal.symbol}</span>
                         {currentPrice > 0 && <span className="text-lg text-gray-400 font-mono pt-1">{formatPrice(currentPrice)}</span>}
                    </CardTitle>
                     <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                        <StatusBadge />
                        <Badge variant={isLong ? 'success' : 'danger'} className="text-base font-bold px-4 py-1 shadow-lg">
                            {isLong ? <ArrowUpIcon className="w-5 h-5 mr-2" /> : <ArrowDownIcon className="w-5 h-5 mr-2" />}
                            {signal.direction}
                        </Badge>
                        {signal.predictionMode && <Badge className="bg-purple-500/20 text-purple-300">Predictive</Badge>}
                        <p className="text-sm text-gray-400 flex items-center">
                            <HistoryIcon className="w-4 h-4 inline-block mr-1.5" />
                            Generated {formatDistanceToNow(signal.timestamp)}
                        </p>
                        {remainingTime !== null && !isExpired && (
                           <div className="flex items-center gap-2">
                                <p className="text-sm text-yellow-400 flex items-center font-medium" title="Signal expires when timer ends">
                                    <ClockIcon className="w-4 h-4 inline-block mr-1.5" />
                                    Expires in:
                                    <span className="font-mono ml-1.5">{formatRemainingTime(remainingTime)}</span>
                                </p>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="p-1 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white" title="Extend expiration time">
                                            <PlusIcon className="w-3 h-3"/>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => setExtendedDurationMs(prev => prev + 15 * 60 * 1000)}>+15 Minutes</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setExtendedDurationMs(prev => prev + 30 * 60 * 1000)}>+30 Minutes</DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setExtendedDurationMs(prev => prev + 60 * 60 * 1000)}>+1 Hour</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                           </div>
                        )}
                        {signal.lastDataTimestamp && (
                            <p className="text-sm text-gray-400 flex items-center">
                                <DatabaseIcon className="w-4 h-4 inline-block mr-1.5" />
                                Data as of {formatDataTimestamp(signal.lastDataTimestamp)}
                            </p>
                        )}
                    </div>
                </div>
                 <Tooltip content={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
                    <button 
                        onClick={onToggleFavorite} 
                        className={`p-2 rounded-full transition-all duration-200 ease-in-out ${isFavorite ? 'text-yellow-300' : 'text-gray-500 hover:text-yellow-300'} disabled:cursor-not-allowed disabled:opacity-50`}
                        aria-label="Toggle Favorite"
                        disabled={viewContext === 'history' || isExpired}
                    >
                        <StarIcon 
                            isFilled={isFavorite} 
                            className="w-6 h-6 transition-transform duration-200 ease-in-out transform hover:scale-125 active:scale-95" 
                        />
                    </button>
                </Tooltip>
            </div>
        </CardHeader>
    );
};
