import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type { UserParams } from '@/types';
import { useStore } from '@/store';
import { useScreenerStore } from '@/store/screenerStore';
import { runMarketScreener } from '@/services/geminiService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ErrorMessage } from '@/components/ErrorMessage';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { Loader2Icon } from '@/components/icons/Loader2Icon';
import { ScanLineIcon } from '@/components/icons/ScanLineIcon';
import { FormattedReasoning } from '@/components/FormattedReasoning';
import { ZapIcon } from '@/components/icons/ZapIcon';
import { ChartIcon } from '@/components/icons/ChartIcon';
import { formatDistanceToNow } from '@/utils/date';
import { Trash2Icon } from '@/components/icons/Trash2Icon';
import { MoreHorizontalIcon } from '@/components/icons/MoreHorizontalIcon';
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/DropdownMenu';
import { SearchIcon } from '@/components/icons/SearchIcon';

const exampleQueries = [
    "Find trending assets that are currently overbought on the 4-hour RSI.",
    "Show me coins with a bullish market structure that are pulling back to a key support level.",
    "Which assets have the highest volume spike in the last hour?",
    "Find coins showing bullish divergence on the daily chart.",
    "Which assets are forming a golden cross (50MA over 200MA) on the 4H timeframe?",
    "Show me cryptocurrencies that are breaking out of a long-term consolidation range with high volume.",
    "Identify assets that are in a strong downtrend and currently retesting a major resistance level.",
    "Which tokens have recently had a significant drop in price but are now showing signs of reversal?",
    "List coins that are currently trading inside a tight Bollinger Band squeeze on the 1-hour chart.",
    "Find assets with low volatility that are setting up for a potential large move.",
];

interface ScreenerPageProps {
    onGenerateSignal: (params: Partial<UserParams>, options?: { navigate?: boolean }) => void;
    onGenerateScalp: (params: Partial<UserParams>, options?: { navigate?: boolean }) => void;
}

export default function ScreenerPage({ onGenerateSignal, onGenerateScalp }: ScreenerPageProps) {
    const { setCurrentPage } = useStore();
    const { runs, startScan, completeScan, failScan, deleteScan, clearHistory } = useScreenerStore();

    const [query, setQuery] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [scanToDelete, setScanToDelete] = useState<string | null>(null);
    const [isClearAlertOpen, setIsClearAlertOpen] = useState(false);
    const [analyzingSymbol, setAnalyzingSymbol] = useState<string | null>(null);

    const [suggestionIndex, setSuggestionIndex] = useState(0);
    const [animationClass, setAnimationClass] = useState('animate-suggestion-in');

    // Cycle through suggestions with a fade in/out animation
    useEffect(() => {
        const cycleTime = 5000;
        const animationDuration = 300;

        const interval = setInterval(() => {
            setAnimationClass('animate-suggestion-out'); // Start fade out

            setTimeout(() => {
                // After fade out, update content and fade in
                setSuggestionIndex(prevIndex => (prevIndex + 1) >= exampleQueries.length ? 0 : prevIndex + 1);
                setAnimationClass('animate-suggestion-in');
            }, animationDuration);

        }, cycleTime);
        return () => clearInterval(interval);
    }, []);

    const visibleSuggestion = exampleQueries[suggestionIndex];


    const handleScan = useCallback(async () => {
        if (!query.trim()) {
            setLocalError("Please enter a query to scan the market.");
            return;
        }
        setIsScanning(true);
        setLocalError(null);
        const runId = startScan(query);
        try {
            const scanResults = await runMarketScreener(query);
            completeScan(runId, scanResults);
        } catch (err: any) {
            failScan(runId, err.message || "An unknown error occurred during the scan.");
        } finally {
            setIsScanning(false);
            setQuery('');
        }
    }, [query, startScan, completeScan, failScan]);

    const handleAnalyzeClick = (symbol: string, page: 'signal-gen' | 'scalping') => {
        setAnalyzingSymbol(symbol);
        setTimeout(() => {
            if (page === 'signal-gen') {
                onGenerateSignal({ symbol, timeframe: '4h' }, { navigate: false });
            } else {
                onGenerateScalp({ symbol, timeframe: '5m' }, { navigate: false });
            }
            setCurrentPage(page);
            setTimeout(() => setAnalyzingSymbol(null), 500);
        }, 300);
    };
    
    const filteredRuns = useMemo(() => {
        if (!searchTerm) return runs;
        const lowerCaseSearch = searchTerm.toLowerCase();
        return runs.filter(run => run.query.toLowerCase().includes(lowerCaseSearch));
    }, [runs, searchTerm]);

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold">AI Market Screener</h1>
                <p className="text-gray-400 mt-1">Ask Gemini to find trading opportunities across the market in plain English.</p>
            </div>

            <Card className="bg-gray-800/60">
                <CardContent className="pt-6">
                    <div className="relative">
                        <Textarea 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Describe your ideal trade setup... e.g., 'Find trending assets that are currently overbought on the 4-hour RSI.'"
                            rows={5}
                            className="w-full bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 pr-12 text-base text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                            disabled={isScanning}
                        />
                         <div className="absolute top-4 right-4 text-gray-500 pointer-events-none">
                            <ScanLineIcon className="w-6 h-6" />
                        </div>
                    </div>
                    {localError && <div className="mt-4"><ErrorMessage message={localError} onClose={() => setLocalError(null)} /></div>}
                    <div className="flex flex-col items-center gap-4 mt-4">
                        <Button onClick={handleScan} disabled={isScanning} className="w-full sm:w-auto">
                            {isScanning ? <Loader2Icon className="w-4 h-4 mr-2 animate-spin" /> : <ScanLineIcon className="w-4 h-4 mr-2" />}
                            {isScanning ? 'Scanning...' : 'Scan Market'}
                        </Button>
                         <div className="space-y-2 text-center w-full">
                            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Or try a suggestion</p>
                            <div className={`flex justify-center min-h-[3rem] items-center ${animationClass}`}>
                                {visibleSuggestion && (
                                    <button
                                        key={visibleSuggestion}
                                        onClick={() => setQuery(visibleSuggestion)}
                                        disabled={isScanning}
                                        className="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-md text-sm text-gray-300 transition-colors disabled:opacity-50"
                                    >
                                        {visibleSuggestion}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <Input
                        icon={<SearchIcon className="w-4 h-4" />}
                        placeholder="Search scan history..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:max-w-xs"
                    />
                    {runs.length > 0 && (
                        <Button onClick={() => setIsClearAlertOpen(true)} className="w-full md:w-auto bg-transparent hover:bg-red-900/30 border border-red-800 text-red-400 font-semibold text-sm">
                            <Trash2Icon className="w-4 h-4 mr-2" /> Clear History
                        </Button>
                    )}
                </div>

                {filteredRuns.length > 0 ? (
                    filteredRuns.map(run => (
                        <Card key={run.id}>
                            <CardHeader className="flex flex-row justify-between items-start">
                                <div>
                                    <p className="font-semibold text-gray-300">"{run.query}"</p>
                                    <p className="text-xs text-gray-500 mt-1">{formatDistanceToNow(run.timestamp)}</p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="p-2 -mr-2 rounded-md hover:bg-gray-700">
                                            <MoreHorizontalIcon className="w-5 h-5"/>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => setScanToDelete(run.id)} className="text-red-400 hover:text-red-300">
                                            <Trash2Icon className="w-4 h-4 mr-2"/> Delete Scan
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </CardHeader>
                            <CardContent>
                                {run.isLoading ? (
                                    <div className="flex items-center justify-center text-center py-10">
                                        <Loader2Icon className="w-8 h-8 animate-spin text-cyan-400" />
                                        <p className="ml-4 text-md font-semibold text-gray-300">Scanning...</p>
                                    </div>
                                ) : run.error ? (
                                    <ErrorMessage message={run.error} onClose={() => {}} />
                                ) : run.results.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {run.results.map(result => (
                                            <Card key={result.symbol} className="flex flex-col bg-gray-900/50">
                                                <CardHeader><CardTitle>{result.symbol}</CardTitle></CardHeader>
                                                <CardContent className="flex-grow text-sm"><FormattedReasoning text={result.rationale} /></CardContent>
                                                <div className="p-3 border-t border-gray-700/50 flex gap-2">
                                                    <Button onClick={() => handleAnalyzeClick(result.symbol, 'signal-gen')} disabled={!!analyzingSymbol} className="flex-1 bg-transparent hover:bg-gray-700 border border-gray-600 text-white font-semibold text-xs">
                                                        {analyzingSymbol === result.symbol ? <Loader2Icon className="w-4 h-4 animate-spin"/> : <ChartIcon className="w-4 h-4"/>} <span className="ml-2">Signal Gen</span>
                                                    </Button>
                                                    <Button onClick={() => handleAnalyzeClick(result.symbol, 'scalping')} disabled={!!analyzingSymbol} className="flex-1 text-xs">
                                                        {analyzingSymbol === result.symbol ? <Loader2Icon className="w-4 h-4 animate-spin"/> : <ZapIcon className="w-4 h-4"/>} <span className="ml-2">Scalping</span>
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-6">No matching assets found for this query.</p>
                                )}
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-20 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
                        <ScanLineIcon className="mx-auto h-12 w-12 text-gray-500" />
                        <h3 className="mt-2 text-lg font-medium text-white">No Scan History</h3>
                        <p className="mt-1 text-sm text-gray-400">Your past scan results will appear here.</p>
                    </div>
                )}
            </div>

            <AlertDialog
                isOpen={!!scanToDelete}
                onClose={() => setScanToDelete(null)}
                onConfirm={() => { if(scanToDelete) deleteScan(scanToDelete); setScanToDelete(null); }}
                title="Delete Scan?"
                description="This will permanently delete this scan result from your history."
            />
            <AlertDialog
                isOpen={isClearAlertOpen}
                onClose={() => setIsClearAlertOpen(false)}
                onConfirm={() => { clearHistory(); setIsClearAlertOpen(false); }}
                title="Clear All History?"
                description="This will permanently delete all your saved scan results. This action cannot be undone."
            />
        </div>
    );
}
