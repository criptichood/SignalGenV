// chartConnectionManager.ts
import type { CandleStick } from '@/types';

interface ChartConnection {
  symbol: string;
  exchange: string;
  timeframe: string;
  lastData: CandleStick[];
  lastUpdated: number;
  isActive: boolean;
  unsubscribe: () => void;
  subscriptionCount: number; // Track how many components are using this connection
}

class ChartConnectionManager {
  private connections: Map<string, ChartConnection> = new Map();
  private static instance: ChartConnectionManager;

  public static getInstance(): ChartConnectionManager {
    if (!ChartConnectionManager.instance) {
      ChartConnectionManager.instance = new ChartConnectionManager();
    }
    return ChartConnectionManager.instance;
  }

  /**
   * Generate a unique key for a chart connection
   */
  private generateKey(exchange: string, symbol: string, timeframe: string): string {
    return `${exchange}-${symbol}-${timeframe}`;
  }

  /**
   * Register a new chart connection or increment subscription count
   */
  registerConnection(
    exchange: string,
    symbol: string,
    timeframe: string,
    initialData: CandleStick[],
    unsubscribeCallback: () => void
  ): ChartConnection {
    const key = this.generateKey(exchange, symbol, timeframe);

    const existingConnection = this.connections.get(key);
    if (existingConnection) {
      // If the connection already exists, increment the subscription count
      existingConnection.subscriptionCount++;
      existingConnection.lastUpdated = Date.now();
      return existingConnection;
    }

    const connection: ChartConnection = {
      symbol,
      exchange,
      timeframe,
      lastData: [...initialData],
      lastUpdated: Date.now(),
      isActive: true,
      unsubscribe: unsubscribeCallback,
      subscriptionCount: 1
    };

    this.connections.set(key, connection);
    return connection;
  }

  /**
   * Get cached data for a chart if it exists and is recent
   */
  getCachedData(exchange: string, symbol: string, timeframe: string): CandleStick[] | null {
    const key = this.generateKey(exchange, symbol, timeframe);
    const connection = this.connections.get(key);

    // Return cached data if it's less than 30 seconds old
    if (connection && (Date.now() - connection.lastUpdated) < 30000) {
      return [...connection.lastData];
    }

    return null;
  }

  /**
   * Update cached data for a chart
   */
  updateCachedData(exchange: string, symbol: string, timeframe: string, data: CandleStick[]): void {
    const key = this.generateKey(exchange, symbol, timeframe);
    const connection = this.connections.get(key);

    if (connection) {
      connection.lastData = [...data];
      connection.lastUpdated = Date.now();
    }
  }

  /**
   * Deactivate a connection (decrement subscription count)
   */
  deactivateConnection(exchange: string, symbol: string, timeframe: string): void {
    const key = this.generateKey(exchange, symbol, timeframe);
    const connection = this.connections.get(key);

    if (connection) {
      connection.subscriptionCount--;
      if (connection.subscriptionCount <= 0) {
        connection.isActive = false;
      }
    }
  }

  /**
   * Activate a connection (increment subscription count)
   */
  activateConnection(exchange: string, symbol: string, timeframe: string): void {
    const key = this.generateKey(exchange, symbol, timeframe);
    const connection = this.connections.get(key);

    if (connection) {
      connection.subscriptionCount++;
      connection.isActive = true;
      connection.lastUpdated = Date.now();
    }
  }

  /**
   * Completely remove and unsubscribe from a connection if no one is using it
   */
  removeConnection(exchange: string, symbol: string, timeframe: string): void {
    const key = this.generateKey(exchange, symbol, timeframe);
    const connection = this.connections.get(key);

    if (connection) {
      connection.subscriptionCount--;

      if (connection.subscriptionCount <= 0) {
        // If no components are using this connection, unsubscribe and remove it
        connection.unsubscribe();
        this.connections.delete(key);
      }
    }
  }

  /**
   * Clean up inactive connections after a delay
   */
  cleanupInactiveConnections(delay: number = 5000): void {
    setTimeout(() => {
      const now = Date.now();
      for (const [key, connection] of this.connections.entries()) {
        if (!connection.isActive && connection.subscriptionCount <= 0 && (now - connection.lastUpdated) > delay) {
          connection.unsubscribe();
          this.connections.delete(key);
        }
      }
    }, delay);
  }

  /**
   * Get connection status
   */
  isConnectionActive(exchange: string, symbol: string, timeframe: string): boolean {
    const key = this.generateKey(exchange, symbol, timeframe);
    const connection = this.connections.get(key);
    return !!connection?.isActive && connection.subscriptionCount > 0;
  }

  /**
   * Get connection status with a grace period to allow for transition delay
   */
  isConnectionActiveWithGracePeriod(exchange: string, symbol: string, timeframe: string, graceMs: number = 300): boolean {
    const key = this.generateKey(exchange, symbol, timeframe);
    const connection = this.connections.get(key);
    if (connection && connection.subscriptionCount > 0) {
      return (Date.now() - connection.lastUpdated) < graceMs;
    }
    return false;
  }

  /**
   * Count active subscriptions for a connection
   */
  getSubscriptionCount(exchange: string, symbol: string, timeframe: string): number {
    const key = this.generateKey(exchange, symbol, timeframe);
    const connection = this.connections.get(key);
    return connection?.subscriptionCount || 0;
  }

  /**
   * Clean up all connections
   */
  cleanupAll(): void {
    for (const connection of this.connections.values()) {
      connection.unsubscribe();
    }
    this.connections.clear();
  }
}

export const chartConnectionManager = ChartConnectionManager.getInstance();