import React, { useState, useMemo } from 'react';
import type { UserProfile } from '../../types';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { SearchIcon } from '../icons/SearchIcon';
import { SendIcon } from '../icons/SendIcon';
import { Button } from '../ui/Button';
import { useSocialStore } from '../../store/socialStore';

interface SharePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectUser: (username: string) => void;
}

const UserItem = ({ user, onSend }: { user: UserProfile, onSend: () => void }) => (
    <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
            <img
                src={user.avatarUrl || `https://api.dicebear.com/8.x/pixel-art/svg?seed=${user.username}`}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover"
            />
            <div>
                <p className="font-bold text-white">{user.name}</p>
                <p className="text-sm text-gray-400">@{user.username}</p>
            </div>
        </div>
        <Button onClick={onSend} className="h-8 px-3 text-sm">
            <SendIcon className="w-4 h-4 mr-2" />
            Send
        </Button>
    </div>
);

export const SharePostModal = ({ isOpen, onClose, onSelectUser }: SharePostModalProps) => {
    const { users } = useSocialStore();
    const currentUser = useMemo(() => users.find(u => u.username === 'CryptoTrader123')!, [users]);
    const [searchTerm, setSearchTerm] = useState('');

    const contactList = useMemo(() => {
        if (!currentUser) return [];
        const contactUsernames = new Set([...currentUser.followers, ...currentUser.following]);
        return users.filter(u => contactUsernames.has(u.username) && u.username !== currentUser.username);
    }, [currentUser, users]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return contactList;
        const searchLower = searchTerm.toLowerCase();
        return contactList.filter(u =>
            u.username.toLowerCase().includes(searchLower) ||
            u.name.toLowerCase().includes(searchLower)
        );
    }, [contactList, searchTerm]);

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title="Share post via DM" maxWidth="max-w-md">
            <div className="space-y-4">
                <Input
                    icon={<SearchIcon className="w-4 h-4" />}
                    placeholder="Search followers and following..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="max-h-[50vh] overflow-y-auto -mx-6 px-6">
                    {filteredUsers.length > 0 ? (
                        <div className="divide-y divide-gray-700">
                            {filteredUsers.map(user => (
                                <UserItem
                                    key={user.username}
                                    user={user}
                                    onSend={() => onSelectUser(user.username)}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 py-8">
                            {searchTerm ? `No users found for "${searchTerm}".` : 'No contacts to display.'}
                        </p>
                    )}
                </div>
            </div>
        </Dialog>
    );
};
