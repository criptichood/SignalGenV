import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { LivePosition } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowUp, ArrowDown, Loader2, Pencil, Save, X } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { NumberInput } from '@/components/ui/NumberInput';
import { Label } from '@/components/ui/Label';

interface LivePositionCardProps {
  position: LivePosition;
  livePrice: number | null;
  onClose: (position: LivePosition) => void;
  onModify: (positionId: string, newTp?: number, newSl?: number) => Promise<void>;
}

const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return 'N/A';
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 6 });
};

const LevelDisplay = ({ label, value, entryPrice }: { label: string; value?: number; entryPrice: number; }) => {
    const distance = value && entryPrice ? Math.abs(value - entryPrice) / entryPrice * 100 : 0;
    return (
        <div>
            <p className="text-xs text-gray-400">{label} {value && `(${distance.toFixed(2)}%)`}</p>
            <p className="text-base font-mono font-semibold">{formatCurrency(value)}</p>
        </div>
    );
};


export const LivePositionCard = ({ position, livePrice, onClose, onModify }: LivePositionCardProps) => {
    const [isClosing, setIsClosing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editedTp, setEditedTp] = useState(position.takeProfit?.toString() ?? '');
    const [editedSl, setEditedSl] = useState(position.stopLoss?.toString() ?? '');
    const [pnlFlash, setPnlFlash] = useState('');
    const prevPnlRef = useRef<number | null>(null);

    useEffect(() => {
        setEditedTp(position.takeProfit?.toString() ?? '');
        setEditedSl(position.stopLoss?.toString() ?? '');
    }, [position.takeProfit, position.stopLoss]);

    const { pnl, pnlPercentage } = useMemo(() => {
        if (livePrice === null) return { pnl: 0, pnlPercentage: 0 };

        const entryValue = position.entryPrice * position.quantity;
        const currentValue = livePrice * position.quantity;

        const pnl = position.side === 'Long' ? currentValue - entryValue : entryValue - currentValue;
        const pnlPercentage = position.margin > 0 ? (pnl / position.margin) * 100 : 0;
        
        return { pnl, pnlPercentage };
    }, [livePrice, position]);

    useEffect(() => {
        if (prevPnlRef.current !== null && pnl !== prevPnlRef.current) {
            if (pnl > prevPnlRef.current) {
                setPnlFlash('animate-flash-green');
            } else if (pnl < prevPnlRef.current) {
                setPnlFlash('animate-flash-red');
            }
            const timer = setTimeout(() => setPnlFlash(''), 700);
            return () => clearTimeout(timer);
        }
    }, [pnl]);

    useEffect(() => {
        prevPnlRef.current = pnl;
    }, [pnl]);

    const handleClose = async () => {
        setIsClosing(true);
        try {
            await onClose(position);
        } catch (error) {
            console.error("Failed to close position:", error);
            setIsClosing(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        const newTp = editedTp ? parseFloat(editedTp) : undefined;
        const newSl = editedSl ? parseFloat(editedSl) : undefined;
        try {
            await onModify(position.id, newTp, newSl);
            setIsEditing(false);
        } finally {
            setIsSaving(false);
        }
    };
    
    const isLong = position.side === 'Long';
    const pnlColor = pnl >= 0 ? 'text-green-400' : 'text-red-400';
    const positionValue = position.entryPrice * position.quantity;

    return (
        <Card className="bg-gray-800/60 backdrop-blur-sm border border-cyan-500/30">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-3">
                    <CardTitle className="text-xl">{position.symbol}</CardTitle>
                    <Badge variant={isLong ? 'success' : 'danger'}>
                        {isLong ? <ArrowUp className="w-4 h-4 mr-1" /> : <ArrowDown className="w-4 h-4 mr-1" />}
                        {position.side}
                    </Badge>
                </div>
                <Badge variant="default" className="bg-cyan-500/20 text-cyan-300">LIVE POSITION</Badge>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6">
                <div>
                    <p className="text-xs text-gray-400">Entry Price</p>
                    <p className="text-base font-mono font-semibold">{formatCurrency(position.entryPrice)}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-400">Position Value</p>
                    <p className="text-base font-mono font-semibold">{formatCurrency(positionValue)}</p>
                </div>
                 <div>
                    <p className="text-xs text-gray-400">Quantity</p>
                    <p className="text-base font-mono font-semibold">{position.quantity.toFixed(4)}</p>
                </div>

                {isEditing ? (
                    <>
                        <div className="space-y-1">
                             <Label htmlFor="edit-tp" className="text-xs text-green-400">Take Profit</Label>
                             <NumberInput id="edit-tp" value={editedTp} onValueChange={setEditedTp} className="text-sm" />
                        </div>
                        <div className="space-y-1">
                             <Label htmlFor="edit-sl" className="text-xs text-red-400">Stop Loss</Label>
                             <NumberInput id="edit-sl" value={editedSl} onValueChange={setEditedSl} className="text-sm" />
                        </div>
                    </>
                ) : (
                    <>
                        <LevelDisplay label="Take Profit" value={position.takeProfit} entryPrice={position.entryPrice} />
                        <LevelDisplay label="Stop Loss" value={position.stopLoss} entryPrice={position.entryPrice} />
                    </>
                )}
                 <div>
                    <p className="text-xs text-gray-400">Margin</p>
                    <p className="text-base font-mono font-semibold">{formatCurrency(position.margin)} ({position.leverage}x)</p>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                <div className={`flex-1 bg-gray-900/70 p-3 rounded-lg text-center transition-colors duration-300 ${pnlColor} ${pnlFlash}`}>
                     <p className="text-xs text-gray-400 mb-1">Unrealized P/L</p>
                     <p className="text-2xl font-bold font-mono">
                        {pnl.toFixed(2)} ({pnlPercentage.toFixed(2)}%)
                     </p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    {isEditing ? (
                        <>
                            <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-green-600 hover:bg-green-500">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                            </Button>
                             <Button onClick={() => setIsEditing(false)} disabled={isSaving} className="flex-1 bg-gray-600 hover:bg-gray-500">
                                <X className="w-4 h-4"/>
                            </Button>
                        </>
                    ) : (
                         <>
                            <Button onClick={() => setIsEditing(true)} disabled={isClosing} className="bg-transparent border border-purple-500 text-purple-400 hover:bg-purple-500/10 font-semibold p-2.5">
                                <Pencil className="w-4 h-4"/>
                            </Button>
                            <Button onClick={handleClose} disabled={isClosing || livePrice === null} className="w-full bg-red-600 hover:bg-red-500 text-white flex-1">
                                {isClosing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Closing...</> : 'Close Position'}
                            </Button>
                         </>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
};