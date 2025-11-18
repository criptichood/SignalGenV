import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PieChartIcon } from '../icons/PieChartIcon';

interface BreakdownData {
    name: string;
    value: number;
}

interface BreakdownChartProps {
  data: BreakdownData[];
}

const COLORS = ['#22d3ee', '#34d399', '#facc15']; // Cyan, Emerald, Amber

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-gray-900/80 p-2 border border-gray-600 rounded-md text-sm">
        <p className="font-bold">{`${data.name}: ${data.value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} (${data.payload.percent.toFixed(1)}%)`}</p>
      </div>
    );
  }
  return null;
};

export const BreakdownChart = ({ data }: BreakdownChartProps) => {
  if (data.length === 0) {
    return (
        <div className="h-full min-h-[250px] flex flex-col items-center justify-center text-center text-gray-500 p-4">
            <PieChartIcon className="w-12 h-12 mb-4" />
            <h3 className="text-lg font-semibold text-gray-400">No Holdings</h3>
            <p className="text-sm">Add a wallet with stablecoins to see your portfolio breakdown.</p>
        </div>
    );
  }

  const total = data.reduce((acc, entry) => acc + entry.value, 0);
  const chartData = data.map(entry => ({...entry, percent: (entry.value / total) * 100}));

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};