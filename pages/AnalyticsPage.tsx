import React, { useState, useCallback } from 'react';
import { useHistoryStore } from '@/store/historyStore';
import { StatCard } from '@/components/analytics/StatCard';
import { BarChartBig, TrendingUp, TrendingDown, FileText, TrendingUp as TrendingUp2, Calculator, ArrowDown, ArrowUp, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/Card';
import { useAnalytics } from '@/hooks/useAnalytics';
import { CumulativePnlChart } from '@/components/analytics/CumulativePnlChart';
import { WinLossDonutChart } from '@/components/analytics/WinLossDonutChart';
import { PnlBySymbolChart } from '@/components/analytics/PnlBySymbolChart';
import { Button } from '@/components/ui/Button';
import { FormattedReasoning } from '@/components/FormattedReasoning';
import { analyzeTradingPerformance } from '@/services/geminiService';
import { ErrorMessage } from '@/components/ErrorMessage';


const AnalyticsPage = () => {
    const { spotTrades, perpTrades } = useHistoryStore();
    
    const { perpStats, spotStats, cumulativePnlData, pnlBySymbolData } = useAnalytics(perpTrades, spotTrades);

    const [aiReview, setAiReview] = useState('');
    const [isReviewLoading, setIsReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState<string | null>(null);
    
    const formatCurrency = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    const handleGetReview = useCallback(async () => {
        setIsReviewLoading(true);
        setReviewError(null);
        setAiReview('');
        try {
            const review = await analyzeTradingPerformance(perpTrades, spotTrades);
            setAiReview(review);
        } catch (error: any) {
            setReviewError(error.message || 'An unknown error occurred.');
        } finally {
            setIsReviewLoading(false);
        }
    }, [perpTrades, spotTrades]);

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                    <p className="text-gray-400 mt-1">A comprehensive overview of your trading performance.</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                        AI Performance Review
                    </CardTitle>
                    <CardDescription>Get personalized insights on your trading habits from Gemini.</CardDescription>
                </CardHeader>
                <CardContent>
                    {reviewError && <ErrorMessage message={reviewError} onClose={() => setReviewError(null)} />}
                    
                    {isReviewLoading ? (
                        <div className="flex flex-col items-center justify-center min-h-[150px] text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                            <p className="mt-4 text-lg font-semibold text-gray-300">AI is analyzing your trades...</p>
                            <p className="mt-1 text-sm text-gray-400">This may take a moment.</p>
                        </div>
                    ) : aiReview ? (
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50 max-h-96 overflow-y-auto">
                            <FormattedReasoning text={aiReview} />
                        </div>
                    ) : (
                         <div className="text-center py-8">
                            <p className="text-gray-400 mb-4">Click the button to have Gemini analyze your trade history and provide actionable advice.</p>
                            <Button onClick={handleGetReview} disabled={isReviewLoading || (perpTrades.length === 0 && spotTrades.length === 0)}>
                                <Sparkles className="w-4 h-4 mr-2" />
                                {isReviewLoading ? 'Analyzing...' : 'Get AI Review'}
                            </Button>
                             {(perpTrades.length === 0 && spotTrades.length === 0) && (
                                <p className="text-xs text-gray-500 mt-2">You need to log some trades first.</p>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <section>
                <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">Perpetuals Performance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <StatCard 
                        title="Total Net P/L"
                        value={formatCurrency(perpStats.totalPnl)}
                        icon={<BarChartBig className="w-5 h-5" />}
                        valueClassName={perpStats.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}
                        description="From all closed perpetual trades."
                    />
                    <StatCard 
                        title="Win Rate"
                        value={`${perpStats.winRate.toFixed(2)}%`}
                        icon={<TrendingUp2 className="w-5 h-5" />}
                        description={`${perpStats.totalWins} wins / ${perpStats.totalLosses} losses`}
                    />
                    <StatCard 
                        title="Total Winning Trades"
                        value={perpStats.totalWins.toString()}
                        icon={<TrendingUp className="w-5 h-5" />}
                        valueClassName="text-green-400"
                    />
                    <StatCard 
                        title="Total Losing Trades"
                        value={perpStats.totalLosses.toString()}
                        icon={<TrendingDown className="w-5 h-5" />}
                        valueClassName="text-red-400"
                    />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Cumulative P/L</CardTitle>
                            <CardDescription>Your account's profit and loss over time.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <CumulativePnlChart data={cumulativePnlData} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Win/Loss Ratio</CardTitle>
                             <CardDescription>Distribution of winning vs losing trades.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <WinLossDonutChart wins={perpStats.totalWins} losses={perpStats.totalLosses} />
                        </CardContent>
                    </Card>
                </div>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>P/L by Symbol</CardTitle>
                        <CardDescription>Breakdown of profitability for each traded symbol.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <PnlBySymbolChart data={pnlBySymbolData} />
                    </CardContent>
                </Card>
            </section>

             <section>
                <h2 className="text-2xl font-semibold mb-4 border-b border-gray-700 pb-2">Spot Activity</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Invested"
                        value={formatCurrency(spotStats.totalInvested)}
                        icon={<ArrowDown className="w-5 h-5" />}
                        valueClassName="text-green-400"
                        description="Sum of all 'Buy' trades."
                    />
                    <StatCard
                        title="Total Sold Value"
                        value={formatCurrency(spotStats.totalSold)}
                        icon={<ArrowUp className="w-5 h-5" />}
                        valueClassName="text-red-400"
                        description="Sum of all 'Sell' trades."
                    />
                    <StatCard
                        title="Net Invested Capital"
                        value={formatCurrency(spotStats.netInvested)}
                        icon={<FileText className="w-5 h-5" />}
                        valueClassName={spotStats.netInvested >= 0 ? 'text-yellow-400' : 'text-cyan-400'}
                        description="Invested capital minus sold value."
                    />
                    <StatCard
                        title="Total Fees Paid (Spot)"
                        value={formatCurrency(spotStats.totalFees)}
                        icon={<Calculator className="w-5 h-5" />}
                    />
                </div>
            </section>
        </div>
    );
};

export default AnalyticsPage;