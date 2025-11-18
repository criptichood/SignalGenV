import React, { useState, useRef, useEffect } from 'react';
import { useHistoryStore } from '@/store/historyStore';
import type { PerpTrade } from '@/types';
import * as exchangeService from '@/services/exchangeService';
import { PerpTradeTable } from '@/components/perp-log/PerpTradeTable';
import { PerpTradeModal } from '@/components/perp-log/PerpTradeModal';
import { Button } from '@/components/ui/Button';
import { Upload, Download, Plus } from 'lucide-react';
import { ErrorMessage } from '@/components/ErrorMessage';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { PerpStatsCards } from '@/components/perp-log/PerpStatsCards';

export default function PerpLogPage() {
    const { perpTrades: trades, setPerpTrades: setTrades } = useHistoryStore();
    const [symbols, setSymbols] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tradeToEdit, setTradeToEdit] = useState<PerpTrade | null>(null);
    const [tradeToDelete, setTradeToDelete] = useState<string | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [exportableData, setExportableData] = useState<PerpTrade[]>([]);

    useEffect(() => {
        exchangeService.getSymbols('binance').then(setSymbols).catch(err => {
            console.error("Failed to load symbols:", err);
            setImportError("Could not load symbol list.");
        });
    }, []);

    const handleOpenModal = (trade: PerpTrade | null = null) => {
        setTradeToEdit(trade);
        setIsModalOpen(true);
    };

    const handleSaveTrade = (tradeData: Omit<PerpTrade, 'id' | 'pnl' | 'pnlPercentage'> & { id?: string }) => {
        setTrades(prev => {
            let pnl, pnlPercentage;
            if (tradeData.status === 'Closed' && tradeData.exitPrice) {
                const entryValue = tradeData.entryPrice * tradeData.quantity;
                const exitValue = tradeData.exitPrice * tradeData.quantity;
                const grossPnl = tradeData.side === 'Long' ? exitValue - entryValue : entryValue - exitValue;
                pnl = grossPnl - tradeData.fees;
                if (tradeData.margin > 0) {
                    pnlPercentage = (pnl / tradeData.margin) * 100;
                }
            }

            const newTrade: PerpTrade = {
                ...tradeData,
                id: tradeData.id || crypto.randomUUID(),
                pnl,
                pnlPercentage,
            };

            if (tradeData.id) {
                return prev.map(t => t.id === tradeData.id ? newTrade : t);
            }
            return [newTrade, ...prev];
        });
        setIsModalOpen(false);
    };
    
    const handleDeleteClick = (id: string) => {
        setTradeToDelete(id);
        setIsAlertOpen(true);
    };
    
    const confirmDelete = () => {
        if (tradeToDelete) {
            setTrades(prev => prev.filter(t => t.id !== tradeToDelete));
        }
        setIsAlertOpen(false);
        setTradeToDelete(null);
    };

    const handleExport = () => {
        if (exportableData.length === 0) return;
        const dataStr = JSON.stringify(exportableData, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `perp_trade_log_${new Date().toISOString().split('T')[0]}.json`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setImportError(null);
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (!Array.isArray(data)) throw new Error("File must contain an array of trades.");
                 if (data.length > 0 && (!data[0].id || !data[0].symbol || !data[0].leverage)) {
                    throw new Error("Invalid perpetual trade data format in file.");
                }
                setTrades(prev => [...prev, ...data.filter(t => t.id && !prev.some(p => p.id === t.id))]);
            } catch (error: any) {
                setImportError(error.message || "Failed to parse JSON file.");
            } finally {
                if (event.target) event.target.value = '';
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Perpetuals Trade Log</h1>
                    <p className="text-gray-400 mt-1">Manually log your perpetual futures trades to track P/L.</p>
                </div>
                 <div className="flex flex-wrap justify-end items-center gap-2">
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".json" />
                    <Button onClick={() => fileInputRef.current?.click()} className="flex-1 sm:flex-none bg-transparent hover:bg-gray-700 border border-gray-600 text-white font-semibold">
                       <Upload className="w-4 h-4 mr-2" /> Import
                    </Button>
                    <Button onClick={handleExport} disabled={exportableData.length === 0} className="flex-1 sm:flex-none bg-transparent hover:bg-gray-700 border border-gray-600 text-white font-semibold">
                       <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                    <Button onClick={() => handleOpenModal()} className="flex-1 sm:flex-none">
                        <Plus className="w-5 h-5 mr-2" /> Log New Trade
                    </Button>
                </div>
            </div>
            
            <PerpStatsCards trades={trades} />
            
            {importError && <ErrorMessage message={importError} onClose={() => setImportError(null)} />}
            <PerpTradeTable trades={trades} onEdit={handleOpenModal} onDelete={handleDeleteClick} onFilteredDataChange={setExportableData} />
            <PerpTradeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTrade} tradeToEdit={tradeToEdit} symbols={symbols} />
            <AlertDialog isOpen={isAlertOpen} onClose={() => setIsAlertOpen(false)} onConfirm={confirmDelete} title="Delete Trade?" description="This will permanently delete this trade from your log. This action cannot be undone." />
        </div>
    );
}