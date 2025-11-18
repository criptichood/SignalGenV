
import React, { useMemo } from 'react';
import type { PerpTrade } from '../../types';
import { StatCard } from '../analytics/StatCard';
import { BarChartBig, TrendingUp, TrendingDown, LineChart } from 'lucide-react';

interface PerpStatsCardsProps {
    trades: PerpTrade[];
}

export const PerpStatsCards = ({ trades }: PerpStatsCardsProps) => {
    const stats = useMemo(() => {
        const closedTrades = trades.filter(t => t.status === 'Closed' && t.pnl !== undefined);
        const totalPnl = closedTrades.reduce((acc, trade) => acc + (trade.pnl || 0), 0);
        const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
        const losingTrades = closedTrades.filter(t => (t.pnl || 0) < 0);

        const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;

        return {
            totalPnl,
            winRate,
            totalWins: winningTrades.length,
            totalLosses: losingTrades.length,
        };
    }, [trades]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                title="Total Net P/L"
                value={stats.totalPnl.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                icon={<BarChartBig className="w-5 h-5" />}
                valueClassName={stats.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}
                description="From all closed perpetual trades."
            />
            <StatCard
                title="Win Rate"
                value={`${stats.winRate.toFixed(2)}%`}
                icon={<LineChart className="w-5 h-5" />}
                description={`${stats.totalWins} wins / ${stats.totalLosses} losses`}
            />
            <StatCard
                title="Winning Trades"
                value={stats.totalWins.toString()}
                icon={<TrendingUp className="w-5 h-5" />}
                valueClassName="text-green-400"
                description="Trades with positive P/L."
            />
            <StatCard
                title="Losing Trades"
                value={stats.totalLosses.toString()}
                icon={<TrendingDown className="w-5 h-5" />}
                valueClassName="text-red-400"
                description="Trades with negative P/L."
            />
        </div>
    );
};
