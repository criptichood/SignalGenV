import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { BotIcon } from '@/components/icons/BotIcon';

export const EmptyState = () => (
  <Card className="border-dashed border-gray-600">
     <CardContent className="flex flex-col items-center justify-center h-[284px] text-center">
        <BotIcon className="w-12 h-12 text-gray-500 mb-4" />
        <h3 className="text-xl font-bold text-gray-300">AI Trade Signal</h3>
        <p className="text-gray-500 mt-1">Your generated signal will appear here.</p>
    </CardContent>
  </Card>
);