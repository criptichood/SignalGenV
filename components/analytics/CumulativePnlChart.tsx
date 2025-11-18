
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { ChartPlaceholder } from '@/components/analytics/ChartPlaceholder';

interface ChartData {
  name: string;
  date: string;
  pnl: number;
}

interface CumulativePnlChartProps {
  data: ChartData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900/80 p-3 border border-gray-600 rounded-md text-sm shadow-lg">
        <p className="text-gray-300 font-semibold">{`Date: ${label}`}</p>
        <p className="text-cyan-400">{`Cumulative P/L: ${payload[0].value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}</p>
      </div>
    );
  }
  return null;
};

export const CumulativePnlChart = ({ data }: CumulativePnlChartProps) => {
  if (data.length < 2) {
    return <ChartPlaceholder message="At least two closed trades are needed to show P/L trend." />;
  }

  const gradientId = "pnlColor";
  const firstPnl = data[0].pnl;
  const lastPnl = data[data.length - 1].pnl;
  const isPositiveTrend = lastPnl >= 0;

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={isPositiveTrend ? "#22c55e" : "#ef4444"} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={isPositiveTrend ? "#22c55e" : "#ef4444"} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} />
          <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} tickFormatter={(value) => `$${Number(value).toLocaleString()}`} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="pnl" stroke={isPositiveTrend ? "#22c55e" : "#ef4444"} strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="pnl" stroke={false} fill={`url(#${gradientId})`} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
