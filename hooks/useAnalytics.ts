import { useMemo } from 'react';
import type { PerpTrade, SpotTrade } from '@/types';

export function useAnalytics(perpTrades: PerpTrade[], spotTrades: SpotTrade[]) {
    const perpStats = useMemo(() => {
        const closedTrades = perpTrades.filter(t => t.status === 'Closed' && t.pnl !== undefined);
        const totalPnl = closedTrades.reduce((acc, trade) => acc + (trade.pnl || 0), 0);
        const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
        const losingTrades = closedTrades.filter(t => (t.pnl || 0) < 0);
        const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;
        const totalFees = closedTrades.reduce((acc, t) => acc + t.fees, 0);

        return {
            totalPnl,
            winRate,
            totalWins: winningTrades.length,
            totalLosses: losingTrades.length,
            totalFees,
            totalTrades: perpTrades.length,
            closedTradesCount: closedTrades.length,
        };
    }, [perpTrades]);

    const spotStats = useMemo(() => {
        const totalInvested = spotTrades
            .filter(t => t.side === 'Buy')
            .reduce((acc, trade) => acc + trade.total, 0);
        const totalSold = spotTrades
            .filter(t => t.side === 'Sell')
            .reduce((acc, trade) => acc + trade.total, 0);
        const netInvested = totalInvested - totalSold;
        const totalFees = spotTrades.reduce((acc, trade) => acc + (trade.fees || 0), 0);
        return {
            totalInvested,
            totalSold,
            netInvested,
            totalFees,
        };
    }, [spotTrades]);
    
    const cumulativePnlData = useMemo(() => {
        const closedTrades = perpTrades
            .filter(t => t.status === 'Closed' && t.exitDate)
            .sort((a, b) => (a.exitDate || 0) - (b.exitDate || 0));

        let cumulativePnl = 0;
        return closedTrades.map((trade, index) => {
            cumulativePnl += trade.pnl || 0;
            return {
                name: `Trade ${index + 1}`,
                date: new Date(trade.exitDate!).toLocaleDateString('en-CA'), // YYYY-MM-DD for sorting
                pnl: cumulativePnl,
            };
        });
    }, [perpTrades]);

    const pnlBySymbolData = useMemo(() => {
        const pnlMap: { [symbol: string]: { pnl: number, count: number } } = {};

        perpTrades
            .filter(t => t.status === 'Closed' && t.pnl !== undefined)
            .forEach(trade => {
                if (!pnlMap[trade.symbol]) {
                    pnlMap[trade.symbol] = { pnl: 0, count: 0 };
                }
                pnlMap[trade.symbol].pnl += trade.pnl!;
                pnlMap[trade.symbol].count += 1;
            });

        return Object.entries(pnlMap)
            .map(([symbol, data]) => ({
                symbol,
                pnl: data.pnl,
                tradeCount: data.count,
            }))
            .sort((a, b) => b.pnl - a.pnl);
    }, [perpTrades]);

    return {
        perpStats,
        spotStats,
        cumulativePnlData,
        pnlBySymbolData,
    };
}