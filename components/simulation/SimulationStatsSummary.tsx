import React from 'react';
import { StatCard } from '@/components/analytics/StatCard';
import { ChartIcon } from '@/components/icons/ChartIcon';
import { AnalyticsIcon } from '@/components/icons/AnalyticsIcon';
import { TrendingUpIcon } from '@/components/icons/TrendingUpIcon';
import { TrendingDownIcon } from '@/components/icons/TrendingDownIcon';
import { useSimulationAnalytics } from '@/hooks/useSimulationAnalytics';
import type { SimulationSetup } from '@/types';

interface SimulationStatsSummaryProps {
    simulations: SimulationSetup[];
}

export const SimulationStatsSummary = ({ simulations }: SimulationStatsSummaryProps) => {
    const stats = useSimulationAnalytics(simulations);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                title="Total P/L"
                value={`${stats.totalPnlPercent.toFixed(2)}%`}
                icon={<AnalyticsIcon className="w-5 h-5" />}
                valueClassName={stats.totalPnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}
                description={`Across ${stats.completedCount} completed simulations.`}
            />
            <StatCard
                title="Win Rate"
                value={`${stats.winRate.toFixed(2)}%`}
                icon={<ChartIcon className="w-5 h-5" />}
            />
            <StatCard
                title="Best Trade"
                value={`+${stats.bestTradePnl.toFixed(2)}%`}
                icon={<TrendingUpIcon className="w-5 h-5" />}
                valueClassName="text-green-400"
            />
            <StatCard
                title="Worst Trade"
                value={`${stats.worstTradePnl.toFixed(2)}%`}
                icon={<TrendingDownIcon className="w-5 h-5" />}
                valueClassName="text-red-400"
            />
        </div>
    );
};