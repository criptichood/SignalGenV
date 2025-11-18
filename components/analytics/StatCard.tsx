
import React from 'react';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    description?: string;
    valueClassName?: string;
}

export const StatCard = ({ title, value, icon, description, valueClassName }: StatCardProps) => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700/80 shadow-lg">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-400">{title}</p>
                <div className="text-gray-500">{icon}</div>
            </div>
            <div className="mt-2">
                <h3 className={`text-2xl lg:text-3xl font-bold tracking-tight ${valueClassName || 'text-white'}`}>{value}</h3>
                {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
            </div>
        </div>
    );
};
