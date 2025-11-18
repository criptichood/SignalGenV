import { useQuery } from '@tanstack/react-query';
import * as exchangeService from '@/services/exchangeService';
import type { Exchange, CandleStick } from '@/types';

const MAX_CHART_CANDLES = 1440;

/**
 * Fetches and caches the initial historical candlestick data for a given symbol and exchange.
 * This is intended to provide the initial chart view before the WebSocket takes over for live updates.
 * @param exchange The selected exchange.
 * @param symbol The selected symbol.
 * @returns A TanStack Query object for the initial chart data.
 */
export const useChartDataQuery = (exchange: Exchange | undefined, symbol: string | undefined) => {
  return useQuery<CandleStick[], Error>({
    // Query key includes all dependencies to ensure uniqueness.
    queryKey: ['chartData', exchange, symbol, '1m'],
    queryFn: async () => {
      if (!exchange || !symbol) {
        throw new Error('Exchange or symbol is not selected');
      }
      // Fetch 1-minute candles for the live price chart display.
      const data = await exchangeService.fetchData(exchange, symbol, '1m', MAX_CHART_CANDLES);
      return data;
    },
    // Only run the query if both exchange and symbol are defined.
    enabled: !!exchange && !!symbol,
    // Keep data fresh for 30 seconds. WebSocket will handle real-time updates after this.
    staleTime: 1000 * 30,
    // No need to refetch on window focus; rely on WebSocket.
    refetchOnWindowFocus: false,
    // Don't refetch automatically; WebSocket provides live data.
    refetchInterval: false,
    // Retry once on failure.
    retry: 1,
  });
};