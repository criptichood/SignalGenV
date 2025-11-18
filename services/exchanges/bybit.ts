import type { CandleStick, Timeframe } from '@/types';
import type { ExchangeModule } from './types';

const BYBIT_API_BASE = 'https://api.bybit.com/v5/market';
const bybitIntervalMap: Record<Timeframe, string> = { '1m': '1', '3m': '3', '5m': '5', '15m': '15', '30m': '30', '1h': '60', '2h': '120', '4h': '240', '1d': 'D', '1w': 'W' };

class BybitExchange implements ExchangeModule {
    public readonly name = 'bybit';

    async getSymbols(): Promise<string[]> {
        const response = await fetch(`${BYBIT_API_BASE}/instruments-info?category=linear`);
        if (!response.ok) throw new Error('Failed to fetch instruments info from Bybit');
        const data = await response.json();
        return data.result.list
            .filter((s: any) => s.contractType === 'LinearPerpetual' && s.status === 'Trading' && s.quoteCoin === 'USDT')
            .map((s: any) => s.symbol)
            .sort();
    }

    async fetchData(symbol: string, timeframe: Timeframe, limit = 500): Promise<CandleStick[]> {
        const interval = bybitIntervalMap[timeframe];
        if (!interval) throw new Error(`Unsupported timeframe "${timeframe}" for Bybit.`);
        const response = await fetch(`${BYBIT_API_BASE}/kline?category=linear&symbol=${symbol}&interval=${interval}&limit=${limit}`);
        if (!response.ok) throw new Error(`Failed to fetch k-lines for ${symbol} from Bybit`);
        const data = await response.json();
        return data.result.list.map((d: any) => ({
            time: parseInt(d[0]) / 1000,
            open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]),
        })).reverse();
    }

    async fetchHistoricalData(symbol: string, timeframe: Timeframe, startTime: number, endTime: number): Promise<CandleStick[]> {
        const interval = bybitIntervalMap[timeframe];
        if (!interval) throw new Error(`Unsupported timeframe "${timeframe}" for Bybit.`);
        const response = await fetch(`${BYBIT_API_BASE}/kline?category=linear&symbol=${symbol}&interval=${interval}&start=${startTime}&end=${endTime}&limit=1000`);
        if (!response.ok) throw new Error(`Failed to fetch historical k-lines for ${symbol} from Bybit`);
        const data = await response.json();
        return data.result.list.map((d: any) => ({
            time: parseInt(d[0]) / 1000, open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]),
        })).reverse();
    }
    
    async fetchLivePrice(symbol: string): Promise<number> {
        const response = await fetch(`${BYBIT_API_BASE}/tickers?category=linear&symbol=${symbol}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch live price for ${symbol} from Bybit`);
        }
        const data = await response.json();
        const price = parseFloat(data.result.list[0]?.lastPrice);
        if (isNaN(price)) {
            throw new Error(`Invalid price format received for ${symbol} from Bybit`);
        }
        return price;
    }
}

export const bybitExchange = new BybitExchange();
