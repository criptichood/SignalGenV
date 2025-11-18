
import React, { useMemo } from 'react';
import type { SpotTrade } from '../../types';
import { StatCard } from '../analytics/StatCard';
import { ArrowDown, ArrowUp, FileText, Calculator } from 'lucide-react';

interface SpotStatsCardsProps {
    trades: SpotTrade[];
}

export const SpotStatsCards = ({ trades }: SpotStatsCardsProps) => {
    const stats = useMemo(() => {
        const totalInvested = trades
            .filter(t => t.side === 'Buy')
            .reduce((acc, trade) => acc + trade.total, 0);

        const totalSold = trades
            .filter(t => t.side === 'Sell')
            .reduce((acc, trade) => acc + trade.total, 0);

        const netInvested = totalInvested - totalSold;

        const totalFees = trades.reduce((acc, trade) => acc + (trade.fees || 0), 0);

        return {
            totalInvested,
            totalSold,
            netInvested,
            totalFees,
        };
    }, [trades]);

    const formatCurrency = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
                title="Total Invested"
                value={formatCurrency(stats.totalInvested)}
                icon={<ArrowDown className="w-5 h-5" />}
                valueClassName="text-green-400"
                description="Sum of all 'Buy' trades."
            />
            <StatCard
                title="Total Sold Value"
                value={formatCurrency(stats.totalSold)}
                icon={<ArrowUp className="w-5 h-5" />}
                valueClassName="text-red-400"
                description="Sum of all 'Sell' trades."
            />
            <StatCard
                title="Net Invested Capital"
                value={formatCurrency(stats.netInvested)}
                icon={<FileText className="w-5 h-5" />}
                valueClassName={stats.netInvested >= 0 ? 'text-yellow-400' : 'text-cyan-400'}
                description="Invested capital minus sold value."
            />
            <StatCard
                title="Total Fees Paid"
                value={formatCurrency(stats.totalFees)}
                icon={<Calculator className="w-5 h-5" />}
                valueClassName="text-gray-300"
                description="Sum of all transaction fees."
            />
        </div>
    );
};
