import React, { useState, useMemo } from 'react';
import type { UserPost, UserProfile } from '@/types';
import { PostCard } from '@/components/profile/PostCard';
import { UserCard } from '@/components/discover/UserCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { MessageSquareIcon } from '@/components/icons/MessageSquareIcon';
import { UserIcon } from '@/components/icons/UserIcon';
import { Input } from '@/components/ui/Input';
import { SearchIcon } from '@/components/icons/SearchIcon';
import { useSocialStore } from '@/store/socialStore';
import { useForYouFeed } from '@/hooks/useForYouFeed';

interface DiscoverPageProps {
    onNavigateToProfile: (username: string) => void;
}

export default function DiscoverPage({ onNavigateToProfile }: DiscoverPageProps) {
    const { 
        posts, users, 
        handleFollow, handleUnfollow, 
        handleLikePost, handleAddComment, handleLikeComment, 
        handleRepost, handleUndoRepost, setPostToShare
    } = useSocialStore();
    
    const currentUser = useMemo(() => users.find(u => u.username === 'CryptoTrader123')!, [users]);
    const [activeTab, setActiveTab] = useState('posts');
    const [userSearch, setUserSearch] = useState('');

    const sortedPosts = useForYouFeed(posts, users, currentUser);
    
    const filteredUsers = useMemo(() => {
        if (!userSearch) return [];
        const searchLower = userSearch.toLowerCase();
        return users.filter(u => 
            u.username.toLowerCase().includes(searchLower) ||
            u.name.toLowerCase().includes(searchLower)
        );
    }, [users, userSearch]);

    return (
        <div className="max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold">Discover</h1>
                <p className="text-gray-400 mt-1">Find new content and traders in the community.</p>
            </div>
             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
                <TabsList className="w-full grid grid-cols-2">
                  <TabsTrigger value="posts">
                      <MessageSquareIcon className="w-4 h-4 mr-2" /> For You
                  </TabsTrigger>
                  <TabsTrigger value="users">
                      <UserIcon className="w-4 h-4 mr-2" /> Users
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="posts" className="mt-6 space-y-6">
                    {sortedPosts.length > 0 ? (
                        sortedPosts.map(post => (
                            <PostCard 
                                key={post.id} 
                                post={post} 
                                currentUser={currentUser}
                                onDelete={() => {}} // No delete on discover page
                                onLike={handleLikePost}
                                onAddComment={handleAddComment}
                                onLikeComment={handleLikeComment}
                                onNavigateToProfile={onNavigateToProfile}
                                onRepost={handleRepost}
                                onUndoRepost={handleUndoRepost}
                                onShareViaDm={setPostToShare}
                            />
                        ))
                    ) : (
                        <div className="text-center py-16 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
                            <MessageSquareIcon className="mx-auto h-12 w-12 text-gray-500" />
                            <h3 className="mt-2 text-lg font-medium text-white">It's quiet here...</h3>
                            <p className="mt-1 text-sm text-gray-400">
                                No posts have been made yet. Be the first!
                            </p>
                        </div>
                    )}
                </TabsContent>
                
                 <TabsContent value="users" className="mt-6 space-y-6">
                     <Input 
                        icon={<SearchIcon className="w-4 h-4" />}
                        placeholder="Search for users by name or @username..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                    />
                    
                    {userSearch ? (
                        filteredUsers.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredUsers.map(user => (
                                    <UserCard 
                                        key={user.username}
                                        user={user}
                                        currentUser={currentUser}
                                        onFollow={handleFollow}
                                        onUnfollow={handleUnfollow}
                                        onNavigateToProfile={onNavigateToProfile}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
                                <SearchIcon className="mx-auto h-12 w-12 text-gray-500" />
                                <h3 className="mt-2 text-lg font-medium text-white">No users found</h3>
                                <p className="mt-1 text-sm text-gray-400">
                                    No users match your search for "{userSearch}".
                                </p>
                            </div>
                        )
                    ) : (
                        <div className="text-center py-16 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700">
                            <UserIcon className="mx-auto h-12 w-12 text-gray-500" />
                            <h3 className="mt-2 text-lg font-medium text-white">Find other traders</h3>
                            <p className="mt-1 text-sm text-gray-400">
                                Use the search bar above to find users by their name or username.
                            </p>
                        </div>
                    )}
                 </TabsContent>
            </Tabs>
        </div>
    );
}