import React, { useState, useMemo, useEffect } from 'react';
import type { MemeCoin } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { NumberInput } from '@/components/ui/NumberInput';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { CheckIcon } from '@/components/icons/CheckIcon';
import { AlertTriangleIcon } from '@/components/icons/AlertTriangleIcon';
import { LockIcon } from '@/components/icons/LockIcon';
import { FileCheckIcon } from '@/components/icons/FileCheckIcon';
import { UsersIcon } from '@/components/icons/UsersIcon';
import { ExternalLink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';


interface MemeCoinDetailViewProps {
    coin: MemeCoin;
    setToast: (toast: { message: string; variant: 'success' | 'warning' | 'error' } | null) => void;
}

const SafetyMetricItem = ({ label, isSafe, safeText, unsafeText }: { label: string, isSafe: boolean, safeText: string, unsafeText: string }) => (
    <div className={`flex items-start gap-3 p-2 rounded-md ${isSafe ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
        <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${isSafe ? 'bg-green-500' : 'bg-red-500'}`}>
            {isSafe ? <CheckIcon className="w-3 h-3 text-black" /> : <AlertTriangleIcon className="w-3 h-3 text-black" />}
        </div>
        <div>
            <p className="font-semibold text-sm text-gray-200">{label}</p>
            <p className={`text-xs ${isSafe ? 'text-gray-400' : 'text-red-300'}`}>{isSafe ? safeText : unsafeText}</p>
        </div>
    </div>
);

export const MemeCoinDetailView = ({ coin, setToast }: MemeCoinDetailViewProps) => {
    const [tradeAmount, setTradeAmount] = useState('1.0');
    const [slippage, setSlippage] = useState('5');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Sell state
    const [sellPercent, setSellPercent] = useState(100);
    const [sellAmount, setSellAmount] = useState('');
    // FIX: Add state to control the active tab for the Tabs component.
    const [activeTab, setActiveTab] = useState('buy');

    const explorerUrl = coin.chain === 'SOL'
        ? `https://solscan.io/token/${coin.address}`
        : `https://bscscan.com/token/${coin.address}`;

    // Mock user balance for the selected meme coin. In a real app, this would come from a wallet store.
    const MOCK_USER_BALANCE = useMemo(() => (100 / coin.price), [coin.price]); // Approx $100 worth

    useEffect(() => {
        const amount = (MOCK_USER_BALANCE * (sellPercent / 100));
        setSellAmount(amount.toFixed(4));
    }, [sellPercent, MOCK_USER_BALANCE]);

    const handleSellAmountChange = (value: string) => {
        setSellAmount(value);
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && MOCK_USER_BALANCE > 0) {
            const newPercent = (numValue / MOCK_USER_BALANCE) * 100;
            setSellPercent(Math.max(0, Math.min(100, newPercent)));
        }
    };

    const handleTrade = (side: 'Buy' | 'Sell') => {
        setIsSubmitting(true);
        setTimeout(() => {
            let message = '';
            if (side === 'Buy') {
                message = `Simulated ${side} order for ${tradeAmount} ${coin.chain} of ${coin.symbol} placed.`;
            } else {
                const amountToSell = parseFloat(sellAmount);
                message = `Simulated ${side} order for ${amountToSell.toLocaleString()} ${coin.symbol} placed.`;
            }
            setToast({ message, variant: 'success' });
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            <div className="md:col-span-2 h-full flex flex-col gap-6">
                <Card className="flex-grow">
                    <CardHeader className="flex flex-row justify-between items-center">
                        <h2 className="text-xl font-bold">{coin.symbol} Chart</h2>
                        <a href={explorerUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-cyan-400 transition-colors">
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </CardHeader>
                    <CardContent>
                        <div className="h-96 bg-gray-900/50 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500 text-lg font-semibold">Mock Chart Area</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader><h2 className="text-xl font-bold">Trade Panel</h2></CardHeader>
                    <CardContent>
                       {/* FIX: Replaced `defaultValue` with controlled `value` and `onValueChange` props. */}
                       <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'buy' | 'sell')} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="buy">Buy</TabsTrigger>
                                <TabsTrigger value="sell">Sell</TabsTrigger>
                            </TabsList>
                            <TabsContent value="buy" className="mt-4 space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="trade-amount">Amount ({coin.chain})</Label>
                                    <NumberInput id="trade-amount" value={tradeAmount} onValueChange={setTradeAmount} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="slippage-buy">Slippage</Label>
                                    <Select id="slippage-buy" value={slippage} onValueChange={setSlippage}>
                                        <option value="1">1%</option>
                                        <option value="5">5%</option>
                                        <option value="10">10%</option>
                                    </Select>
                                </div>
                                <Button onClick={() => handleTrade('Buy')} disabled={isSubmitting} className="w-full h-12 bg-green-600 hover:bg-green-500 font-bold text-lg">
                                    BUY {coin.symbol}
                                </Button>
                            </TabsContent>
                            <TabsContent value="sell" className="mt-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sell-amount">Amount ({coin.symbol})</Label>
                                    <NumberInput id="sell-amount" value={sellAmount} onValueChange={handleSellAmountChange} />
                                    <p className="text-xs text-gray-400 px-1">Your balance: {MOCK_USER_BALANCE.toLocaleString(undefined, {maximumFractionDigits: 2})}</p>
                                </div>
                                <div className="space-y-2">
                                    <Label>Percentage to Sell</Label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        step="1"
                                        value={sellPercent}
                                        onChange={(e) => setSellPercent(Number(e.target.value))}
                                        disabled={isSubmitting}
                                        className="w-full"
                                    />
                                    <div className="flex justify-between items-center text-xs text-gray-400">
                                        {[25, 50, 75, 100].map(p => (
                                            <button key={p} type="button" onClick={() => setSellPercent(p)} className="px-2 py-1 hover:text-white" disabled={isSubmitting}>
                                                {p}%
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="slippage-sell">Slippage</Label>
                                    <Select id="slippage-sell" value={slippage} onValueChange={setSlippage} disabled={isSubmitting}>
                                        <option value="1">1%</option>
                                        <option value="5">5%</option>
                                        <option value="10">10%</option>
                                    </Select>
                                </div>
                                <Button onClick={() => handleTrade('Sell')} disabled={isSubmitting} className="w-full h-12 bg-red-600 hover:bg-red-500 font-bold text-lg">
                                    SELL {coin.symbol}
                                </Button>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-1">
                <Card className="h-full">
                    <CardHeader>
                        <h2 className="text-xl font-bold">AI Safety Analysis</h2>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <SafetyMetricItem
                            label="Liquidity"
                            isSafe={coin.safetyMetrics.isLiquidityLocked}
                            safeText="Liquidity appears to be locked or burned, reducing rug pull risk."
                            unsafeText="Warning: Liquidity is not locked. The developer can remove it at any time."
                        />
                         <SafetyMetricItem
                            label="Contract"
                            isSafe={coin.safetyMetrics.isContractVerified}
                            safeText="The smart contract is verified on the blockchain explorer."
                            unsafeText="Caution: The smart contract is not verified, its code is hidden."
                        />
                         <SafetyMetricItem
                            label="Mint Function"
                            isSafe={coin.safetyMetrics.isMintDisabled}
                            safeText="The function to create new tokens is disabled."
                            unsafeText="Warning: The developer can mint new tokens, potentially diluting the value."
                        />
                         <SafetyMetricItem
                            label="Holder Distribution"
                            isSafe={coin.safetyMetrics.top10HolderPercent < 15}
                            safeText={`Top 10 holders own ${coin.safetyMetrics.top10HolderPercent}% of the supply. This is a healthy distribution.`}
                            unsafeText={`Warning: Top 10 holders own ${coin.safetyMetrics.top10HolderPercent}% of the supply, increasing dump risk.`}
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};