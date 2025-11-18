import { useQuery } from '@tanstack/react-query';
import * as exchangeService from '@/services/exchangeService';
import type { Exchange } from '@/types';

/**
 * Fetches and caches the list of trading symbols for a given exchange.
 * @param exchange The selected exchange ('binance', 'bybit', etc.).
 * @returns A TanStack Query object containing the symbols data, loading state, and error state.
 */
export const useSymbolsQuery = (exchange: Exchange | undefined) => {
  return useQuery<string[], Error>({
    // Query key includes the exchange to cache symbols per exchange.
    queryKey: ['symbols', exchange],
    queryFn: async () => {
      if (!exchange) {
        // This should not happen if `enabled` is working correctly, but it's a good safeguard.
        throw new Error('Exchange is not selected');
      }
      return exchangeService.getSymbols(exchange);
    },
    // The query will only run if the exchange is defined.
    enabled: !!exchange,
    // Symbol lists are static, so cache them for a long time.
    staleTime: 1000 * 60 * 60, // 1 hour
    // No need to refetch on window focus as the data is not volatile.
    refetchOnWindowFocus: false,
    // Retry failed requests up to 2 times.
    retry: 2,
  });
};