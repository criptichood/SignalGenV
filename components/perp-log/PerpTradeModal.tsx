

import React, { useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { PerpTrade } from '@/types';
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

interface PerpTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (trade: Omit<PerpTrade, 'id'> & { id?: string }) => void;
  tradeToEdit: PerpTrade | null;
  symbols: string[];
}

const getInitialState = (trade: PerpTrade | null) => ({
    id: trade?.id || undefined,
    symbol: trade?.symbol || 'BTCUSDT',
    side: trade?.side || 'Long',
    status: trade?.status || 'Open',
    entryDate: trade ? new Date(trade.entryDate).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
    exitDate: trade?.exitDate ? new Date(trade.exitDate).toISOString().slice(0, 16) : '',
    entryPrice: trade?.entryPrice?.toString() || '',
    exitPrice: trade?.exitPrice?.toString() || '',
    quantity: trade?.quantity?.toString() || '',
    margin: trade?.margin?.toString() || '',
    leverage: trade?.leverage?.toString() || '20',
    fees: trade?.fees?.toString() || '',
    notes: trade?.notes || '',
    strategyTags: trade?.strategyTags?.join(', ') || '',
    chartImageUrl: trade?.chartImageUrl || '',
});

export const PerpTradeModal = ({ isOpen, onClose, onSave, tradeToEdit, symbols }: PerpTradeModalProps) => {
    const [formData, setFormData] = useState(getInitialState(tradeToEdit));
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [favorites, setFavorites] = useLocalStorage<string[]>('perpFavoriteSymbols', ['BTCUSDT', 'ETHUSDT']);
    
    const { strategies } = useSocialStore();
    const userStrategyTitles = useMemo(() => strategies.filter(s => s.authorUsername === 'CryptoTrader123').map(s => s.title), [strategies]);

    useEffect(() => {
        setFormData(getInitialState(tradeToEdit));
        setErrors({});
    }, [tradeToEdit, isOpen]);

    useEffect(() => {
        const price = parseFloat(formData.entryPrice);
        const margin = parseFloat(formData.margin);
        const lev = parseInt(formData.leverage, 10);

        if (price > 0 && margin > 0 && lev > 0) {
            const calculatedQuantity = (margin * lev) / price;
            if (formData.quantity !== calculatedQuantity.toFixed(8)) {
                setFormData(prev => ({ ...prev, quantity: calculatedQuantity.toFixed(8) }));
            }
        } else {
            if (formData.quantity !== '') {
               setFormData(prev => ({...prev, quantity: ''}));
            }
        }
    }, [formData.entryPrice, formData.margin, formData.leverage]);


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
        if (!formData.entryPrice || parseFloat(formData.entryPrice) <= 0) newErrors.entryPrice = "Entry price is required.";
        if (!formData.quantity || parseFloat(formData.quantity) <= 0) newErrors.quantity = "Calculated quantity must be positive.";
        if (!formData.margin || parseFloat(formData.margin) <= 0) newErrors.margin = "Margin is required.";
        if (!formData.leverage || parseInt(formData.leverage, 10) <= 0) newErrors.leverage = "Leverage is required.";
        if (formData.status === 'Closed' && (!formData.exitPrice || parseFloat(formData.exitPrice) <= 0)) {
            newErrors.exitPrice = "Exit price is required for closed trades.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        setIsSaving(true);
        setTimeout(() => {
            const isClosed = formData.status === 'Closed';
            const tags = formData.strategyTags.split(',').map(t => t.trim()).filter(Boolean);
            onSave({
                id: formData.id,
                symbol: formData.symbol,
                side: formData.side as 'Long' | 'Short',
                status: formData.status as 'Open' | 'Closed',
                entryDate: new Date(formData.entryDate).getTime(),
                exitDate: isClosed && formData.exitDate ? new Date(formData.exitDate).getTime() : undefined,
                entryPrice: parseFloat(formData.entryPrice),
                exitPrice: isClosed ? parseFloat(formData.exitPrice) : undefined,
                quantity: parseFloat(formData.quantity),
                margin: parseFloat(formData.margin),
                leverage: parseInt(formData.leverage, 10),
                fees: parseFloat(formData.fees || '0'),
                notes: formData.notes,
                strategyTags: tags.length > 0 ? tags : undefined,
                chartImageUrl: formData.chartImageUrl.trim() || undefined,
            });
            setIsSaving(false);
        }, 500);
    };
    
    const title = tradeToEdit ? 'Edit Perpetual Trade' : 'Log New Perpetual Trade';
    
    const footer = (
        <div className="flex justify-center">
            <Button type="submit" form="perp-trade-form" disabled={isSaving}>
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
            <form id="perp-trade-form" onSubmit={handleSubmit} className="space-y-6">
                
                <div>
                  <h3 className="text-sm font-semibold text-cyan-400 mb-3 border-b border-gray-700 pb-2">Trade Setup</h3>
                  <div className="space-y-4">
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
                                <option value="Long">Long</option>
                                <option value="Short">Short</option>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Status</Label>
                            <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                                <option value="Open">Open</option>
                                <option value="Closed">Closed</option>
                            </Select>
                        </div>
                    </div>
                  </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-cyan-400 mb-3 border-b border-gray-700 pb-2">Execution Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label>Entry Price</Label>
                            <NumberInput value={formData.entryPrice} onValueChange={(v) => handleChange('entryPrice', v)} />
                            {errors.entryPrice && <p className="text-sm text-red-400">{errors.entryPrice}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label>Margin ($)</Label>
                            <NumberInput value={formData.margin} onValueChange={(v) => handleChange('margin', v)} />
                            {errors.margin && <p className="text-sm text-red-400">{errors.margin}</p>}
                        </div>
                         <div className="space-y-2">
                            <Label>Leverage (x)</Label>
                            <NumberInput value={formData.leverage} onValueChange={(v) => handleChange('leverage', v)} />
                            {errors.leverage && <p className="text-sm text-red-400">{errors.leverage}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Quantity (Auto-Calculated)</Label>
                            <Input value={formData.quantity} readOnly className="bg-gray-900 border-gray-700 cursor-default" />
                            {errors.quantity && <p className="text-sm text-red-400">{errors.quantity}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Entry Date</Label>
                            <Input type="datetime-local" value={formData.entryDate} onChange={(e) => handleChange('entryDate', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Fees ($)</Label>
                            <NumberInput value={formData.fees} onValueChange={(v) => handleChange('fees', v)} />
                        </div>
                    </div>
                </div>

                {formData.status === 'Closed' && (
                    <div>
                        <h3 className="text-sm font-semibold text-cyan-400 mb-3 border-b border-gray-700 pb-2">Closing Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Exit Price</Label>
                                <NumberInput value={formData.exitPrice} onValueChange={(v) => handleChange('exitPrice', v)} />
                                {errors.exitPrice && <p className="text-sm text-red-400">{errors.exitPrice}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label>Exit Date</Label>
                                <Input type="datetime-local" value={formData.exitDate} onChange={(e) => handleChange('exitDate', e.target.value)} />
                            </div>
                        </div>
                    </div>
                )}
                
                <div>
                    <h3 className="text-sm font-semibold text-cyan-400 mb-3 border-b border-gray-700 pb-2">Journal</h3>
                    <div className="space-y-4">
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
                    </div>
                </div>
            </form>
        </Dialog>
    );
};