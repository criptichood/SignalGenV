import type { CandleStick, Timeframe } from '@/types';

/**
 * This is the contract that every exchange implementation must follow.
 * It standardizes the method names and their signatures.
 */
export interface ExchangeModule {
  // A unique name for the exchange, used as a key in the registry.
  readonly name: string;

  /**
   * Fetches all available trading symbols from the exchange.
   */
  getSymbols(): Promise<string[]>;

  /**
   * Fetches recent historical candlestick data for a given symbol and timeframe.
   */
  fetchData(symbol: string, timeframe: Timeframe, limit: number): Promise<CandleStick[]>;
  
  /**
   * Fetches historical candlestick data for a given symbol, timeframe, and time range.
   */
  fetchHistoricalData(symbol: string, timeframe: Timeframe, startTime: number, endTime: number): Promise<CandleStick[]>;
  
  /**
   * Fetches the current live price for a symbol.
   */
  fetchLivePrice(symbol: string): Promise<number>;
}
