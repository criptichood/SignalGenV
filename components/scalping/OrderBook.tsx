import React, { useMemo } from 'react';
import type { OrderBookUpdate } from '@/types';
import { Loader2 } from 'lucide-react';

interface OrderBookProps {
  data: OrderBookUpdate | null;
  currentPrice: number | null;
}

const formatPrice = (price: string, currentPrice: number | null) => {
    const priceNum = parseFloat(price);
    if (isNaN(priceNum)) return '-';
    const minDecimals = (currentPrice ?? 1) < 1 ? 4 : 2;
    const maxDecimals = (currentPrice ?? 1) < 0.1 ? 6 : 4;
    return priceNum.toLocaleString('en-US', { minimumFractionDigits: minDecimals, maximumFractionDigits: maxDecimals });
}

const OrderBookRow = ({ price, quantity, total, maxTotal, type, currentPrice }: { price: string; quantity: string; total: number; maxTotal: number; type: 'bid' | 'ask'; currentPrice: number | null; }) => {
  const barWidth = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  const priceColor = type === 'bid' ? 'text-green-400' : 'text-red-400';
  const barBg = type === 'bid' ? 'bg-green-500/10' : 'bg-red-500/10';
  
  return (
    <div className="relative grid grid-cols-3 text-xs font-mono py-0.5 px-2 hover:bg-gray-700/40">
      <div className={`absolute top-0 bottom-0 right-0 ${barBg}`} style={{ width: `${barWidth}%` }}></div>
      <span className={`z-10 ${priceColor}`}>{formatPrice(price, currentPrice)}</span>
      <span className="z-10 text-right text-gray-200">{parseFloat(quantity).toFixed(3)}</span>
      <span className="z-10 text-right text-gray-400">{total.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
    </div>
  );
};


export const OrderBook = ({ data, currentPrice }: OrderBookProps) => {
  const { asks, bids, maxTotal } = useMemo(() => {
    if (!data) return { asks: [], bids: [], maxTotal: 0 };
    
    let cumulativeAskTotal = 0;
    const asks = data.asks.slice(0, 18).reverse().map(([price, quantity]) => {
      cumulativeAskTotal += parseFloat(price) * parseFloat(quantity);
      return { price, quantity, total: cumulativeAskTotal };
    });

    let cumulativeBidTotal = 0;
    const bids = data.bids.slice(0, 18).map(([price, quantity]) => {
      cumulativeBidTotal += parseFloat(price) * parseFloat(quantity);
      return { price, quantity, total: cumulativeBidTotal };
    });
    
    const maxTotal = Math.max(cumulativeAskTotal, cumulativeBidTotal);
    
    return { asks, bids, maxTotal };
  }, [data]);
  
  const priceSpread = useMemo(() => {
      if (!data || data.asks.length === 0 || data.bids.length === 0) return null;
      const bestAsk = parseFloat(data.asks[0][0]);
      const bestBid = parseFloat(data.bids[0][0]);
      const spread = bestAsk - bestBid;
      const spreadPercent = (spread / bestAsk) * 100;
      const priceNum = currentPrice ?? bestAsk;
      const minDecimals = priceNum < 1 ? 4 : 2;
      return { spread: spread.toFixed(minDecimals), percent: spreadPercent.toFixed(4) };
  }, [data, currentPrice]);

  const priceColor = useMemo(() => {
      if (!currentPrice || !data || data.bids.length === 0) return 'text-white';
      const bestBid = parseFloat(data.bids[0][0]);
      if (currentPrice > bestBid) return 'text-green-400';
      if (currentPrice < bestBid) return 'text-red-400';
      return 'text-white';
  }, [currentPrice, data]);

  return (
    <div className="h-full flex flex-col text-xs">
      {data ? (
        <>
          <div className="grid grid-cols-3 text-gray-500 px-2 py-1 border-b border-gray-700">
              <span>Price (USD)</span>
              <span className="text-right">Quantity</span>
              <span className="text-right">Total</span>
          </div>
          <div className="flex-1 overflow-y-auto flex flex-col-reverse pr-1">
            {asks.map((ask) => <OrderBookRow key={ask.price} {...ask} maxTotal={maxTotal} type="ask" currentPrice={currentPrice} />)}
          </div>
          
          <div className="py-1 my-1 border-y border-gray-600 bg-gray-900/50 text-center">
              <span className={`font-bold font-mono text-lg transition-colors duration-200 ${priceColor}`}>
                  {currentPrice ? formatPrice(String(currentPrice), currentPrice) : '...'}
              </span>
              {priceSpread && (
                  <div className="text-xs text-gray-400">
                     Spread: ${priceSpread.spread} ({priceSpread.percent}%)
                  </div>
              )}
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            {bids.map((bid) => <OrderBookRow key={bid.price} {...bid} maxTotal={maxTotal} type="bid" currentPrice={currentPrice} />)}
          </div>
        </>
      ) : (
        <div className="h-full flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        </div>
      )}
    </div>
  );
};