// useChartTransitionManager.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { chartConnectionManager } from '@/services/chartConnectionManager';
import type { CandleStick } from '@/types';

interface ChartTransitionManagerProps {
  exchange: string;
  symbol: string;
  timeframe: string;
  initialData: CandleStick[];
  fetchDataFn: (exchange: string, symbol: string, timeframe: string, limit?: number) => Promise<CandleStick[]>;
  onSubscribe: () => () => void; // Function that returns unsubscribe function
}

export const useChartTransitionManager = ({
  exchange,
  symbol,
  timeframe,
  initialData,
  fetchDataFn,
  onSubscribe
}: ChartTransitionManagerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<CandleStick[]>(initialData);
  const [error, setError] = useState<string | null>(null);
  const [isReusingConnection, setIsReusingConnection] = useState(false);
  
  // Use refs to track the current state and avoid stale closures
  const currentExchange = useRef(exchange);
  const currentSymbol = useRef(symbol);
  const currentTimeframe = useRef(timeframe);
  const isMounted = useRef(true);

  // Update refs when props change
  useEffect(() => {
    currentExchange.current = exchange;
    currentSymbol.current = symbol;
    currentTimeframe.current = timeframe;
  }, [exchange, symbol, timeframe]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const initializeChart = useCallback(async () => {
    const ex = currentExchange.current;
    const sym = currentSymbol.current;
    const tf = currentTimeframe.current;

    if (!isMounted.current) return;

    setIsLoading(true);
    setError(null);

    try {
      // Check if we have cached data for this chart
      const cachedData = chartConnectionManager.getCachedData(ex, sym, tf);

      if (cachedData && chartConnectionManager.isConnectionActive(ex, sym, tf)) {
        // Reuse existing connection
        if (isMounted.current) {
          setData(cachedData);
          setIsReusingConnection(true);
          chartConnectionManager.activateConnection(ex, sym, tf);
        }
      } else {
        // New connection needed
        if (isMounted.current) {
          setIsReusingConnection(false);
        }
        
        // Fetch fresh data
        const freshData = await fetchDataFn(ex, sym, tf, 500);
        
        if (isMounted.current) {
          setData(freshData);
          
          // Get the unsubscribe function
          const unsubscribe = onSubscribe();
          
          // Register new connection
          chartConnectionManager.registerConnection(
            ex,
            sym,
            tf,
            freshData,
            unsubscribe
          );
        }
      }
    } catch (err) {
      if (isMounted.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize chart';
        setError(errorMessage);
        console.error('Chart initialization error:', err);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [fetchDataFn, onSubscribe]);

  // Handle chart switching with a small delay to allow proper cleanup
  useEffect(() => {
    const ex = currentExchange.current;
    const sym = currentSymbol.current;
    const tf = currentTimeframe.current;

    // Add a small delay to allow previous subscriptions to properly clean up
    const timer = setTimeout(() => {
      if (isMounted.current) {
        initializeChart();
      }
    }, 150); // 150ms delay to allow WebSocket cleanup

    return () => {
      clearTimeout(timer);
      
      // Deactivate the connection instead of immediately unsubscribing
      chartConnectionManager.deactivateConnection(ex, sym, tf);
      
      // Schedule cleanup of inactive connections after a delay
      chartConnectionManager.cleanupInactiveConnections(2000); // Clean up after 2 seconds
    };
  }, [initializeChart]);

  // Update cached data when data changes
  useEffect(() => {
    const ex = currentExchange.current;
    const sym = currentSymbol.current;
    const tf = currentTimeframe.current;
    
    if (data.length > 0 && isMounted.current) {
      chartConnectionManager.updateCachedData(ex, sym, tf, data);
    }
  }, [data]);

  return {
    data,
    isLoading,
    error,
    isReusingConnection,
    refresh: initializeChart,
    setData
  };
};