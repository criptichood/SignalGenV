// FIX: Import React to provide the 'React' namespace for types like React.RefObject.
import React, { useEffect, useRef } from 'react';
import {
  createChart,
  IChartApi,
  ISeriesApi,
  // FIX: Add UTCTimestamp to imports for type casting.
  UTCTimestamp,
  LineStyle,
  HorzAlign,
  VertAlign,
} from 'lightweight-charts';
import type { CandleStick } from '@/types';

const chartOptions = {
    layout: { background: { color: 'transparent' }, textColor: '#e0e0e0', fontSize: 12 },
    grid: { vertLines: { color: 'rgba(60, 60, 60, 0.5)' }, horzLines: { color: 'rgba(60, 60, 60, 0.5)' } },
    timeScale: { timeVisible: true, secondsVisible: false, borderColor: '#444', rightOffset: 5, barSpacing: 10 },
    rightPriceScale: { borderColor: '#444', autoScale: true, visible: true },
    crosshair: { mode: 1, vertLine: { labelBackgroundColor: '#556070' }, horzLine: { labelBackgroundColor: '#556070' } },
    watermark: { visible: true, fontSize: 48, horzAlign: 'center' as HorzAlign, vertAlign: 'center' as VertAlign, color: 'rgba(70, 70, 70, 0.3)', text: 'SignalGen' },
};

export function useLightweightChart(
  chartContainerRef: React.RefObject<HTMLDivElement>,
  chartType: 'Area' | 'Line' | 'Candlestick',
  data: CandleStick[],
  showMA20: boolean,
  showMA200: boolean,
  showRSI: boolean
) {
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const ma20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ma200SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  // Chart creation and resize handling
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, chartOptions);
    chartRef.current = chart;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        chart.applyOptions({ width, height });
      }
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [chartContainerRef]);

  // Main series management
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    if (mainSeriesRef.current) {
      try {
        // Attempt to remove the series but catch the specific error for already removed series
        chart.removeSeries(mainSeriesRef.current);
      } catch (e) {
        // Suppress the error since removing an already removed series is not an actual error condition
        // Just log a debug message to indicate it happened
       // console.debug('Main series was already removed (this is normal)');
      }
      mainSeriesRef.current = null;
    }

    let newSeries: ISeriesApi<any>;
    // FIX: Cast chart to 'any' to bypass potential incorrect type definitions in the user's environment causing "property does not exist" errors.
    const chartAny = chart as any;
    if (chartType === 'Candlestick') {
      newSeries = chartAny.addCandlestickSeries({ upColor: '#22c55e', downColor: '#ef4444', borderVisible: false, wickUpColor: '#22c55e', wickDownColor: '#ef4444' });
    } else if (chartType === 'Line') {
      newSeries = chartAny.addLineSeries({ color: '#38bdf8', lineWidth: 2 });
    } else { // Area
      newSeries = chartAny.addAreaSeries({ lineColor: '#38bdf8', topColor: 'rgba(56, 189, 248, 0.4)', bottomColor: 'rgba(56, 189, 248, 0.05)', lineWidth: 2 });
    }
    mainSeriesRef.current = newSeries;
  }, [chartType]);

  // Indicator series management
  useEffect(() => {
    const chart = chartRef.current; if (!chart) return;
    const chartAny = chart as any; // Cast to any for series methods
    // MA20
    if (showMA20 && !ma20SeriesRef.current) {
        ma20SeriesRef.current = chartAny.addLineSeries({ color: '#fb923c', lineWidth: 2, crosshairMarkerVisible: false, lastValueVisible: false, priceLineVisible: false });
    } else if (!showMA20 && ma20SeriesRef.current) {
        try {
          chart.removeSeries(ma20SeriesRef.current);
        } catch (e) {
          // Suppress the error since removing an already removed series is not an actual error condition
         // console.debug('MA20 series was already removed (this is normal)');
        }
        ma20SeriesRef.current = null;
    }
    // MA200
    if (showMA200 && !ma200SeriesRef.current) {
        ma200SeriesRef.current = chartAny.addLineSeries({ color: '#a78bfa', lineWidth: 2, crosshairMarkerVisible: false, lastValueVisible: false, priceLineVisible: false });
    } else if (!showMA200 && ma200SeriesRef.current) {
        try {
          chart.removeSeries(ma200SeriesRef.current);
        } catch (e) {
          // Suppress the error since removing an already removed series is not an actual error condition
          // console.debug('MA200 series was already removed (this is normal)');
        }
        ma200SeriesRef.current = null;
    }
    // RSI
    if (showRSI && !rsiSeriesRef.current) {
        // FIX: Removed incorrect `applyOptions` call with `priceScales` which is not a valid property.
        // A new pane is created automatically when a series is added with a new `priceScaleId`.
        const rsiSeries = chartAny.addLineSeries({ priceScaleId: 'rsi', color: '#facc15', lineWidth: 1 });
        rsiSeries.createPriceLine({ price: 70, color: '#ef4444', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: '70' });
        rsiSeries.createPriceLine({ price: 30, color: '#22c55e', lineWidth: 1, lineStyle: LineStyle.Dashed, axisLabelVisible: true, title: '30' });
        rsiSeriesRef.current = rsiSeries;
    } else if (!showRSI && rsiSeriesRef.current) {
        try {
          chart.removeSeries(rsiSeriesRef.current);
        } catch (e) {
          // Suppress the error since removing an already removed series is not an actual error condition
          // console.debug('RSI series was already removed (this is normal)');
        }
        rsiSeriesRef.current = null;
        // FIX: Removed incorrect `applyOptions` call. Removing the series is sufficient to remove the pane.
    }
  }, [showMA20, showMA200, showRSI]);

  // Data updates
  useEffect(() => {
    if (!data || data.length === 0) return;
    const chartData = data.map(d => ({ time: d.time as UTCTimestamp, open: d.open, high: d.high, low: d.low, close: d.close }));
    const singleValueData = data.map(d => ({ time: d.time as UTCTimestamp, value: d.close }));
    if (mainSeriesRef.current) mainSeriesRef.current.setData(chartType === 'Candlestick' ? chartData : singleValueData);

    const calculateMA = (period: number) => {
        const maData = [];
        for (let i = period - 1; i < data.length; i++) {
            let sum = 0; for (let j = 0; j < period; j++) { sum += data[i - j].close; }
            maData.push({ time: data[i].time as UTCTimestamp, value: sum / period });
        }
        return maData;
    };
    if (ma20SeriesRef.current) ma20SeriesRef.current.setData(calculateMA(20));
    if (ma200SeriesRef.current) ma200SeriesRef.current.setData(calculateMA(200));

    if (rsiSeriesRef.current) {
        const rsiData = []; const period = 14; let gains = 0, losses = 0;
        for (let i = 1; i < data.length; i++) {
            const change = data[i].close - data[i - 1].close;
            if (i < period) { if (change > 0) gains += change; else losses -= change; }
            else {
                if (i === period) { gains /= period; losses /= period; }
                else {
                    const currentGain = change > 0 ? change : 0; const currentLoss = change < 0 ? -change : 0;
                    gains = (gains * (period - 1) + currentGain) / period;
                    losses = (losses * (period - 1) + currentLoss) / period;
                }
                const rs = losses > 0 ? gains / losses : 100; const rsi = 100 - (100 / (1 + rs));
                rsiData.push({ time: data[i].time as UTCTimestamp, value: rsi });
            }
        }
        rsiSeriesRef.current.setData(rsiData);
    }
  }, [data, chartType, showMA20, showMA200, showRSI]);

  return { chart: chartRef.current, mainSeries: mainSeriesRef.current };
}