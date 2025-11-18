import React, { useState, useEffect, useRef } from 'react';
import type { Signal, UserParams, CandleStick } from '@/types';
import { useExchangeWebSocket } from '@/hooks/useExchangeWebSocket';
import { CheckCircle, Eye, Clock } from 'lucide-react';
import { parseDurationToMillis } from '@/utils/date';
import { Button } from '@/components/ui/Button';

interface SignalTrackerProps {
  signal: Signal;
  params: UserParams;
  timestamp: number;
  onRestore: () => void;
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: price < 1 ? 4 : 2,
        maximumFractionDigits: price < 1 ? 6 : 2,
    }).format(price);
};

const LevelRow = ({ label, value, isHit, className }: { label: string; value: string; isHit?: boolean; className?: string }) => (
    <div className={`flex justify-between items-center transition-colors ${isHit ? 'text-gray-500 line-through' : ''}`}>
        <div className="flex items-center gap-2">
            {isHit && <CheckCircle className="w-4 h-4 text-green-500" />}
            <span className={`font-semibold ${className}`}>{label}</span>
        </div>
        <span className={`font-mono ${className}`}>{value}</span>
    </div>
);

export const SignalTracker = ({ signal, params, timestamp, onRestore }: SignalTrackerProps) => {
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [priceColor, setPriceColor] = useState('text-white');
  const [hitTpLevels, setHitTpLevels] = useState<number[]>([]);
  const [isExpired, setIsExpired] = useState(false);
  const onExpireCalled = useRef(false);

  useEffect(() => {
    onExpireCalled.current = false;
  }, [timestamp]);

  useEffect(() => {
    const maxDuration = parseDurationToMillis(signal.tradeDuration);
    if (maxDuration === null) {
      setIsExpired(false);
      return;
    }
    const expiryTime = timestamp + maxDuration;

    const intervalId = setInterval(() => {
      const timeLeft = expiryTime - Date.now();
      if (timeLeft <= 0) {
        if (!onExpireCalled.current) {
            setIsExpired(true);
            onExpireCalled.current = true;
        }
        clearInterval(intervalId);
      }
    }, 1000);
    
    if (expiryTime - Date.now() <= 0) {
        setIsExpired(true);
        onExpireCalled.current = true;
    }

    return () => clearInterval(intervalId);
  }, [signal.tradeDuration, timestamp]);

  useExchangeWebSocket({
    exchange: params.exchange,
    symbol: params.symbol,
    type: 'kline',
    interval: '1m',
    onMessage: (candle: CandleStick) => {
      setLivePrice(prevPrice => {
        if (prevPrice) {
          if (candle.close > prevPrice) setPriceColor('text-green-400');
          else if (candle.close < prevPrice) setPriceColor('text-red-400');
        }
        return candle.close;
      });
    },
    enabled: true,
  });

  useEffect(() => {
    if (!livePrice) return;
    const isLong = signal.direction === 'LONG';
    for (const tp of signal.takeProfit) {
      if (!hitTpLevels.includes(tp)) {
        if ((isLong && livePrice >= tp) || (!isLong && livePrice <= tp)) {
          setHitTpLevels(prev => [...prev, tp]);
        }
      }
    }
  }, [livePrice, signal, hitTpLevels]);

  return (
    <div className="p-3 pt-2">
        <div className="bg-gray-900/50 p-3 rounded-lg text-center mb-3 border border-gray-700/50">
        <p className={`text-3xl font-mono font-bold transition-colors duration-200 ${priceColor}`}>
            {livePrice ? formatPrice(livePrice) : '...'}
        </p>
        </div>
        <div className="space-y-1.5 text-sm p-2">
            <LevelRow label="Entry" value={formatPrice(signal.entryRange[0])} className="text-blue-400"/>
            <hr className="border-gray-700 my-1"/>
            {signal.takeProfit.map((tp, i) => (
                <LevelRow 
                    key={i} 
                    label={`TP${i+1}`} 
                    value={formatPrice(tp)} 
                    isHit={hitTpLevels.includes(tp)} 
                    className="text-green-400"
                />
            ))}
            <hr className="border-gray-700 my-1"/>
            <LevelRow label="Stop Loss" value={formatPrice(signal.stopLoss)} className="text-red-400"/>
        </div>
        <div className="p-2 border-t border-gray-700/50 mt-2">
            <Button
                onClick={onRestore}
                disabled={isExpired}
                className="w-full text-sm py-2 h-auto"
            >
                {isExpired ? (
                    <><Clock className="w-4 h-4 mr-2" /> Expired</>
                ) : (
                    <><Eye className="w-4 h-4 mr-2" /> Restore View</>
                )}
            </Button>
        </div>
    </div>
  );
};