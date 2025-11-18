import React, { useState, useMemo, useEffect } from 'react';
import type { SavedSignal } from '@/types';
import { formatDistanceToNow, parseDurationToMillis } from '@/utils/date';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/DropdownMenu';
import { AlertDialog } from '@/components/ui/AlertDialog';
import { StatusBadgeDropdown } from '@/components/StatusBadgeDropdown';
import { MoreHorizontal, Trash2, TrendingUp, ChevronsUpDown, ArrowRight, ArrowUp, ArrowDown, Search, TestTube2, Eye } from 'lucide-react';

interface HistoryTableProps {
  data: SavedSignal[];
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: SavedSignal['status']) => void;
  onViewDetails: (signal: SavedSignal) => void;
  isDashboardView?: boolean;
  onViewAll?: () => void;
  onSimulate?: (signal: SavedSignal) => void;
  onFilteredDataChange?: (data: SavedSignal[]) => void;
  onRestore?: (signal: SavedSignal) => void;
}

type SortKey = 'symbol' | 'timestamp' | 'type';
type SortDirection = 'asc' | 'desc';

export const HistoryTable = ({
  data,
  onDelete,
  onUpdateStatus,
  onViewDetails,
  isDashboardView = false,
  onViewAll,
  onSimulate,
  onFilteredDataChange,
  onRestore,
}: HistoryTableProps) => {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [signalToDelete, setSignalToDelete] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>({ key: 'timestamp', direction: 'desc' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SavedSignal['status']>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | SavedSignal['type']>('all');
  
  const itemsPerPage = isDashboardView ? 5 : 10;

  const filteredData = useMemo(() => {
    return data
      .filter(signal => {
        if (statusFilter !== 'all' && signal.status !== statusFilter) return false;
        if (typeFilter !== 'all' && (signal.type || 'Swing') !== typeFilter) return false;
        if (searchTerm && !signal.symbol.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
      });
  }, [data, searchTerm, statusFilter, typeFilter]);
  
  useEffect(() => {
      onFilteredDataChange?.(filteredData);
  }, [filteredData, onFilteredDataChange]);

  const sortedData = useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const SortableHeader = ({ sortKey, children, className }: { sortKey: SortKey; children: React.ReactNode; className?: string }) => (
    <TableHead className={`cursor-pointer hover:bg-gray-700/50 ${className}`} onClick={() => requestSort(sortKey)}>
      <div className="flex items-center gap-2">
        {children}
        {sortConfig?.key === sortKey ? (
          sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        ) : (
          <ChevronsUpDown className="h-3 w-3 opacity-30" />
        )}
      </div>
    </TableHead>
  );

  const handleDeleteClick = (id: string) => {
      setSignalToDelete(id);
      setIsAlertOpen(true);
  };
  
  const confirmDelete = () => {
    if (signalToDelete) {
        onDelete(signalToDelete);
    }
    setIsAlertOpen(false);
    setSignalToDelete(null);
  };


  if (data.length === 0 && !isDashboardView) {
      return (
          <Card className="border-dashed border-gray-600">
              <CardContent className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-6">
                  <TrendingUp className="w-16 h-16 text-gray-500 mb-4" />
                  <h3 className="text-xl font-bold text-gray-300">No Signal History</h3>
                  <p className="text-gray-500 mt-1">Generate your first signal to see it here.</p>
              </CardContent>
          </Card>
      );
  }
  
  const getTypeBadge = (type: SavedSignal['type']) => {
      switch (type) {
          case 'Scalp': return <Badge variant="default">Scalp</Badge>;
          case 'Swing': return <Badge variant="warning">Swing</Badge>;
          case 'Manual': return <Badge className="bg-purple-500/20 text-purple-300">Manual</Badge>;
          default: return <Badge variant="warning">Swing</Badge>;
      }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap justify-between items-start gap-2">
            <div>
                <CardTitle>AI Signals History</CardTitle>
                <CardDescription>
                    {isDashboardView ? 'A quick look at your most recent signals.' : 'Review and manage all generated signals.'}
                </CardDescription>
            </div>
            {isDashboardView && onViewAll && (
                <Button onClick={onViewAll} className="bg-transparent hover:bg-gray-700 border border-gray-600 text-white font-semibold text-sm h-9">
                    View All <ArrowRight className="w-4 h-4 ml-2"/>
                </Button>
            )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {!isDashboardView && (
            <div className="flex flex-col md:flex-row items-center gap-3 p-4 bg-gray-900/50 rounded-t-md border border-gray-700 border-b-0">
                <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Filter by symbol..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9" />
                </div>
                <div className="flex w-full md:w-auto gap-3">
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                        <option value="all">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Win">Win</option>
                        <option value="Loss">Loss</option>
                        <option value="Closed">Closed</option>
                    </Select>
                     <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                        <option value="all">All Types</option>
                        <option value="Swing">Swing</option>
                        <option value="Scalp">Scalp</option>
                        <option value="Manual">Manual</option>
                    </Select>
                </div>
            </div>
        )}
         <div className="overflow-x-auto rounded-b-md border border-gray-700">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-gray-800">
                        <SortableHeader sortKey="symbol">Symbol</SortableHeader>
                        <SortableHeader sortKey="timestamp">Generated</SortableHeader>
                        <SortableHeader sortKey="type">Type</SortableHeader>
                        <TableHead>Direction</TableHead>
                        <TableHead>Entry</TableHead>
                        <TableHead>TP</TableHead>
                        <TableHead>SL</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedData.map((signal) => {
                        const isExpired = parseDurationToMillis(signal.tradeDuration) !== null && (signal.timestamp + parseDurationToMillis(signal.tradeDuration)!) < Date.now();
                        
                        return (
                            <TableRow key={signal.id} onClick={() => onViewDetails(signal)} className="cursor-pointer">
                                <TableCell className="font-medium text-white">{signal.symbol}</TableCell>
                                <TableCell>{formatDistanceToNow(signal.timestamp)}</TableCell>
                                <TableCell>{getTypeBadge(signal.type)}</TableCell>
                                <TableCell>
                                    <Badge variant={signal.direction === 'LONG' ? 'success' : 'danger'}>{signal.direction}</Badge>
                                </TableCell>
                                <TableCell className="font-mono">{signal.entryRange[0].toFixed(2)}</TableCell>
                                <TableCell className="font-mono">{signal.takeProfit[0].toFixed(2)}</TableCell>
                                <TableCell className="font-mono">{signal.stopLoss.toFixed(2)}</TableCell>
                                <TableCell>
                                    <StatusBadgeDropdown 
                                        status={signal.status} 
                                        onUpdateStatus={(status) => onUpdateStatus(signal.id, status)}
                                        hitTpsCount={signal.hitTps?.length}
                                    />
                                </TableCell>
                                <TableCell>
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button onClick={(e) => e.stopPropagation()} className="p-2 rounded-md hover:bg-gray-700">
                                                <MoreHorizontal className="w-4 h-4"/>
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            {onSimulate && (
                                                <DropdownMenuItem onClick={() => onSimulate(signal)}>
                                                    <TestTube2 className="w-4 h-4 mr-2"/> Simulate
                                                </DropdownMenuItem>
                                            )}
                                            {onRestore && (
                                                <DropdownMenuItem onClick={() => onRestore(signal)} disabled={isExpired && signal.type !== 'Manual'}>
                                                    <Eye className="w-4 h-4 mr-2"/> Restore View
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem onClick={() => handleDeleteClick(signal.id)} className="text-red-400 hover:text-red-300">
                                                <Trash2 className="w-4 h-4 mr-2"/> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                     </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {paginatedData.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={9} className="h-24 text-center">No signals found for the current filters.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
        
        {!isDashboardView && totalPages > 1 && (
            <div className="flex items-center justify-between p-4">
                <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="text-sm h-8 px-3">Previous</Button>
                <span className="text-sm text-gray-400">Page {currentPage} of {totalPages}</span>
                <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="text-sm h-8 px-3">Next</Button>
            </div>
        )}
      </CardContent>
      <AlertDialog
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Signal?"
        description="Are you sure you want to delete this signal? This action cannot be undone."
      />
    </Card>
  );
};