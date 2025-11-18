import React, { useEffect, useRef, useState, useCallback } from 'react';
// FIX: Add UTCTimestamp to imports for type casting.
import { LineStyle, IPriceLine, UTCTimestamp } from 'lightweight-charts';
import type { CandleStick, Signal, UserParams, LivePosition } from '@/types';
import { useLightweightChart } from '@/hooks/useLightweightChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Loader2Icon } from '@/components/icons/Loader2Icon';
import { ChartControls } from './ChartControls';
import { OneClickTradeBar } from './OneClickTradeBar';
import { BybitTradeDetails } from '@/services/executionService';

interface LivePriceChartProps {
  symbol: string;
  data: CandleStick[];
  currentPrice: number | null;
  isLoading: boolean;
  signal: Signal | null;
  signalParams: UserParams | null;
  hitTpLevels: number[];
  oneClickTradingEnabled?: boolean;
  onOneClickTrade?: (tradeDetails: BybitTradeDetails) => void;
  oneClickTradeMargin?: number;
  onOneClickMarginChange?: (margin: number) => void;
  isSubmittingOneClick?: boolean;
  livePositions?: LivePosition[];
  onModifyPosition?: (positionId: string, newTp?: number, newSl?: number) => void;
}

export const LivePriceChart = ({
  symbol, data, currentPrice, isLoading, signal, signalParams, hitTpLevels,
  oneClickTradingEnabled, onOneClickTrade, oneClickTradeMargin, onOneClickMarginChange, isSubmittingOneClick,
  livePositions, onModifyPosition
}: LivePriceChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const priceLinesRef = useRef<Record<string, IPriceLine>>({});
  const livePositionLinesRef = useRef<Record<string, { tpLine?: IPriceLine; slLine?: IPriceLine; position: LivePosition }>>({});

  // Component-local state for UI settings, ensuring independence between instances
  const [chartType, setChartType] = useState<'Area' | 'Line' | 'Candlestick'>('Area');
  const [timeRange, setTimeRange] = useState<'30m' | '1h' | '4h' | '1D' | 'All'>('4h');
  const [showRSI, setShowRSI] = useState(false);
  const [showMA20, setShowMA20] = useState(false);
  const [showMA200, setShowMA200] = useState(false);

  // Custom hook for chart logic
  const { chart, mainSeries } = useLightweightChart(chartContainerRef, chartType, data, showMA20, showMA200, showRSI);

  // Time range zoom handling
  useEffect(() => {
    if (!chart || data.length < 2) return;
    if (timeRange === 'All') {
      chart.timeScale().fitContent();
      return;
    }
    const lastTime = data[data.length - 1].time;
    let secondsToGoBack = 0;
    switch (timeRange) {
      case '30m': secondsToGoBack = 30 * 60; break;
      case '1h': secondsToGoBack = 60 * 60; break;
      case '4h': secondsToGoBack = 4 * 60 * 60; break;
      case '1D': secondsToGoBack = 24 * 60 * 60; break;
    }
    // FIX: Cast time values to UTCTimestamp to match lightweight-charts' branded number type.
    chart.timeScale().setVisibleRange({ from: (lastTime - secondsToGoBack) as UTCTimestamp, to: lastTime as UTCTimestamp });
  }, [timeRange, data, chart]);

  // Draw price lines for signals
  useEffect(() => {
    if (!mainSeries) return;

    // Clear all existing lines to prevent duplicates
    Object.values(priceLinesRef.current).forEach(line => {
      try {
        if (mainSeries) mainSeries.removePriceLine(line)
      } catch (e) {}
    });
    priceLinesRef.current = {};
    Object.values(livePositionLinesRef.current).forEach(({ tpLine, slLine }) => {
        if (tpLine) try { if (mainSeries) mainSeries.removePriceLine(tpLine) } catch (e) {}
        if (slLine) try { if (mainSeries) mainSeries.removePriceLine(slLine) } catch (e) {}
    });
    livePositionLinesRef.current = {};

    const createLine = (price: number, color: string, style: LineStyle, title: string): IPriceLine => {
        return mainSeries.createPriceLine({ price, color, lineWidth: 2, lineStyle: style, axisLabelVisible: true, title });
    };

    const currentSymbol = symbol.split(' ')[0];

    if (signal && signalParams && signalParams.symbol === currentSymbol) {
        priceLinesRef.current['entry'] = createLine(signal.entryRange[0], '#3b82f6', LineStyle.Dotted, 'Entry');
        priceLinesRef.current['sl'] = createLine(signal.stopLoss, '#ef4444', LineStyle.Dotted, 'SL');
        signal.takeProfit.forEach((tp, i) => {
            const isHit = hitTpLevels.includes(tp);
            priceLinesRef.current[`tp${i}`] = createLine(tp, '#22c55e', isHit ? LineStyle.Dashed : LineStyle.Dotted, `TP${i + 1}${isHit ? ' ✔' : ''}`);
        });
    }

    // Draw live position lines (solid)
    livePositions?.forEach(pos => {
      if (pos.symbol === currentSymbol) {
        const lines: { tpLine?: IPriceLine; slLine?: IPriceLine; position: LivePosition } = { position: pos };
        if (pos.takeProfit) {
          lines.tpLine = createLine(pos.takeProfit, '#22c55e', LineStyle.Solid, 'TP');
        }
        if (pos.stopLoss) {
          lines.slLine = createLine(pos.stopLoss, '#ef4444', LineStyle.Solid, 'SL');
        }
        livePositionLinesRef.current[pos.id] = lines;
      }
    });

  }, [signal, signalParams, symbol, hitTpLevels, mainSeries, livePositions]);

  // Drag and drop logic for live position lines
  const isDraggingRef = useRef(false);
  const draggedLineInfo = useRef<{ positionId: string; lineType: 'tp' | 'sl'; line: IPriceLine } | null>(null);

  useEffect(() => {
    const chartElement = chartContainerRef.current;
    if (!chartElement || !chart || !mainSeries || !onModifyPosition) return;

    const handleMouseDown = (e: MouseEvent) => {
        const y = e.offsetY;
        const priceScale = mainSeries.priceScale();
        const price = mainSeries.coordinateToPrice(y);
        if (price === null) return;

        let lineToDrag = null;
        for (const posId in livePositionLinesRef.current) {
            const { tpLine, slLine } = livePositionLinesRef.current[posId];
            if (tpLine) {
                const tpPrice = tpLine.options().price;
                // FIX: Removed incorrect second argument from `priceToCoordinate` and added a null check.
                const tpY = priceScale.priceToCoordinate(tpPrice);
                if (tpY !== null && Math.abs(y - tpY) < 10) { lineToDrag = { positionId: posId, lineType: 'tp' as const, line: tpLine }; break; }
            }
            if (slLine) {
                const slPrice = slLine.options().price;
                // FIX: Removed incorrect second argument from `priceToCoordinate` and added a null check.
                const slY = priceScale.priceToCoordinate(slPrice);
                if (slY !== null && Math.abs(y - slY) < 10) { lineToDrag = { positionId: posId, lineType: 'sl' as const, line: slLine }; break; }
            }
        }

        if (lineToDrag) {
            isDraggingRef.current = true;
            draggedLineInfo.current = lineToDrag;
            chart.applyOptions({ handleScroll: false, handleScale: false });
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        const y = e.offsetY;
        const priceScale = mainSeries.priceScale();

        if (isDraggingRef.current && draggedLineInfo.current) {
            const newPrice = mainSeries.coordinateToPrice(y);
            if (newPrice !== null) {
                draggedLineInfo.current.line.applyOptions({ price: newPrice });
            }
        } else {
            let onDraggableLine = false;
            for (const posId in livePositionLinesRef.current) {
                const { tpLine, slLine } = livePositionLinesRef.current[posId];
                if (tpLine) {
                    const tpPrice = tpLine.options().price;
                    // FIX: Removed incorrect second argument from `priceToCoordinate` and added a null check.
                    const tpY = priceScale.priceToCoordinate(tpPrice);
                    if (tpY !== null && Math.abs(y - tpY) < 10) { onDraggableLine = true; break; }
                }
                if (slLine) {
                    const slPrice = slLine.options().price;
                    // FIX: Removed incorrect second argument from `priceToCoordinate` and added a null check.
                    const slY = priceScale.priceToCoordinate(slPrice);
                    if (slY !== null && Math.abs(y - slY) < 10) { onDraggableLine = true; break; }
                }
            }
            chartElement.style.cursor = onDraggableLine ? 'ns-resize' : 'crosshair';
        }
    };

    const handleMouseUp = () => {
        if (isDraggingRef.current && draggedLineInfo.current) {
            const finalPrice = draggedLineInfo.current.line.options().price;
            const { positionId, lineType } = draggedLineInfo.current;
            const position = livePositionLinesRef.current[positionId].position;

            if (lineType === 'tp') {
                onModifyPosition(positionId, finalPrice, position.stopLoss);
            } else { // 'sl'
                onModifyPosition(positionId, position.takeProfit, finalPrice);
            }
        }
        isDraggingRef.current = false;
        draggedLineInfo.current = null;
        chart.applyOptions({ handleScroll: true, handleScale: true });
    };

    chartElement.addEventListener('mousedown', handleMouseDown);
    chartElement.addEventListener('mousemove', handleMouseMove);
    chartElement.addEventListener('mouseup', handleMouseUp);
    chartElement.addEventListener('mouseleave', handleMouseUp);

    return () => {
        chartElement.removeEventListener('mousedown', handleMouseDown);
        chartElement.removeEventListener('mousemove', handleMouseMove);
        chartElement.removeEventListener('mouseup', handleMouseUp);
        chartElement.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [chart, mainSeries, onModifyPosition]);

  const handleOneClickTrade = useCallback((direction: 'Buy' | 'Sell') => {
    if (!onOneClickTrade || !currentPrice || !oneClickTradeMargin || !signalParams?.risk) return;

    const stopDistance = currentPrice * 0.002; // Default 0.2% SL
    const tpDistance = stopDistance * 1.5; // Default 1.5 R:R

    const isLong = direction === 'Buy';
    const stopLoss = isLong ? currentPrice - stopDistance : currentPrice + stopDistance;
    const takeProfit = isLong ? currentPrice + tpDistance : currentPrice - tpDistance;

    const quantity = (oneClickTradeMargin * 20) / currentPrice; // Assume 20x leverage for quick trades

    const tradeDetails: BybitTradeDetails = {
        symbol: symbol.split(' ')[0],
        side: direction,
        orderType: 'Market',
        qty: quantity.toFixed(3),
        takeProfit: takeProfit.toFixed(4),
        stopLoss: stopLoss.toFixed(4),
    };
    onOneClickTrade(tradeDetails);

  }, [onOneClickTrade, currentPrice, symbol, oneClickTradeMargin, signalParams?.risk]);

  const priceColor = currentPrice && data.length > 1 && currentPrice >= data[data.length - 2]?.close ? 'text-green-400' : 'text-red-400';

  return (
    <Card className="bg-gray-800/60 backdrop-blur-md border border-gray-700 rounded-xl shadow-lg hover:shadow-cyan-500/30 transition-shadow duration-300 ease-in-out flex flex-col">
      <CardHeader className="px-6 pt-6 pb-4 border-b border-gray-700/50">
        <div className="flex flex-wrap justify-between items-start gap-y-3">
          <div>
            <CardTitle className="text-2xl font-bold text-gray-50">{symbol || "No Symbol Selected"}</CardTitle>
            <CardDescription className="text-sm text-gray-400 mt-1">1-minute interval data</CardDescription>
          </div>
          {currentPrice && (
            <p className={`text-4xl font-mono font-extrabold transition-colors duration-200 ${priceColor}`}>
              ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            </p>
          )}
        </div>
        <div className="mt-4">
          <ChartControls
              chartType={chartType} setChartType={setChartType}
              timeRange={timeRange} setTimeRange={setTimeRange}
              showMA20={showMA20} setShowMA20={setShowMA20}
              showMA200={showMA200} setShowMA200={setShowMA200}
              showRSI={showRSI} setShowRSI={setShowRSI}
          />
        </div>
      </CardHeader>
      <CardContent className="h-[450px] p-0 relative">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50 rounded-b-xl z-10">
            <Loader2Icon className="w-10 h-10 animate-spin text-cyan-500" />
            <p className="mt-4 text-lg text-gray-300">Loading live chart data...</p>
          </div>
        )}
        <div ref={chartContainerRef} className="h-full w-full" style={{ visibility: isLoading ? 'hidden' : 'visible' }}/>
        {oneClickTradingEnabled && (
          <OneClickTradeBar
            margin={oneClickTradeMargin ?? 50}
            onMarginChange={onOneClickMarginChange!}
            onTrade={handleOneClickTrade}
            isSubmitting={isSubmittingOneClick ?? false}
          />
        )}
      </CardContent>
    </Card>
  );
};
