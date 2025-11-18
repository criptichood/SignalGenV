import React, { useState, useEffect, useMemo } from 'react';
import type { TrackedWallet, StablecoinHolding } from '@/types';
import { useStablecoinStore } from '@/store/stablecoinStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/analytics/StatCard';
import { AddWalletModal } from '@/components/stablecoin/AddWalletModal';
import { WalletListItem } from '@/components/stablecoin/WalletListItem';
import { BreakdownChart } from '@/components/stablecoin/BreakdownChart';
import { PlusIcon } from '@/components/icons/PlusIcon';
import { DollarSignIcon } from '@/components/icons/DollarSignIcon';
import { WalletIcon } from '@/components/icons/WalletIcon';
import { PieChartIcon } from '@/components/icons/PieChartIcon';
import { SafeIcon } from '@/components/icons/SafeIcon';
import { AlertDialog } from '@/components/ui/AlertDialog';

export default function StablecoinStashPage() {
    const {
        wallets,
        holdings,
        addWallet,
        deleteWallet,
        fetchBalancesForAllWallets
    } = useStablecoinStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [walletToDelete, setWalletToDelete] = useState<TrackedWallet | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    
    useEffect(() => {
        fetchBalancesForAllWallets();
    }, [fetchBalancesForAllWallets]);

    const handleDeleteClick = (wallet: TrackedWallet) => {
        setWalletToDelete(wallet);
        setIsAlertOpen(true);
    };

    const confirmDelete = () => {
        if (walletToDelete) {
            deleteWallet(walletToDelete.id);
        }
        setIsAlertOpen(false);
        setWalletToDelete(null);
    };

    const { totalValue, breakdownData, dominantCoin } = useMemo(() => {
        let total = 0;
        const breakdown: Record<string, number> = {};

        // FIX: Switched from Object.values to Object.keys to iterate over holdings. This ensures TypeScript correctly infers the type of `holdingInfo` and avoids errors with `unknown` type.
        Object.keys(holdings).forEach(walletId => {
            const holdingInfo = holdings[walletId];
            holdingInfo.data.forEach(coin => {
                total += coin.value;
                breakdown[coin.symbol] = (breakdown[coin.symbol] || 0) + coin.value;
            });
        });
        
        const breakdownData = Object.entries(breakdown).map(([name, value]) => ({ name, value }));
        
        const dominant = breakdownData.length > 0
            ? breakdownData.reduce((max, coin) => coin.value > max.value ? coin : max)
            : null;
        
        const dominantCoin = dominant ? {
            name: dominant.name,
            percentage: total > 0 ? (dominant.value / total) * 100 : 0
        } : null;

        return { totalValue: total, breakdownData, dominantCoin };
    }, [holdings]);

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Stablecoin Stash</h1>
                    <p className="text-gray-400 mt-1">Monitor your stablecoin savings across wallets.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Wallet
                </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Stablecoin Value"
                    value={totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    icon={<DollarSignIcon className="w-5 h-5" />}
                    valueClassName="text-cyan-400"
                />
                <StatCard 
                    title="Wallets Tracked"
                    value={wallets.length.toString()}
                    icon={<WalletIcon className="w-5 h-5" />}
                />
                 <StatCard 
                    title="Dominant Stablecoin"
                    value={dominantCoin ? `${dominantCoin.name} (${dominantCoin.percentage.toFixed(1)}%)` : 'N/A'}
                    icon={<PieChartIcon className="w-5 h-5" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Tracked Wallets</CardTitle>
                        <CardDescription>Your added wallets and their stablecoin balances.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {wallets.length > 0 ? (
                            <div className="space-y-4">
                                {wallets.map(wallet => (
                                    <WalletListItem
                                        key={wallet.id}
                                        wallet={wallet}
                                        holdingInfo={holdings[wallet.id]}
                                        onDelete={() => handleDeleteClick(wallet)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-lg">
                                <SafeIcon className="mx-auto h-12 w-12 text-gray-500" />
                                <h3 className="mt-2 text-lg font-medium text-white">Your Stash is Empty</h3>
                                <p className="mt-1 text-sm text-gray-400">
                                    Click "Add Wallet" to start tracking your stablecoins.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Portfolio Breakdown</CardTitle>
                        <CardDescription>Distribution of your stablecoin holdings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <BreakdownChart data={breakdownData} />
                    </CardContent>
                </Card>
            </div>

            <AddWalletModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={addWallet}
            />
            
             <AlertDialog
                isOpen={isAlertOpen}
                onClose={() => setIsAlertOpen(false)}
                onConfirm={confirmDelete}
                title="Remove Wallet?"
                description={`Are you sure you want to stop tracking "${walletToDelete?.label}" (${walletToDelete?.address})? This cannot be undone.`}
            />
        </div>
    );
}