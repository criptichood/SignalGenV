import React from 'react';
import { useHistoryStore } from '@/store/historyStore';
import { useAnalytics } from '@/hooks/useAnalytics';
import { StatCard } from '@/components/analytics/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AnalyticsIcon } from '@/components/icons/AnalyticsIcon';
import { ChartIcon } from '@/components/icons/ChartIcon';
const formatCurrency = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export const PerformanceSnapshotWidget = () => {
    const { spotTrades, perpTrades } = useHistoryStore();
    const { perpStats } = useAnalytics(perpTrades, spotTrades);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Performance Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <StatCard 
                    title="Total Net P/L (Perps)"
                    value={formatCurrency(perpStats.totalPnl)}
                    icon={<AnalyticsIcon className="w-5 h-5" />}
                    valueClassName={perpStats.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}
                />
                 <StatCard 
                    title="Win Rate (Perps)"
                    value={`${perpStats.winRate.toFixed(2)}%`}
                    icon={<ChartIcon className="w-5 h-5" />}
                    description={`${perpStats.totalWins} wins / ${perpStats.totalLosses} losses`}
                />
            </CardContent>
        </Card>
    );
};