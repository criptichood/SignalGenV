// useChartTransition.ts
import { useState, useEffect, useCallback } from 'react';
import { chartConnectionManager } from '@/services/chartConnectionManager';
import type { CandleStick } from '@/types';

interface UseChartTransitionParams {
  exchange: string;
  symbol: string;
  timeframe: string;
  initialData: CandleStick[];
  fetchDataFn: (exchange: string, symbol: string, timeframe: string, limit?: number) => Promise<CandleStick[]>;
  onSubscribe: () => () => void; // Function that returns unsubscribe function
}

export const useChartTransition = ({
  exchange,
  symbol,
  timeframe,
  initialData,
  fetchDataFn,
  onSubscribe
}: UseChartTransitionParams) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<CandleStick[]>(initialData);
  const [error, setError] = useState<string | null>(null);

  // Track if this is a new chart instance or reusing an existing one
  const [isReusingConnection, setIsReusingConnection] = useState(false);

  const initializeChart = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if we have cached data for this chart
      const cachedData = chartConnectionManager.getCachedData(exchange, symbol, timeframe);

      if (cachedData && chartConnectionManager.isConnectionActive(exchange, symbol, timeframe)) {
        // Reuse existing connection
        setData(cachedData);
        setIsReusingConnection(true);
        chartConnectionManager.activateConnection(exchange, symbol, timeframe);
      } else {
        // New connection needed
        setIsReusingConnection(false);
        
        // Fetch fresh data
        const freshData = await fetchDataFn(exchange, symbol, timeframe, 500);
        setData(freshData);
        
        // Register new connection
        const unsubscribe = onSubscribe();
        chartConnectionManager.registerConnection(
          exchange,
          symbol,
          timeframe,
          freshData,
          unsubscribe
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize chart';
      setError(errorMessage);
      console.error('Chart initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [exchange, symbol, timeframe, fetchDataFn, onSubscribe]);

  // Handle cleanup when component unmounts
  useEffect(() => {
    return () => {
      // Deactivate the connection instead of immediately unsubscribing
      chartConnectionManager.deactivateConnection(exchange, symbol, timeframe);
      
      // Schedule cleanup of inactive connections
      chartConnectionManager.cleanupInactiveConnections();
    };
  }, [exchange, symbol, timeframe]);

  // Initialize on mount
  useEffect(() => {
    initializeChart();
  }, [initializeChart]);

  // Update cached data when data changes
  useEffect(() => {
    if (data.length > 0) {
      chartConnectionManager.updateCachedData(exchange, symbol, timeframe, data);
    }
  }, [data, exchange, symbol, timeframe]);

  return {
    data,
    isLoading,
    error,
    isReusingConnection,
    refresh: initializeChart,
    setData // Allow parent to update data directly
  };
};