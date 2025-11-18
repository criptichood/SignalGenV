import React from 'react';
import type { SimulationSetup } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/DropdownMenu';
import { MoreHorizontal, Trash2, Play, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from '@/utils/date';

interface SimulationHistoryTableProps {
    simulations: SimulationSetup[];
    onDelete: (id: string) => void;
    onStart: (sim: SimulationSetup) => void;
    isLoading: boolean;
}

const statusVariant: Record<SimulationSetup['status'], 'default' | 'success' | 'warning' | 'danger'> = {
    pending: 'default',
    running: 'warning',
    paused: 'warning',
    completed: 'success',
};

const getOutcomeDisplay = (outcome: SimulationSetup['result']['outcome']) => {
    switch (outcome) {
        case 'TP1 Hit':
        case 'TP2 Hit':
        case 'TP3 Hit':
            return { variant: 'success' as const, text: outcome };
        case 'SL Hit':
            return { variant: 'danger' as const, text: 'Stop Loss' };
        case 'Stopped':
            return { variant: 'danger' as const, text: 'Stopped' };
        case 'Expired':
            return { variant: 'default' as const, text: 'Expired' };
        default:
            return { variant: 'default' as const, text: outcome };
    }
}

export const SimulationHistoryTable = ({ simulations, onDelete, onStart, isLoading }: SimulationHistoryTableProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Simulation History</CardTitle>
                <CardDescription>Manage and launch your saved trade simulations.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-gray-700">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Symbol</TableHead>
                                <TableHead>Direction</TableHead>
                                <TableHead>Mode</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {simulations.length > 0 ? (
                                simulations.map(sim => (
                                    <TableRow key={sim.id}>
                                        <TableCell className="font-bold">{sim.symbol}</TableCell>
                                        <TableCell>
                                            <Badge variant={sim.direction.toUpperCase() === 'LONG' ? 'success' : 'danger'}>{sim.direction}</Badge>
                                        </TableCell>
                                        <TableCell className="capitalize">{sim.mode}</TableCell>
                                        <TableCell>{formatDistanceToNow(sim.timestamp)}</TableCell>
                                        <TableCell>
                                            {sim.status === 'completed' && sim.result ? (
                                                <>
                                                    <Badge variant={getOutcomeDisplay(sim.result.outcome).variant} className="capitalize">
                                                        {getOutcomeDisplay(sim.result.outcome).text}
                                                    </Badge>
                                                    <span className={`ml-2 text-sm font-mono ${
                                                        sim.result.pnl > 0 ? 'text-green-400' : sim.result.pnl < 0 ? 'text-red-400' : 'text-gray-400'
                                                    }`}>
                                                        {sim.result.pnl > 0 ? '+' : ''}{sim.result.pnl.toFixed(2)}%
                                                    </span>
                                                </>
                                            ) : (
                                                <Badge variant={statusVariant[sim.status]} className="capitalize">{sim.status}</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {/* FIX: Use DropdownMenuTrigger and DropdownMenuContent for correct component composition */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button className="bg-transparent hover:bg-gray-700 p-2 w-auto h-auto"><MoreHorizontal/></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => onStart(sim)} disabled={sim.status === 'running' || isLoading}>
                                                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Play className="w-4 h-4 mr-2"/>}
                                                        Start
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => onDelete(sim.id)} className="text-red-400 hover:text-red-300">
                                                        <Trash2 className="w-4 h-4 mr-2"/>
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">No simulations saved yet.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};