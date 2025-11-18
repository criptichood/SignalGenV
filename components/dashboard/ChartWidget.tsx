import React, { useState, useEffect } from 'react';
import { useChartDataQuery } from '@/hooks/useChartDataQuery';
import { useExchangeWebSocket } from '@/hooks/useExchangeWebSocket';
import { LivePriceChart } from '@/components/chart/LivePriceChart';
import type { CandleStick } from '@/types';
const MAX_CHART_CANDLES = 1440;

export const ChartWidget = () => {
    const [chartData, setChartData] = useState<CandleStick[]>([]);
    const { data: initialChartData, isLoading: isChartLoading } = useChartDataQuery('binance', 'BTCUSDT');
    
    useEffect(() => {
        if (initialChartData) {
            setChartData(initialChartData);
        }
    }, [initialChartData]);
    
    const livePrice = chartData.length > 0 ? chartData[chartData.length - 1].close : null;

    useExchangeWebSocket({
        exchange: 'binance', symbol: 'BTCUSDT', type: 'kline', interval: '1m',
        onMessage: (candle) => {
            setChartData(prevData => {
                const lastCandle = prevData[prevData.length - 1];
                if (lastCandle && candle.time === lastCandle.time) {
                    const newData = [...prevData];
                    newData[newData.length - 1] = candle;
                    return newData;
                } else {
                    return [...prevData, candle].slice(-MAX_CHART_CANDLES);
                }
            });
        },
        enabled: true,
    });
    
    return (
        <LivePriceChart 
            data={chartData}
            symbol="BTCUSDT (Binance)"
            currentPrice={livePrice}
            isLoading={isChartLoading}
            signal={null}
            signalParams={null}
            hitTpLevels={[]}
        />
    );
};