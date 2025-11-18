import type { Exchange, Timeframe, CandleStick } from '@/types';
import { exchangeRegistry } from './exchanges/registry';
import type { ExchangeModule } from './exchanges/types';


/**
 * Private helper to get the correct exchange module from the registry.
 */
function getExchange(exchangeName: Exchange): ExchangeModule {
  const exchange = exchangeRegistry[exchangeName.toLowerCase()];
  if (!exchange) {
    throw new Error(`Exchange '${exchangeName}' is not supported or does not exist in the registry.`);
  }
  return exchange;
}

// --- PUBLIC API ---

/**
 * Returns a list of all supported exchange names. Great for populating a dropdown menu.
 */
export function getSupportedExchanges(): string[] {
  return Object.keys(exchangeRegistry);
}

/**
 * Fetches symbols for a given exchange.
 */
export function getSymbols(exchange: Exchange): Promise<string[]> {
  return getExchange(exchange).getSymbols();
}

/**
 * Fetches recent candle data.
 */
export function fetchData(exchange: Exchange, symbol: string, timeframe: Timeframe, limit?: number): Promise<CandleStick[]> {
  // Pass a default limit if not provided
  return getExchange(exchange).fetchData(symbol, timeframe, limit ?? 500);
}

/**
 * Fetches historical candle data within a time range.
 */
export function fetchHistoricalData(exchange: Exchange, symbol: string, interval: Timeframe, startTime: number, endTime: number): Promise<CandleStick[]> {
  return getExchange(exchange).fetchHistoricalData(symbol, interval, startTime, endTime);
}

/**
 * Fetches the current live price for a symbol.
 */
export function fetchLivePrice(exchange: Exchange, symbol: string): Promise<number> {
  return getExchange(exchange).fetchLivePrice(symbol);
}
