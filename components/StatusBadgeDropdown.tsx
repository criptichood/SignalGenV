import React from 'react';
import type { SavedSignal } from '@/types';
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/DropdownMenu';
import { Badge } from '@/components/ui/Badge';
import { CircleDashed, TrendingUp, TrendingDown, StopCircle } from 'lucide-react';


interface StatusBadgeDropdownProps {
  status: SavedSignal['status'];
  onUpdateStatus: (status: SavedSignal['status']) => void;
  hitTpsCount?: number;
}

export const StatusBadgeDropdown = ({ status, onUpdateStatus, hitTpsCount }: StatusBadgeDropdownProps) => {
    const statusConfig: Record<SavedSignal['status'], { variant: 'default' | 'success' | 'danger' | 'warning', icon: React.ReactNode }> = {
        Pending: { variant: 'default', icon: <CircleDashed className="w-3 h-3"/> },
        Win: { variant: 'success', icon: <TrendingUp className="w-3 h-3"/> },
        Loss: { variant: 'danger', icon: <TrendingDown className="w-3 h-3"/> },
        Closed: { variant: 'warning', icon: <StopCircle className="w-3 h-3"/> },
    };

    const currentConfig = statusConfig[status];
    const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

    const displayText = status === 'Win' && hitTpsCount && hitTpsCount > 0
        ? `Win (TP ${hitTpsCount})`
        : status;

    return (
        <div onClick={stopPropagation}>
            {/* FIX: Use DropdownMenuTrigger and DropdownMenuContent for correct component composition */}
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <Badge variant={currentConfig.variant} className="capitalize cursor-pointer transition-transform hover:scale-105">
                        {currentConfig.icon}
                        <span>{displayText}</span>
                    </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onUpdateStatus('Pending')}>
                        <CircleDashed className="w-4 h-4 mr-2 text-gray-400"/> Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdateStatus('Win')}>
                        <TrendingUp className="w-4 h-4 mr-2 text-green-400"/> Win
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdateStatus('Loss')}>
                        <TrendingDown className="w-4 h-4 mr-2 text-red-400"/> Loss
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onUpdateStatus('Closed')}>
                        <StopCircle className="w-4 h-4 mr-2 text-yellow-400"/> Closed
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};