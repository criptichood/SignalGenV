import React from 'react';
import { useDashboardStore } from '@/store/dashboardStore';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';

export const AddWidgetDropdown = () => {
    const { availableWidgets, activeWidgets, addWidget } = useDashboardStore();

    const inactiveWidgets = availableWidgets.filter(w => !activeWidgets.includes(w.id));

    if (inactiveWidgets.length === 0) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2"/>
                    Add Widget
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {inactiveWidgets.map(widget => (
                    <DropdownMenuItem key={widget.id} onClick={() => addWidget(widget.id)}>
                        {widget.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};