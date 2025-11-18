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
  try {
    return Object.keys(exchangeRegistry);
  } catch (error) {
    console.error('Error getting supported exchanges:', error);
    return [];
  }
}

/**
 * Fetches symbols for a given exchange.
 */
export async function getSymbols(exchange: Exchange): Promise<string[]> {
  try {
    const ex = getExchange(exchange);
    return await ex.getSymbols();
  } catch (error) {
    console.error(`Error fetching symbols for exchange ${exchange}:`, error);
    throw new Error(`Failed to fetch symbols for ${exchange}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetches recent candle data.
 */
export async function fetchData(exchange: Exchange, symbol: string, timeframe: Timeframe, limit?: number): Promise<CandleStick[]> {
  try {
    // Pass a default limit if not provided
    const ex = getExchange(exchange);
    return await ex.fetchData(symbol, timeframe, limit ?? 500);
  } catch (error) {
    console.error(`Error fetching data from ${exchange} for ${symbol} on ${timeframe}:`, error);
    throw new Error(`Failed to fetch data for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetches historical candle data within a time range.
 */
export async function fetchHistoricalData(exchange: Exchange, symbol: string, interval: Timeframe, startTime: number, endTime: number): Promise<CandleStick[]> {
  try {
    const ex = getExchange(exchange);
    return await ex.fetchHistoricalData(symbol, interval, startTime, endTime);
  } catch (error) {
    console.error(`Error fetching historical data from ${exchange} for ${symbol} on ${interval}:`, error);
    throw new Error(`Failed to fetch historical data for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetches the current live price for a symbol.
 */
export async function fetchLivePrice(exchange: Exchange, symbol: string): Promise<number> {
  try {
    const ex = getExchange(exchange);
    return await ex.fetchLivePrice(symbol);
  } catch (error) {
    console.error(`Error fetching live price from ${exchange} for ${symbol}:`, error);
    throw new Error(`Failed to fetch live price for ${symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
