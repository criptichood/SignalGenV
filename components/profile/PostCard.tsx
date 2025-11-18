import React, { useState, useMemo } from 'react';
import type { UserPost, UserProfile } from '../../types';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card';
import { formatDistanceToNow } from '../../utils/date';
import { HeartIcon } from '../icons/HeartIcon';
import { MessageCircleIcon } from '../icons/MessageCircleIcon';
import { Share2Icon } from '../icons/Share2Icon';
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuContent } from '../ui/DropdownMenu';
import { MoreHorizontalIcon } from '../icons/MoreHorizontalIcon';
import { Trash2Icon } from '../icons/Trash2Icon';
import { LinkPreview } from './LinkPreview';
import { extractLinks } from '../../utils/links';
import { Toast } from '../ui/Toast';
import { CommentSection } from './CommentSection';
import { RepeatIcon } from '../icons/RepeatIcon';
import { useHistoryStore } from '../../store/historyStore';
import SignalAttachment from './SignalAttachment';
import { TradeIdeaAttachment } from './TradeIdeaAttachment';

interface PostCardProps {
    post: UserPost;
    currentUser: UserProfile;
    onDelete: (post: UserPost) => void;
    onLike: (post: UserPost) => void;
    onAddComment: (postId: string, content: string, parentId?: string) => void;
    onLikeComment: (postId: string, commentId: string) => void;
    onNavigateToProfile: (username: string) => void;
    onRepost: (post: UserPost) => void;
    onUndoRepost: (post: UserPost) => void;
    onShareViaDm: (post: UserPost) => void;
}

const renderContentWithLinks = (content: string, previewUrl?: string) => {
    const links = extractLinks(content);
    if (links.length === 0) {
        return <p>{content}</p>;
    }

    let lastIndex = 0;
    const parts: React.ReactNode[] = [];

    content.replace(/(https?:\/\/[^\s]+)/g, (match, url, offset) => {
        // Add text part before the link
        if (offset > lastIndex) {
            parts.push(content.substring(lastIndex, offset));
        }
        
        // Add link part, but only if it's not the main preview link
        if (url !== previewUrl) {
            parts.push(
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline break-all">
                    {url}
                </a>
            );
        } else {
             parts.push(url); // Push the raw url text if it's the preview one
        }
        
        lastIndex = offset + match.length;
        return match; // Required by replace function
    });

    // Add any remaining text after the last link
    if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
    }

    return <p>{parts}</p>;
};

export const PostCard = ({ post, currentUser, onDelete, onLike, onAddComment, onLikeComment, onNavigateToProfile, onRepost, onUndoRepost, onShareViaDm }: PostCardProps) => {
    const { signalHistory } = useHistoryStore();
    const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);
    const [showToast, setShowToast] = useState<string | null>(null);
    
    const originalPost = post.repostOf || post;
    const attachedSignal = useMemo(() => {
        if (!originalPost.attachedSignalId) return null;
        return signalHistory.find(s => s.id === originalPost.attachedSignalId);
    }, [originalPost.attachedSignalId, signalHistory]);
    
    const copyLink = () => {
        const postUrl = new URL(`#/posts/${originalPost.id}`, window.location.href).href;
        navigator.clipboard.writeText(postUrl);
        setShowToast('Link copied to clipboard!');
    };
    
    const isOwnPost = post.author.username === currentUser.username;
    const isLiked = originalPost.likedBy.includes(currentUser.username);
    const isReposted = (originalPost.repostedBy || []).includes(currentUser.username);

    return (
        <>
            <Card>
                {post.repostOf && (
                    <div className="px-6 pt-3 text-sm text-gray-400">
                        <span className="font-semibold text-gray-300">{post.author.name}</span> reposted
                    </div>
                )}
                <CardHeader className="flex flex-row items-start gap-4 pb-3">
                     <button onClick={() => onNavigateToProfile(originalPost.author.username)}>
                        <img
                            src={originalPost.author.avatarUrl || `https://api.dicebear.com/8.x/pixel-art/svg?seed=${originalPost.author.username}`}
                            alt={originalPost.author.name}
                            className="w-12 h-12 rounded-full border-2 border-gray-700 object-cover hover:border-cyan-400 transition-colors"
                        />
                     </button>
                    <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                            <button onClick={() => onNavigateToProfile(originalPost.author.username)} className="font-bold text-white hover:underline">{originalPost.author.name}</button>
                            <p className="text-sm text-gray-400">@{originalPost.author.username}</p>
                        </div>
                        <p className="text-xs text-gray-500">{formatDistanceToNow(originalPost.createdAt)}</p>
                    </div>
                    {isOwnPost && !post.repostOf && (
                         /* FIX: Use DropdownMenuTrigger and DropdownMenuContent for correct component composition */
                         <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                                <button title="More" className="p-2 -mr-2 rounded-md hover:bg-gray-700">
                                    <MoreHorizontalIcon className="w-5 h-5"/>
                                </button>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent>
                                 <DropdownMenuItem onClick={() => onDelete(post)} className="text-red-400 hover:text-red-300">
                                     <Trash2Icon className="w-4 h-4 mr-2"/> Delete Post
                                 </DropdownMenuItem>
                             </DropdownMenuContent>
                         </DropdownMenu>
                    )}
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="text-gray-300 whitespace-pre-wrap break-words">
                        {renderContentWithLinks(post.content, post.linkPreviewUrl)}
                    </div>
                    
                    {attachedSignal && <SignalAttachment signal={attachedSignal} />}
                    {originalPost.attachedTradeIdea && (
                        <TradeIdeaAttachment 
                            idea={originalPost.attachedTradeIdea}
                            isReadOnly 
                        />
                    )}
                    
                    {post.mediaUrl && (
                        <div className="mt-3">
                            <img src={post.mediaUrl} alt="Post attachment" className="rounded-lg border border-gray-700 max-h-96 w-auto" />
                        </div>
                    )}
                    {post.linkPreviewUrl && <LinkPreview url={post.linkPreviewUrl} />}

                    {post.repostOf && (
                        <div className="border border-gray-700 rounded-xl p-4">
                            <PostCard 
                                post={post.repostOf} 
                                currentUser={currentUser} 
                                onDelete={onDelete} 
                                onLike={onLike} 
                                onAddComment={onAddComment} 
                                onLikeComment={onLikeComment} 
                                onNavigateToProfile={onNavigateToProfile}
                                onRepost={onRepost}
                                onUndoRepost={onUndoRepost}
                                onShareViaDm={onShareViaDm}
                            />
                        </div>
                    )}

                </CardContent>
                <CardFooter className="border-t border-gray-700/50 pt-3 pb-3">
                     <div className="flex items-center gap-6">
                        <button title={isLiked ? 'Unlike' : 'Like'} onClick={() => onLike(originalPost)} className={`flex items-center gap-2 text-sm transition-colors ${isLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400'}`}>
                            <HeartIcon className="w-5 h-5" isFilled={isLiked} />
                            <span>{originalPost.likedBy.length}</span>
                        </button>
                        <button title="Comment" onClick={() => setIsCommentSectionOpen(!isCommentSectionOpen)} className="flex items-center gap-2 text-sm text-gray-400 hover:text-cyan-400 transition-colors">
                            <MessageCircleIcon className="w-5 h-5" />
                             <span>{post.commentCount}</span>
                        </button>
                        <button title={isReposted ? 'Undo Repost' : 'Repost'} onClick={() => isReposted ? onUndoRepost(originalPost) : onRepost(originalPost)} className={`flex items-center gap-2 text-sm transition-colors ${isReposted ? 'text-green-400' : 'text-gray-400 hover:text-green-400'}`}>
                            <RepeatIcon className="w-5 h-5" />
                            <span>{isReposted ? 'Undo Repost' : 'Repost'}</span>
                        </button>
                         {/* FIX: Use DropdownMenuTrigger and DropdownMenuContent for correct component composition */}
                         <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                                <button title="Share" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                                    <Share2Icon className="w-5 h-5" />
                                    <span>Share</span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={copyLink}>Copy link to post</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onShareViaDm(originalPost)}>Share via DM</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setShowToast('Embed post (mock action)')}>Embed post</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardFooter>
                 {isCommentSectionOpen && (
                   <div className="animate-fade-in-down">
                        <CommentSection
                            post={post}
                            userProfile={currentUser}
                            onLikeComment={(commentId) => onLikeComment(post.id, commentId)}
                            onAddComment={(content, parentId) => onAddComment(post.id, content, parentId)}
                            onNavigateToProfile={onNavigateToProfile}
                        />
                   </div>
                )}
            </Card>
            {showToast && <Toast message={showToast} variant="success" onClose={() => setShowToast(null)} />}
        </>
    );
};
