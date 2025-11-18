import type { CandleStick, Timeframe } from '@/types';
import type { ExchangeModule } from './types';

const BINANCE_API_BASE = 'https://fapi.binance.com/fapi/v1';
const binanceValidIntervals: readonly Timeframe[] = ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '1d', '1w'];

class BinanceExchange implements ExchangeModule {
    public readonly name = 'binance';

    async getSymbols(): Promise<string[]> {
        const response = await fetch(`${BINANCE_API_BASE}/exchangeInfo`);
        if (!response.ok) throw new Error('Failed to fetch exchange info from Binance');
        const data = await response.json();
        return data.symbols
            .filter((s: any) => s.quoteAsset === 'USDT' && s.contractType === 'PERPETUAL' && s.status === 'TRADING')
            .map((s: any) => s.symbol)
            .sort();
    }

    async fetchData(symbol: string, timeframe: Timeframe, limit = 500): Promise<CandleStick[]> {
        if (!binanceValidIntervals.includes(timeframe)) {
            throw new Error(`Unsupported timeframe "${timeframe}" for Binance.`);
        }
        const response = await fetch(`${BINANCE_API_BASE}/klines?symbol=${symbol}&interval=${timeframe}&limit=${limit}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ msg: `HTTP status ${response.status}` }));
            throw new Error(`Failed to fetch k-lines for ${symbol} from Binance: ${errorData.msg || 'Unknown error'}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error('Received malformed data from Binance. Expected an array of k-lines.');
        }
        return data.map((d: any) => ({
            time: d[0] / 1000,
            open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]),
        }));
    }

    async fetchHistoricalData(symbol: string, interval: Timeframe, startTime: number, endTime: number): Promise<CandleStick[]> {
        if (!binanceValidIntervals.includes(interval)) {
            throw new Error(`Unsupported timeframe "${interval}" for Binance.`);
        }
        const response = await fetch(`${BINANCE_API_BASE}/klines?symbol=${symbol}&interval=${interval}&startTime=${startTime}&endTime=${endTime}&limit=1500`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ msg: `HTTP status ${response.status}` }));
            throw new Error(`Failed to fetch historical k-lines for ${symbol} from Binance: ${errorData.msg || 'Unknown error'}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error('Received malformed historical data from Binance. Expected an array of k-lines.');
        }
        return data.map((d: any) => ({
            time: d[0] / 1000, open: parseFloat(d[1]), high: parseFloat(d[2]), low: parseFloat(d[3]), close: parseFloat(d[4]),
        }));
    }
    
    async fetchLivePrice(symbol: string): Promise<number> {
        const response = await fetch(`${BINANCE_API_BASE}/ticker/price?symbol=${symbol}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch live price for ${symbol} from Binance`);
        }
        const data = await response.json();
        const price = parseFloat(data.price);
        if (isNaN(price)) {
            throw new Error(`Invalid price format received for ${symbol} from Binance`);
        }
        return price;
    }
}

export const binanceExchange = new BinanceExchange();
