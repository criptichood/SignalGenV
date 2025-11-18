import React from 'react';
import type { UserProfile } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UserPlusIcon } from '@/components/icons/UserPlusIcon';

interface UserCardProps {
    user: UserProfile;
    currentUser: UserProfile;
    onFollow: (username: string) => void;
    onUnfollow: (username: string) => void;
    onNavigateToProfile: (username: string) => void;
}

export const UserCard = ({ user, currentUser, onFollow, onUnfollow, onNavigateToProfile }: UserCardProps) => {
    const isFollowing = currentUser.following.includes(user.username);
    const isCurrentUser = user.username === currentUser.username;

    return (
        <Card className="text-center transition-transform hover:-translate-y-1">
            <CardContent className="p-6">
                <button onClick={() => onNavigateToProfile(user.username)} className="w-20 h-20 mx-auto rounded-full border-2 border-gray-700 object-cover hover:border-cyan-400 transition-colors">
                     <img
                        src={user.avatarUrl || `https://api.dicebear.com/8.x/pixel-art/svg?seed=${user.username}`}
                        alt={user.name}
                        className="w-full h-full rounded-full"
                    />
                </button>
                <button onClick={() => onNavigateToProfile(user.username)} className="mt-3">
                    <h3 className="text-lg font-bold hover:underline">{user.name}</h3>
                </button>
                <p className="text-sm text-gray-400">@{user.username}</p>
                <p className="text-xs text-gray-500 mt-2 h-8 line-clamp-2">{user.bio}</p>
                
                {!isCurrentUser && (
                     <div className="mt-4">
                        {isFollowing ? (
                            <Button onClick={() => onUnfollow(user.username)} className="w-full h-8 px-3 text-sm bg-transparent border border-gray-600 hover:bg-gray-700">
                                Unfollow
                            </Button>
                        ) : (
                            <Button onClick={() => onFollow(user.username)} className="w-full h-8 px-3 text-sm">
                                <UserPlusIcon className="w-4 h-4 mr-2" />
                                Follow
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
