import type { ExchangeModule } from './types';
import { binanceExchange } from './binance';
import { bybitExchange } from './bybit';

/**
 * The registry holds all available exchange implementations.
 * To add a new exchange, just import its instance and add it to this object.
 */
export const exchangeRegistry: Record<string, ExchangeModule> = {
  [binanceExchange.name]: binanceExchange,
  [bybitExchange.name]: bybitExchange,
};
