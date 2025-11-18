import React from 'react';
import { FloatingCard } from '@/components/ui/FloatingCard';
import { FavoriteCoins } from '@/components/scalping/FavoriteCoins';
import { OrderBook } from '@/components/scalping/OrderBook';
import { TimeAndSales } from '@/components/scalping/TimeAndSales';
import { SignalTracker } from '@/components/tracking/SignalTracker';
import type {
  TrackedSignal,
  OrderBookUpdate,
  LiveTrade
} from '@/types';

interface WindowsState {
  orderBook: { isOpen: boolean; isMinimized: boolean; position: { x: number; y: number } };
  timeAndSales: { isOpen: boolean; isMinimized: boolean; position: { x: number; y: number } };
  favorites: { isOpen: boolean; isMinimized: boolean; position: { x: number; y: number } };
}

interface FloatingWindowsProps {
  windowsState: WindowsState;
  handlePositionChange: (id: keyof WindowsState, newPosition: { x: number; y: number }) => void;
  toggleWindow: (id: keyof WindowsState) => void;
  toggleMinimize: (id: keyof WindowsState) => void;
  
  // FavoriteCoins props
  favoriteScalpSymbols: string[];
  handleSelectFavorite: (symbol: string) => void;
  handleGenerateForFavorite: (symbol: string) => void;
  isAnalyzing: boolean;

  // OrderBook & TimeAndSales props
  symbol: string | undefined;
  orderBookData: OrderBookUpdate | null;
  livePrice: number | null;
  liveTrades: LiveTrade[];

  // SignalTracker props
  trackedSignals: TrackedSignal[];
  handleCloseTracker: (id: string) => void;
  handleToggleMinimizeTracker: (id: string) => void;
  handleTrackerPositionChange: (id: string, pos: { x: number; y: number }) => void;
  handleRestoreSignal: (id: string) => void;
}

export const FloatingWindows = ({
  windowsState, handlePositionChange, toggleWindow, toggleMinimize,
  favoriteScalpSymbols, handleSelectFavorite, handleGenerateForFavorite, isAnalyzing,
  symbol, orderBookData, livePrice, liveTrades,
  trackedSignals, handleCloseTracker, handleToggleMinimizeTracker, handleTrackerPositionChange, handleRestoreSignal
}: FloatingWindowsProps) => {
  return (
    <>
      {trackedSignals.map(ts => (
        <FloatingCard
          key={ts.id}
          title={`Tracking: ${ts.params.symbol}`}
          isOpen={ts.windowState.isOpen}
          onClose={() => handleCloseTracker(ts.id)}
          isMinimized={ts.windowState.isMinimized}
          onToggleMinimize={() => handleToggleMinimizeTracker(ts.id)}
          position={ts.windowState.position}
          onPositionChange={(pos) => handleTrackerPositionChange(ts.id, pos)}
          initialWidth={320}
        >
          <SignalTracker signal={ts.signal} params={ts.params} timestamp={ts.timestamp} onRestore={() => handleRestoreSignal(ts.id)} />
        </FloatingCard>
      ))}

      <FloatingCard
        title="Favorite Pairs"
        isOpen={windowsState.favorites.isOpen}
        onClose={() => toggleWindow('favorites')}
        isMinimized={windowsState.favorites.isMinimized}
        onToggleMinimize={() => toggleMinimize('favorites')}
        position={windowsState.favorites.position}
        onPositionChange={(pos) => handlePositionChange('favorites', pos)}
      >
        <FavoriteCoins
          favorites={favoriteScalpSymbols}
          onSelect={handleSelectFavorite}
          onGenerate={handleGenerateForFavorite}
          onMouseEnterZap={() => {}}
          onMouseLeaveZap={() => {}}
          disabled={isAnalyzing}
        />
      </FloatingCard>

      <FloatingCard
        title={`Order Book - ${symbol}`}
        isOpen={windowsState.orderBook.isOpen}
        onClose={() => toggleWindow('orderBook')}
        isMinimized={windowsState.orderBook.isMinimized}
        onToggleMinimize={() => toggleMinimize('orderBook')}
        position={windowsState.orderBook.position}
        onPositionChange={(pos) => handlePositionChange('orderBook', pos)}
      >
        <OrderBook data={orderBookData} currentPrice={livePrice} />
      </FloatingCard>

      <FloatingCard
        title={`Time & Sales - ${symbol}`}
        isOpen={windowsState.timeAndSales.isOpen}
        onClose={() => toggleWindow('timeAndSales')}
        isMinimized={windowsState.timeAndSales.isMinimized}
        onToggleMinimize={() => toggleMinimize('timeAndSales')}
        position={windowsState.timeAndSales.position}
        onPositionChange={(pos) => handlePositionChange('timeAndSales', pos)}
      >
        <TimeAndSales trades={liveTrades} />
      </FloatingCard>
    </>
  );
};