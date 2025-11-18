import React from 'react';
import type { UserProfile } from '../../types';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { UserPlusIcon } from '../icons/UserPlusIcon';

interface FollowListModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    users: UserProfile[];
    currentUser: UserProfile;
    onFollow: (username: string) => void;
    onUnfollow: (username: string) => void;
    onNavigateToProfile: (username: string) => void;
}

const UserItem = ({
    user,
    isCurrentUser,
    isFollowing,
    onFollow,
    onUnfollow,
    onNavigate,
}: {
    user: UserProfile;
    isCurrentUser: boolean;
    isFollowing: boolean;
    onFollow: () => void;
    onUnfollow: () => void;
    onNavigate: () => void;
}) => (
    <div className="flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
            <button onClick={onNavigate}>
                 <img
                    src={user.avatarUrl || `https://api.dicebear.com/8.x/pixel-art/svg?seed=${user.username}`}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover hover:opacity-80 transition-opacity"
                />
            </button>
            <div>
                <button onClick={onNavigate} className="font-bold text-white hover:underline">{user.name}</button>
                <p className="text-sm text-gray-400">@{user.username}</p>
            </div>
        </div>
        {!isCurrentUser && (
            isFollowing ? (
                <Button onClick={onUnfollow} className="h-8 px-3 text-sm bg-transparent border border-gray-600 hover:bg-gray-700">
                    Unfollow
                </Button>
            ) : (
                <Button onClick={onFollow} className="h-8 px-3 text-sm">
                    <UserPlusIcon className="w-4 h-4 mr-2" />
                    Follow
                </Button>
            )
        )}
    </div>
);

export const FollowListModal = ({
    isOpen,
    onClose,
    title,
    users,
    currentUser,
    onFollow,
    onUnfollow,
    onNavigateToProfile,
}: FollowListModalProps) => {
    
    const handleNavigate = (username: string) => {
        onNavigateToProfile(username);
        onClose();
    };

    return (
        <Dialog isOpen={isOpen} onClose={onClose} title={title}>
            <div className="max-h-[60vh] overflow-y-auto -mx-6 px-6">
                {users.length > 0 ? (
                    <div className="divide-y divide-gray-700">
                        {users.map(user => (
                            <UserItem
                                key={user.username}
                                user={user}
                                isCurrentUser={user.username === currentUser.username}
                                isFollowing={currentUser.following.includes(user.username)}
                                onFollow={() => onFollow(user.username)}
                                onUnfollow={() => onUnfollow(user.username)}
                                onNavigate={() => handleNavigate(user.username)}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">No users to display.</p>
                )}
            </div>
        </Dialog>
    );
};
