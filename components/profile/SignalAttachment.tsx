import React from 'react';
import type { SavedSignal } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ArrowUpIcon } from '../icons/ArrowUpIcon';
import { ArrowDownIcon } from '../icons/ArrowDownIcon';
import { CloseIcon } from '../icons/CloseIcon';
import { SparklesIcon } from '../icons/SparklesIcon';

interface SignalAttachmentProps {
  signal: SavedSignal;
  onClear?: () => void; // Optional: for use in the post creation form
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: price < 1 ? 4 : 2,
        maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
};

const SignalAttachment = ({ signal, onClear }: SignalAttachmentProps) => {
    const isLong = signal.direction.toUpperCase() === 'LONG';
    
    return (
        <div className="relative border border-gray-700 rounded-lg overflow-hidden bg-gray-900/50">
            {onClear && (
                <button 
                    type="button" 
                    onClick={onClear} 
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-gray-300 hover:text-white z-10"
                    aria-label="Remove attached signal"
                >
                    <CloseIcon className="w-4 h-4" />
                </button>
            )}
            <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                    <SparklesIcon className="w-5 h-5 text-cyan-400" />
                    <h4 className="font-bold text-base">{signal.symbol} AI Signal</h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                        <p className="text-xs text-gray-400">Direction</p>
                        <Badge variant={isLong ? 'success' : 'danger'}>
                            {isLong ? <ArrowUpIcon className="w-3 h-3 mr-1" /> : <ArrowDownIcon className="w-3 h-3 mr-1" />}
                            {signal.direction}
                        </Badge>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-gray-400">Timeframe</p>
                        <p className="font-semibold">{signal.timeframe.toUpperCase()}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-gray-400">Entry</p>
                        <p className="font-mono">{formatPrice(signal.entryRange[0])}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-gray-400">Stop Loss</p>
                        <p className="font-mono text-red-400">{formatPrice(signal.stopLoss)}</p>
                    </div>
                    {signal.takeProfit.slice(0, 2).map((tp, index) => (
                         <div key={index} className="space-y-1">
                            <p className="text-xs text-gray-400">Take Profit {index + 1}</p>
                            <p className="font-mono text-green-400">{formatPrice(tp)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SignalAttachment;
