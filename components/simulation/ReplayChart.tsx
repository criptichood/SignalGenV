

import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
  ErrorBar,
} from 'recharts';
import type { CandleStick, SimulationSetup } from '@/types';

interface ReplayChartProps {
  data: CandleStick[];
  simulation: SimulationSetup;
  chartType: 'candle' | 'line';
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const d = payload[0].payload;
        return (
            <div className="bg-gray-900/80 p-2 border border-gray-600 rounded-md text-sm">
                <p>{new Date(label * 1000).toLocaleString()}</p>
                <p>O: <span className="font-mono">{d.open.toFixed(4)}</span></p>
                <p>H: <span className="font-mono">{d.high.toFixed(4)}</span></p>
                <p>L: <span className="font-mono">{d.low.toFixed(4)}</span></p>
                <p>C: <span className="font-mono">{d.close.toFixed(4)}</span></p>
            </div>
        );
    }
    return null;
};

export const ReplayChart = ({ data, simulation, chartType }: ReplayChartProps) => {
  if (!data || data.length === 0) {
    return <div className="h-[400px] flex items-center justify-center text-gray-500">Loading chart data...</div>;
  }
  
  const chartData = useMemo(() => data.map(d => ({
    ...d,
    wick: [d.low, d.high],
    body: [Math.min(d.open, d.close), Math.max(d.open, d.close)],
    isBull: d.close >= d.open,
  })), [data]);

  const yAxisDomain = useMemo(() => {
    if (data.length === 0) return ['auto', 'auto'];
    
    let minPrice = simulation.stopLoss;
    let maxPrice = simulation.stopLoss;

    // Include all TP levels and entry in the domain calculation
    [...simulation.takeProfit, simulation.entryRange[0]].forEach(price => {
        if (price < minPrice) minPrice = price;
        if (price > maxPrice) maxPrice = price;
    });

    data.forEach(candle => {
      if (candle.low < minPrice) minPrice = candle.low;
      if (candle.high > maxPrice) maxPrice = candle.high;
    });

    const padding = (maxPrice - minPrice) * 0.1; // 10% padding

    return [minPrice - padding, maxPrice + padding];
  }, [data, simulation]);


  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            tickFormatter={(time) => new Date(time * 1000).toLocaleTimeString()}
            stroke="#9ca3af"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            orientation="right" 
            domain={yAxisDomain} 
            tickFormatter={(price) => typeof price === 'number' ? `$${price.toPrecision(6)}` : ''}
            stroke="#9ca3af"
            width={80}
            tick={{ fontSize: 12 }}
            scale="linear"
          />
          <Tooltip content={<CustomTooltip />} />
          
          {chartType === 'candle' ? (
            <Bar dataKey="body" isAnimationActive={false}>
              <ErrorBar dataKey="wick" width={0} strokeWidth={1} direction="y" />
              {chartData.map((entry, index) => {
                const color = entry.isBull ? '#22c55e' : '#ef4444';
                return <Cell key={`cell-${index}`} fill={color} stroke={color} />;
              })}
            </Bar>
          ) : (
            <Line type="monotone" dataKey="close" stroke="#60a5fa" strokeWidth={2} dot={false} isAnimationActive={false} />
          )}

          <ReferenceLine y={simulation.entryRange[0]} label="Entry" stroke="#3b82f6" strokeDasharray="3 3" ifOverflow="extendDomain" />
          {simulation.takeProfit.map((tp, i) => (
            <ReferenceLine key={`tp-${i}`} y={tp} label={{ value: `TP${i+1}`, position: 'right', fill: '#22c55e' }} stroke="#22c55e" strokeDasharray="3 3" ifOverflow="extendDomain" />
          ))}
          <ReferenceLine y={simulation.stopLoss} label={{ value: 'SL', position: 'right', fill: '#ef4444' }} stroke="#ef4444" strokeDasharray="3 3" ifOverflow="extendDomain" />

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};