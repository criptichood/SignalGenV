
import React, { useState, useMemo, useEffect } from 'react';
import type { SpotTrade } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/DropdownMenu';
import { MoreHorizontal, Trash2, Pencil, Search, FileText } from 'lucide-react';

interface SpotTradeTableProps {
  trades: SpotTrade[];
  onEdit: (trade: SpotTrade) => void;
  onDelete: (id: string) => void;
  onFilteredDataChange: (data: SpotTrade[]) => void;
}

const formatDate = (timestamp: number) => new Date(timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const formatCurrency = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 6 });

export const SpotTradeTable = ({ trades, onEdit, onDelete, onFilteredDataChange }: SpotTradeTableProps) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sideFilter, setSideFilter] = useState<'all' | 'Buy' | 'Sell'>('all');

    const filteredData = useMemo(() => {
        return trades
            .filter(trade => {
                if (sideFilter !== 'all' && trade.side !== sideFilter) return false;
                if (searchTerm && !trade.symbol.toLowerCase().includes(searchTerm.toLowerCase())) return false;
                return true;
            })
            .sort((a, b) => b.date - a.date);
    }, [trades, searchTerm, sideFilter]);
    
    useEffect(() => {
        onFilteredDataChange(filteredData);
    }, [filteredData, onFilteredDataChange]);

    if (trades.length === 0) {
      return (
          <Card className="border-dashed border-gray-600">
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-6">
                  <FileText className="w-16 h-16 text-gray-500 mb-4" />
                  <h3 className="text-xl font-bold text-gray-300">Your Spot Log is Empty</h3>
                  <p className="text-gray-500 mt-1">Click "Add New Trade" to start logging.</p>
              </CardContent>
          </Card>
      );
    }

    return (
        <Card>
            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row items-center gap-3 p-4 bg-gray-900/50 rounded-t-md border border-gray-700 border-b-0">
                    <div className="relative w-full md:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input placeholder="Filter by symbol..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                    </div>
                    <div className="flex w-full md:w-auto items-center">
                        <Select value={sideFilter} onValueChange={(v) => setSideFilter(v as any)}>
                            <option value="all">All Sides</option>
                            <option value="Buy">Buy</option>
                            <option value="Sell">Sell</option>
                        </Select>
                    </div>
                </div>
                <div className="overflow-x-auto rounded-b-md border border-gray-700">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-gray-800">
                                <TableHead>Date</TableHead>
                                <TableHead>Symbol</TableHead>
                                <TableHead>Side</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.map((trade) => (
                                <TableRow key={trade.id}>
                                    <TableCell className="whitespace-nowrap">{formatDate(trade.date)}</TableCell>
                                    <TableCell className="font-medium text-white">{trade.symbol}</TableCell>
                                    <TableCell><Badge variant={trade.side === 'Buy' ? 'success' : 'danger'}>{trade.side}</Badge></TableCell>
                                    <TableCell className="text-right font-mono text-gray-300">{formatCurrency(trade.price)}</TableCell>
                                    <TableCell className="text-right font-mono text-gray-300">{trade.quantity.toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-mono text-cyan-400">{formatCurrency(trade.total)}</TableCell>
                                    <TableCell className="text-right">
                                        {/* FIX: Use DropdownMenuTrigger and DropdownMenuContent for correct component composition */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="p-2 rounded-md hover:bg-gray-700"><MoreHorizontal className="w-4 h-4" /></button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => onEdit(trade)}>
                                                    <Pencil className="w-4 h-4 mr-2" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => onDelete(trade.id)} className="text-red-400 hover:text-red-300">
                                                    <Trash2 className="w-4 h-4"/> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};
