import React from 'react';
import type { LiveTrade } from '@/types';
import { ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react';

interface TimeAndSalesProps {
  trades: LiveTrade[];
}

const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { hour12: false });
}

export const TimeAndSales = ({ trades }: TimeAndSalesProps) => {
  return (
    <div className="h-full flex flex-col text-xs">
      <div className="grid grid-cols-3 text-gray-500 px-2 py-1 border-b border-gray-700">
        <span>Time</span>
        <span className="text-right">Price</span>
        <span className="text-right">Quantity</span>
      </div>
      <div className="flex-grow overflow-y-auto font-mono pr-1">
          {trades.length > 0 ? (
            trades.map((trade, index) => {
                const isBuy = !trade.isBuyerMaker; // Buyer is the Taker
                const colorClass = isBuy ? 'text-green-400' : 'text-red-400';
                return (
                    <div key={`${trade.id}-${index}`} className="grid grid-cols-3 items-center px-2 py-0.5 hover:bg-gray-700/40">
                        <span className="text-gray-400">{formatTime(trade.time)}</span>
                        <span className={`text-right font-semibold flex items-center justify-end gap-1 ${colorClass}`}>
                            {isBuy ? <ArrowUpRight className="w-3 h-3"/> : <ArrowDownLeft className="w-3 h-3"/>}
                            {parseFloat(trade.price).toFixed(2)}
                        </span>
                        <span className="text-right text-gray-200">{parseFloat(trade.quantity).toFixed(3)}</span>
                    </div>
                );
            })
          ) : (
             <div className="h-full flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
             </div>
          )}
      </div>
    </div>
  );
};