
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartPlaceholder } from '@/components/analytics/ChartPlaceholder';

interface PnlBySymbolData {
  symbol: string;
  pnl: number;
  tradeCount: number;
}

interface PnlBySymbolChartProps {
  data: PnlBySymbolData[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-900/80 p-3 border border-gray-600 rounded-md text-sm shadow-lg">
        <p className="text-gray-300 font-bold">{label}</p>
        <p className={data.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
          {`Net P/L: ${data.pnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}
        </p>
        <p className="text-gray-400">{`Trades: ${data.tradeCount}`}</p>
      </div>
    );
  }
  return null;
};


export const PnlBySymbolChart = ({ data }: PnlBySymbolChartProps) => {
  if (data.length === 0) {
    return <ChartPlaceholder message="No P/L data available for any symbol yet." />;
  }

  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="symbol" stroke="#9ca3af" tick={{ fontSize: 12 }} />
          <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} tickFormatter={(value) => `$${Number(value).toLocaleString()}`} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}/>
          <Bar dataKey="pnl" name="Net P/L">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
