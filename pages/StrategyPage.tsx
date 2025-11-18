import React, { useState, useMemo } from 'react';
import type { Strategy, UserProfile } from '@/types';
import { useSocialStore } from '@/store/socialStore';
import { Layers, Search, Plus } from 'lucide-react';
import { StrategyCard } from '@/components/strategy/StrategyCard';
import { StrategyModal } from '@/components/strategy/StrategyModal';
import { ShareStrategyDialog } from '@/components/strategy/ShareStrategyDialog';
import { Toast } from '@/components/ui/Toast';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TagFilter } from '@/components/strategy/TagFilter';

export default function StrategyPage() {
    const { users, strategies, setStrategies, handleCreateStrategy } = useSocialStore();
    const userProfile = useMemo(() => users.find(u => u.username === 'CryptoTrader123')!, [users]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [strategyToEdit, setStrategyToEdit] = useState<Strategy | null>(null);
    const [strategyToShare, setStrategyToShare] = useState<Strategy | null>(null);
    const [toast, setToast] = useState<{ message: string; variant: 'success' | 'warning' | 'error' } | null>(null);
    
    // Filtering and Sorting State
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    
    const handleOpenCreateModal = () => {
        setStrategyToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (strategy: Strategy) => {
        setStrategyToEdit(strategy);
        setIsModalOpen(true);
    };

    const handleSaveStrategy = (strategyData: Omit<Strategy, 'id' | 'createdAt' | 'authorUsername'> & { id?: string }) => {
        if (strategyData.id) {
            setStrategies(prev => prev.map(s => s.id === strategyData.id ? { ...s, ...strategyData } as Strategy : s));
            setToast({ message: 'Strategy updated!', variant: 'success' });
        } else {
            handleCreateStrategy(strategyData);
            setToast({ message: 'Strategy created!', variant: 'success' });
        }
        setIsModalOpen(false);
    };

    const handleDeleteStrategy = (id: string) => {
        setStrategies(prev => prev.filter(s => s.id !== id));
        setToast({ message: 'Strategy deleted.', variant: 'success' });
    };

    const handleShareStrategy = (username: string) => {
        if (!strategyToShare) return;
        
        if (userProfile.following.includes(username)) {
            console.log(`Sharing strategy "${strategyToShare.title}" with ${username}`);
            setToast({ message: `Strategy shared with ${username}!`, variant: 'success' });
        } else {
            setToast({ message: `You are not following ${username}.`, variant: 'error' });
        }
        setStrategyToShare(null);
    };

    const handleToggleTag = (tag: string) => {
        setSelectedTags(prev => 
            prev.includes(tag) 
            ? prev.filter(t => t !== tag)
            : [...prev, tag]
        );
    };

    const handleClearTags = () => {
        setSelectedTags([]);
    }
    
    const handleCardTagClick = (tag: string) => {
        if (!selectedTags.includes(tag)) {
            setSelectedTags(prev => [...prev, tag]);
        }
    }

    const allTags = useMemo(() => {
        const tagsSet = new Set<string>();
        strategies.forEach(s => s.tags.forEach(t => tagsSet.add(t)));
        return Array.from(tagsSet).sort();
    }, [strategies]);
    
    const userStrategies = useMemo(() => strategies.filter(s => s.authorUsername === userProfile.username), [strategies, userProfile.username]);

    const filteredAndSortedStrategies = useMemo(() => {
        return userStrategies
            .filter(strategy => {
                const searchLower = searchTerm.toLowerCase();
                const titleMatch = strategy.title.toLowerCase().includes(searchLower);
                const descriptionMatch = strategy.description.toLowerCase().includes(searchLower);
                const tagMatch = selectedTags.length === 0 || selectedTags.every(tag => strategy.tags.includes(tag));
                return (titleMatch || descriptionMatch) && tagMatch;
            })
            .sort((a, b) => {
                if (sortOrder === 'newest') {
                    return b.createdAt - a.createdAt;
                }
                return a.createdAt - b.createdAt;
            });
    }, [userStrategies, sortOrder, searchTerm, selectedTags]);

    return (
        <>
            {toast && <Toast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}
            <div className="space-y-8">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Strategy Hub</h1>
                        <p className="text-gray-400 mt-1">Your personal trading playbook.</p>
                    </div>
                     <Button onClick={handleOpenCreateModal}>
                        <Plus className="w-5 h-5 mr-2" />
                        Create Strategy
                    </Button>
                </div>
                
                <div className="space-y-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                            icon={<Search className="w-4 h-4"/>}
                            placeholder="Search your strategies..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                         <Select onValueChange={(value) => setSortOrder(value as any)} value={sortOrder}>
                            <option value="newest">Sort by Newest</option>
                            <option value="oldest">Sort by Oldest</option>
                        </Select>
                    </div>
                    {allTags.length > 0 && (
                        <TagFilter allTags={allTags} selectedTags={selectedTags} onTagClick={handleToggleTag} onClear={handleClearTags} />
                    )}
                </div>

                {filteredAndSortedStrategies.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredAndSortedStrategies.map(strategy => (
                            <StrategyCard
                                key={strategy.id}
                                strategy={strategy}
                                userProfile={userProfile}
                                onEdit={() => handleOpenEditModal(strategy)}
                                onDelete={() => handleDeleteStrategy(strategy.id)}
                                onShare={() => setStrategyToShare(strategy)}
                                onTagClick={handleCardTagClick}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
                        <Layers className="mx-auto h-12 w-12 text-gray-500" />
                        <h3 className="mt-2 text-lg font-medium text-white">No strategies found</h3>
                        <p className="mt-1 text-sm text-gray-400">Try adjusting your filters or create a new strategy.</p>
                    </div>
                )}
            </div>

            <StrategyModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveStrategy}
                strategyToEdit={strategyToEdit}
            />

            <ShareStrategyDialog
                isOpen={!!strategyToShare}
                onClose={() => setStrategyToShare(null)}
                onShare={handleShareStrategy}
            />
        </>
    );
}