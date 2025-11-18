import React, { useState, useMemo, useEffect } from 'react';
import type { MemeCoin } from '@/types';
import { useStore } from '@/store';
import { MOCK_MEME_COINS } from '@/data/memeCoinData';
import { MemeCoinListItem } from '@/components/memes-scalp/MemeCoinListItem';
import { MemeCoinDetailView } from '@/components/memes-scalp/MemeCoinDetailView';
import { Alert } from '@/components/ui/Alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Flame, Info, Search } from 'lucide-react';

type Chain = 'SOL' | 'BNB';
type SortKey = 'hypeScore' | 'launchDate' | 'priceChange24h' | 'marketCap';

export default function MemesScalpPage() {
    const { setToast } = useStore();
    const [selectedChain, setSelectedChain] = useState<Chain>('SOL');
    const [sortBy, setSortBy] = useState<SortKey>('hypeScore');
    const [selectedCoin, setSelectedCoin] = useState<MemeCoin | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAndSortedCoins = useMemo(() => {
        const lowercasedSearch = searchTerm.toLowerCase().trim();

        return MOCK_MEME_COINS
            .filter(coin => {
                const chainMatch = coin.chain === selectedChain;
                if (!chainMatch) return false;

                if (!lowercasedSearch) return true;

                const nameMatch = coin.name.toLowerCase().includes(lowercasedSearch);
                const symbolMatch = coin.symbol.toLowerCase().includes(lowercasedSearch);
                const addressMatch = coin.address.toLowerCase().includes(lowercasedSearch);

                return nameMatch || symbolMatch || addressMatch;
            })
            .sort((a, b) => {
                if (sortBy === 'launchDate') {
                    return b.launchDate - a.launchDate; // Newest first
                }
                return b[sortBy] - a[sortBy];
            });
    }, [selectedChain, sortBy, searchTerm]);

    // Select the first coin by default when the list changes
    useEffect(() => {
        if (filteredAndSortedCoins.length > 0) {
            setSelectedCoin(filteredAndSortedCoins[0]);
        } else {
            setSelectedCoin(null);
        }
    }, [filteredAndSortedCoins]);

    return (
        <div className="flex flex-col h-full">
            <div className="space-y-2 mb-6">
                <h1 className="text-3xl font-bold text-white flex items-center gap-2"><Flame className="w-8 h-8"/>Meme Coin Scalp Terminal</h1>
                <p className="text-gray-400">High-risk, high-reward terminal for memecoin trading on SOL and BNB chains.</p>
            </div>

            <Alert variant="warning" title="Demonstration Mode" className="mb-6">
                <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p>Please note: This page is currently using **mock data** to demonstrate the UI and features. The data is not live from the blockchain. Live data integration with services like DexScreener is planned for a future update.</p>
                </div>
            </Alert>
            
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <Tabs value={selectedChain} onValueChange={(value) => setSelectedChain(value as Chain)}>
                    <TabsList>
                        <TabsTrigger value="SOL">Solana</TabsTrigger>
                        <TabsTrigger value="BNB">BNB Chain</TabsTrigger>
                    </TabsList>
                </Tabs>

                <div className="relative flex-1 min-w-[250px] max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                        placeholder="Search name or paste address..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="pl-9" 
                    />
                </div>
                
                <div className="flex items-center gap-2">
                    <label htmlFor="sort-by" className="text-sm font-medium text-gray-400">Sort by:</label>
                    <Select id="sort-by" value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
                        <option value="hypeScore">Hype Score</option>
                        <option value="launchDate">Newest</option>
                        <option value="priceChange24h">24h Change</option>
                        <option value="marketCap">Market Cap</option>
                    </Select>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                {/* Coin List */}
                <div className="lg:col-span-1 bg-gray-800/50 border border-gray-700 rounded-lg flex flex-col">
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {filteredAndSortedCoins.length > 0 ? (
                            filteredAndSortedCoins.map(coin => (
                                <MemeCoinListItem
                                    key={coin.id}
                                    coin={coin}
                                    isSelected={selectedCoin?.id === coin.id}
                                    onSelect={() => setSelectedCoin(coin)}
                                />
                            ))
                        ) : (
                             <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
                                <Search className="w-12 h-12 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-400">No Coins Found</h3>
                                <p className="text-sm">Your search did not return any results.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail View */}
                <div className="lg:col-span-2">
                    {selectedCoin ? (
                        <MemeCoinDetailView key={selectedCoin.id} coin={selectedCoin} setToast={setToast} />
                    ) : (
                         <div className="h-full flex flex-col items-center justify-center text-center bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-lg p-4">
                            <Search className="w-12 h-12 text-gray-600 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-400">No Coin Selected</h3>
                            <p className="text-sm text-gray-500">
                                {searchTerm 
                                    ? "No coins match your current search."
                                    : "Select a coin from the list to see its details."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}