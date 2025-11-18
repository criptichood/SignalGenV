

import React, { useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { SpotTrade } from '@/types';
import { Dialog } from '@/components/ui/Dialog';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { NumberInput } from '@/components/ui/NumberInput';
import { Button } from '@/components/ui/Button';
import { Combobox } from '@/components/ui/Combobox';
import { Loader2 } from 'lucide-react';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { useSocialStore } from '@/store/socialStore';

interface SpotTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Omit<SpotTrade, 'id'> & { id?: string }) => void;
  tradeToEdit: SpotTrade | null;
  symbols: string[];
}

const getInitialState = (trade: SpotTrade | null) => ({
    id: trade?.id || undefined,
    symbol: trade?.symbol || 'BTCUSDT',
    side: trade?.side || 'Buy',
    date: trade ? new Date(trade.date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    price: trade?.price?.toString() || '',
    quantity: trade?.quantity?.toString() || '',
    total: trade?.total?.toString() || '',
    fees: trade?.fees?.toString() || '',
    notes: trade?.notes || '',
    strategyTags: trade?.strategyTags?.join(', ') || '',
    chartImageUrl: trade?.chartImageUrl || '',
});


export const SpotTradeModal = ({ isOpen, onClose, onSave, tradeToEdit, symbols }: SpotTradeModalProps) => {
    const [formData, setFormData] = useState(getInitialState(tradeToEdit));
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [favorites, setFavorites] = useLocalStorage<string[]>('spotFavoriteSymbols', ['BTCUSDT', 'ETHUSDT']);

    const { strategies } = useSocialStore();
    const userStrategyTitles = useMemo(() => strategies.filter(s => s.authorUsername === 'CryptoTrader123').map(s => s.title), [strategies]);

    useEffect(() => {
        setFormData(getInitialState(tradeToEdit));
        setErrors({});
    }, [tradeToEdit, isOpen]);

    useEffect(() => {
        const price = parseFloat(formData.price);
        const total = parseFloat(formData.total);

        if (price > 0 && total > 0) {
            const calculatedQuantity = total / price;
            if (formData.quantity !== calculatedQuantity.toFixed(8)) {
                setFormData(prev => ({ ...prev, quantity: calculatedQuantity.toFixed(8) }));
            }
        } else {
             if (formData.quantity !== '') {
                setFormData(prev => ({...prev, quantity: ''}));
             }
        }
    }, [formData.price, formData.total]);


    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    };
    
     const addTag = (tag: string) => {
        setFormData(prev => {
            const currentTags = prev.strategyTags.split(',').map(t => t.trim()).filter(Boolean);
            if (!currentTags.includes(tag)) {
                return { ...prev, strategyTags: [...currentTags, tag].join(', ') };
            }
            return prev;
        });
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.symbol) newErrors.symbol = "Symbol is required.";
        if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = "Price must be a positive number.";
        if (!formData.total || parseFloat(formData.total) <= 0) newErrors.total = "Total must be a positive number.";
        if (!formData.quantity || parseFloat(formData.quantity) <= 0) newErrors.quantity = "Calculated quantity must be positive.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        setIsSaving(true);
        setTimeout(() => {
            const tags = formData.strategyTags.split(',').map(t => t.trim()).filter(Boolean);
            onSave({
                id: formData.id,
                symbol: formData.symbol,
                side: formData.side as 'Buy' | 'Sell',
                date: new Date(formData.date).getTime(),
                price: parseFloat(formData.price),
                quantity: parseFloat(formData.quantity),
                total: parseFloat(formData.total),
                fees: parseFloat(formData.fees || '0'),
                notes: formData.notes,
                strategyTags: tags.length > 0 ? tags : undefined,
                chartImageUrl: formData.chartImageUrl.trim() || undefined,
            });
            setIsSaving(false);
        }, 500);
    };

    const title = tradeToEdit ? 'Edit Spot Trade' : 'Log New Spot Trade';

    const footer = (
      <div className="flex justify-center">
        <Button type="submit" form="spot-trade-form" disabled={isSaving}>
            {isSaving ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                </>
            ) : 'Save'}
        </Button>
      </div>
    );

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title={title} footer={footer} maxWidth="max-w-2xl">
            <form id="spot-trade-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label>Symbol</Label>
                    <Combobox
                        symbols={symbols}
                        value={formData.symbol}
                        onSelect={(v) => handleChange('symbol', v)}
                        favorites={favorites}
                        setFavorites={setFavorites}
                    />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Side</Label>
                        <Select value={formData.side} onValueChange={(v) => handleChange('side', v)}>
                            <option value="Buy">Buy</option>
                            <option value="Sell">Sell</option>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Date</Label>
                        <Input type="datetime-local" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label>Price</Label>
                        <NumberInput value={formData.price} onValueChange={(v) => handleChange('price', v)} />
                        {errors.price && <p className="text-sm text-red-400">{errors.price}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Total ($)</Label>
                        <NumberInput value={formData.total} onValueChange={(v) => handleChange('total', v)} />
                        {errors.total && <p className="text-sm text-red-400">{errors.total}</p>}
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Quantity (Auto-Calculated)</Label>
                        <Input value={formData.quantity} readOnly className="bg-gray-900 border-gray-700 cursor-default" />
                        {errors.quantity && <p className="text-sm text-red-400">{errors.quantity}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label>Fees ($)</Label>
                        <NumberInput value={formData.fees} onValueChange={(v) => handleChange('fees', v)} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Strategy Tags</Label>
                    <Input value={formData.strategyTags} onChange={(e) => handleChange('strategyTags', e.target.value)} placeholder="e.g., breakout, rsi-divergence"/>
                    {userStrategyTitles.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {userStrategyTitles.map(strat => (
                                <button key={strat} type="button" onClick={() => addTag(strat)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded-md transition-colors">
                                    + {strat}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                 <div className="space-y-2">
                    <Label>Chart Screenshot URL</Label>
                    <Input value={formData.chartImageUrl} onChange={(e) => handleChange('chartImageUrl', e.target.value)} placeholder="https://..."/>
                    {formData.chartImageUrl && (
                        <div className="mt-2 rounded-lg border border-gray-600 overflow-hidden">
                             <img src={formData.chartImageUrl} alt="Chart Preview" className="w-full object-contain max-h-48" onError={(e) => e.currentTarget.style.display = 'none'} onLoad={(e) => e.currentTarget.style.display = 'block'} />
                        </div>
                    )}
                </div>
                <div className="space-y-2">
                    <Label>Notes / Post-Mortem</Label>
                    <RichTextEditor value={formData.notes} onChange={(html) => handleChange('notes', html)} placeholder="Add detailed notes about your trade rationale, execution, and outcome..." />
                </div>
            </form>
        </Dialog>
    );
};