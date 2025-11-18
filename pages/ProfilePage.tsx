import React, { useState, useMemo } from 'react';
import type { UserProfile } from '@/types';
import { StrategyCard } from '@/components/strategy/StrategyCard';
import { PostCard } from '@/components/profile/PostCard';
import { CreatePostForm } from '@/components/profile/CreatePostForm';
import { Layers, MessageSquare, Heart, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { ProfileBanner } from '@/components/profile/ProfileBanner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { FollowListModal } from '@/components/profile/FollowListModal';
import { useSocialStore } from '@/store/socialStore';
import { useStore } from '@/store';
import { Card } from '@/components/ui/Card';

interface ProfilePageProps {
    onNavigateToProfile: (username: string) => void;
}

export default function ProfilePage({ onNavigateToProfile }: ProfilePageProps): React.ReactElement | null {
    const {
        users, posts, strategies, viewingProfileUsername,
        signalToAttach, setSignalToAttach,
        tradeIdeaToAttach, setTradeIdeaToAttach,
        handleFollow, handleUnfollow, handleSaveProfile,
        handleCreatePost, handleDeletePost, handleLikePost, handleAddComment, handleLikeComment,
        handleOpenMessage: handleOpenMessageAction, handleRepost, handleUndoRepost, setPostToShare
    // FIX: Correctly call the useSocialStore hook.
    } = useSocialStore();

    const { setCurrentPage } = useStore();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isFollowListModalOpen, setIsFollowListModalOpen] = useState(false);
    const [followListType, setFollowListType] = useState<'followers' | 'following'>('followers');
    const [activeTab, setActiveTab] = useState('posts');

    const currentUser = useMemo(() => users.find(u => u.username === 'CryptoTrader123')!, [users]);
    const displayedProfile = useMemo(() => {
        if (viewingProfileUsername) {
            return users.find(u => u.username === viewingProfileUsername) || null;
        }
        return currentUser;
    }, [users, viewingProfileUsername, currentUser]);
    
    if (!displayedProfile) {
        // Handle case where profile might not be found
        return <div className="text-center p-8">User not found.</div>;
    }

    const isOwnProfile = displayedProfile.username === currentUser.username;

    const userPosts = useMemo(() => posts.filter(p => p.author.username === displayedProfile.username && !p.repostOf), [posts, displayedProfile.username]);
    const userReposts = useMemo(() => posts.filter(p => p.author.username === displayedProfile.username && !!p.repostOf), [posts, displayedProfile.username]);
    const userLikes = useMemo(() => posts.filter(p => (p.repostOf || p).likedBy.includes(displayedProfile.username)), [posts, displayedProfile.username]);
    const userStrategies = useMemo(() => strategies.filter(s => s.authorUsername === displayedProfile.username), [strategies, displayedProfile.username]);
    
    const followListUsers = useMemo(() => {
        if (!isFollowListModalOpen) return [];
        const usernames = followListType === 'followers' ? displayedProfile.followers : displayedProfile.following;
        return users.filter(u => usernames.includes(u.username));
    }, [isFollowListModalOpen, followListType, displayedProfile, users]);
    
    const handleOpenFollowList = (type: 'followers' | 'following') => {
        setFollowListType(type);
        setIsFollowListModalOpen(true);
    };

    const handleOpenMessage = (username: string) => {
        handleOpenMessageAction(username, setCurrentPage);
    };
    
    return (
        <div className="space-y-6">
             {!isOwnProfile && (
                <button 
                    onClick={() => onNavigateToProfile(currentUser.username)}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to your profile
                </button>
            )}
            <Card>
                <ProfileBanner
                    displayedProfile={displayedProfile}
                    currentUser={currentUser}
                    isOwnProfile={isOwnProfile}
                    onEdit={() => setIsEditModalOpen(true)}
                    onFollow={handleFollow}
                    onUnfollow={handleUnfollow}
                    onOpenMessage={handleOpenMessage}
                    onOpenFollowList={handleOpenFollowList}
                />
                
                {/* FIX: Replaced incorrect 'defaultValue' prop with controlled 'value' and 'onValueChange' props. */}
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as string)} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 border-t border-gray-700 rounded-none">
                        <TabsTrigger value="posts"><MessageSquare className="w-4 h-4 mr-2"/>Posts</TabsTrigger>
                        <TabsTrigger value="reposts"><Layers className="w-4 h-4 mr-2"/>Reposts</TabsTrigger>
                        <TabsTrigger value="likes"><Heart className="w-4 h-4 mr-2"/>Likes</TabsTrigger>
                        <TabsTrigger value="strategies"><ImageIcon className="w-4 h-4 mr-2"/>Strategies</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="posts" className="p-6 space-y-6">
                        {isOwnProfile && (
                            <CreatePostForm 
                                userProfile={currentUser} 
                                onCreatePost={handleCreatePost} 
                                signalToAttach={signalToAttach}
                                onClearSignalAttachment={() => setSignalToAttach(null)}
                                tradeIdeaToAttach={tradeIdeaToAttach}
                                setTradeIdeaToAttach={setTradeIdeaToAttach}
                            />
                        )}
                        {userPosts.length > 0 ? (
                            userPosts.map(post => (
                                <PostCard key={post.id} post={post} currentUser={currentUser} onDelete={handleDeletePost} onLike={handleLikePost} onAddComment={handleAddComment} onLikeComment={handleLikeComment} onNavigateToProfile={onNavigateToProfile} onRepost={handleRepost} onUndoRepost={handleUndoRepost} onShareViaDm={setPostToShare} />
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-8">No posts yet.</p>
                        )}
                    </TabsContent>
                    
                    <TabsContent value="reposts" className="p-6 space-y-6">
                         {userReposts.length > 0 ? (
                            userReposts.map(post => (
                                <PostCard key={post.id} post={post} currentUser={currentUser} onDelete={handleDeletePost} onLike={handleLikePost} onAddComment={handleAddComment} onLikeComment={handleLikeComment} onNavigateToProfile={onNavigateToProfile} onRepost={handleRepost} onUndoRepost={handleUndoRepost} onShareViaDm={setPostToShare} />
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-8">No reposts yet.</p>
                        )}
                    </TabsContent>

                    <TabsContent value="likes" className="p-6 space-y-6">
                        {userLikes.length > 0 ? (
                            userLikes.map(post => (
                                <PostCard key={`like-${post.id}`} post={post} currentUser={currentUser} onDelete={handleDeletePost} onLike={handleLikePost} onAddComment={handleAddComment} onLikeComment={handleLikeComment} onNavigateToProfile={onNavigateToProfile} onRepost={handleRepost} onUndoRepost={handleUndoRepost} onShareViaDm={setPostToShare} />
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-8">No liked posts yet.</p>
                        )}
                    </TabsContent>

                     <TabsContent value="strategies" className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {userStrategies.length > 0 ? (
                                userStrategies.map(strategy => (
                                    <StrategyCard key={strategy.id} strategy={strategy} userProfile={displayedProfile} readOnly />
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-8 md:col-span-2">No strategies to display.</p>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </Card>

            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                userProfile={currentUser}
                onSave={handleSaveProfile}
            />
            
            <FollowListModal
                isOpen={isFollowListModalOpen}
                onClose={() => setIsFollowListModalOpen(false)}
                title={followListType === 'followers' ? 'Followers' : 'Following'}
                users={followListUsers}
                currentUser={currentUser}
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
                onNavigateToProfile={onNavigateToProfile}
            />
        </div>
    );
}