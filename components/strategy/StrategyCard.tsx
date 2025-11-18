import React from 'react';
import type { Strategy, UserProfile } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { MoreHorizontal, Edit, Trash2, Share } from 'lucide-react';
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/DropdownMenu';
import { formatDistanceToNow } from '@/utils/date';

interface StrategyCardProps {
    strategy: Strategy;
    userProfile: UserProfile;
    onEdit?: () => void;
    onDelete?: () => void;
    onShare?: () => void;
    onTagClick?: (tag: string) => void;
    readOnly?: boolean;
}

export const StrategyCard = ({ strategy, userProfile, onEdit, onDelete, onShare, onTagClick, readOnly = false }: StrategyCardProps) => {
    return (
        <div className="transition-all duration-200 hover:-translate-y-1">
            <Card className="flex flex-col h-full">
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            {!readOnly && (
                                 <img
                                    src={userProfile.avatarUrl || `https://api.dicebear.com/8.x/pixel-art/svg?seed=${userProfile.username}`}
                                    alt={userProfile.name}
                                    className="w-10 h-10 rounded-full border-2 border-gray-700 object-cover"
                                />
                            )}
                            <div>
                                <CardTitle className="text-lg">{strategy.title}</CardTitle>
                                {!readOnly && (
                                    <CardDescription>
                                        by {userProfile.name} &middot; {formatDistanceToNow(strategy.createdAt)}
                                    </CardDescription>
                                )}
                            </div>
                        </div>
                        {!readOnly && (
                             /* FIX: Use DropdownMenuTrigger and DropdownMenuContent for correct component composition */
                             <DropdownMenu>
                                 <DropdownMenuTrigger asChild>
                                    <button className="p-2 -mr-2 -mt-2 rounded-md hover:bg-gray-700">
                                        <MoreHorizontal className="w-5 h-5"/>
                                    </button>
                                 </DropdownMenuTrigger>
                                 <DropdownMenuContent>
                                     <DropdownMenuItem onClick={onEdit}>
                                         <Edit className="w-4 h-4 mr-2"/> Edit
                                     </DropdownMenuItem>
                                     <DropdownMenuItem onClick={onShare}>
                                         <Share className="w-4 h-4 mr-2"/> Share
                                     </DropdownMenuItem>
                                     <DropdownMenuItem onClick={onDelete} className="text-red-400 hover:text-red-300">
                                         <Trash2 className="w-4 h-4 mr-2"/> Delete
                                     </DropdownMenuItem>
                                 </DropdownMenuContent>
                             </DropdownMenu>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="flex-grow">
                    <div className="text-sm max-h-40 max-w-none overflow-y-auto pr-2 text-gray-300 [&_ul]:list-disc [&_ul]:list-inside [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:list-inside [&_ol]:pl-4">
                        <div dangerouslySetInnerHTML={{ __html: strategy.description }} />
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="flex flex-wrap gap-2">
                        {strategy.tags.map((tag, index) => (
                             <button 
                                key={index} 
                                onClick={() => onTagClick?.(tag)}
                                disabled={!onTagClick}
                                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:cursor-default disabled:hover:bg-gray-700"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};
