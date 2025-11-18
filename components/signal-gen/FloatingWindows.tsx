import React from 'react';
import { useSignalGenStore } from '@/store/signalGenStore';
import { FloatingCard } from '@/components/ui/FloatingCard';
import { FavoriteCoins } from '@/components/scalping/FavoriteCoins';
import { OrderBook } from '@/components/scalping/OrderBook';
import { TimeAndSales } from '@/components/scalping/TimeAndSales';
import type { OrderBookUpdate, LiveTrade } from '@/types';

interface FloatingWindowsProps {
  isAnalyzing: boolean;
  orderBookData: OrderBookUpdate | null;
  livePrice: number | null;
  liveTrades: LiveTrade[];
}

export const FloatingWindows = ({
  isAnalyzing,
  orderBookData,
  livePrice,
  liveTrades
}: FloatingWindowsProps) => {
  const {
    windowsState, handlePositionChange, toggleWindow, toggleMinimize,
    favoriteSwingSymbols, setFavoriteSwingSymbols, setFormData, formData
  } = useSignalGenStore();

  const handleSelectFavorite = (symbol: string) => {
    setFormData(prev => ({ ...prev, symbol }));
  };

  const handleGenerateForFavorite = (symbol: string) => {
    // This action is now triggered from the main page, so this could be a placeholder
    // or we could use a more advanced pub/sub system if needed.
    console.log("Generate for favorite:", symbol);
    handleSelectFavorite(symbol); // For now, just select it. The user can click generate.
  };

  return (
    <>
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
          favorites={favoriteSwingSymbols}
          onSelect={handleSelectFavorite}
          onGenerate={handleGenerateForFavorite}
          onMouseEnterZap={() => {}}
          onMouseLeaveZap={() => {}}
          disabled={isAnalyzing}
        />
      </FloatingCard>

      <FloatingCard
        title={`Order Book - ${formData.symbol}`}
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
        title={`Time & Sales - ${formData.symbol}`}
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
