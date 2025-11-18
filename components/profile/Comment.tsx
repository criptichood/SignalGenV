import React, { useState } from 'react';
import type { Comment as CommentType, UserProfile } from '../../types';
import { formatDistanceToNow } from '../../utils/date';
import { HeartIcon } from '../icons/HeartIcon';
import { MessageCircleIcon } from '../icons/MessageCircleIcon';
import { ThreadConnector } from './ThreadConnector';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';

interface CommentProps {
    comment: CommentType;
    userProfile: UserProfile;
    onLike: (commentId: string) => void;
    onReply: (content: string, parentId: string) => void;
    onNavigateToProfile: (username: string) => void;
}

export const Comment = ({ comment, userProfile, onLike, onReply, onNavigateToProfile }: CommentProps) => {
    const [isReplying, setIsReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    
    const handleReplySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(replyContent.trim()) {
            onReply(replyContent, comment.id);
            setReplyContent('');
            setIsReplying(false);
        }
    };

    const isLiked = comment.likedBy.includes(userProfile.username);

    return (
        <div>
            <div className="flex items-start gap-3">
                <button onClick={() => onNavigateToProfile(comment.user.username)}>
                    <img
                        src={comment.user.avatarUrl}
                        alt={comment.user.username}
                        className="w-9 h-9 rounded-full border-2 border-gray-700 object-cover hover:border-cyan-400 transition-colors"
                    />
                </button>
                <div className="flex-1">
                    <div className="bg-gray-700/50 rounded-xl px-4 py-2">
                        <div className="flex items-baseline gap-2">
                            <button onClick={() => onNavigateToProfile(comment.user.username)} className="font-bold text-sm text-white hover:underline">{comment.user.username}</button>
                            <p className="text-xs text-gray-400">{formatDistanceToNow(comment.createdAt)}</p>
                        </div>
                        <p className="text-sm text-gray-300">{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-1 px-2">
                        <button onClick={() => onLike(comment.id)} className={`flex items-center gap-1 text-xs transition-colors ${isLiked ? 'text-red-400 font-bold' : 'text-gray-400 hover:text-red-400'}`}>
                            <HeartIcon className="w-3 h-3" isFilled={isLiked} />
                            <span>{comment.likedBy.length > 0 ? comment.likedBy.length : 'Like'}</span>
                        </button>
                        <button onClick={() => setIsReplying(!isReplying)} className="text-xs text-gray-400 hover:text-cyan-400 font-bold">
                            Reply
                        </button>
                    </div>
                </div>
            </div>
            
             {isReplying && (
                <div className="mt-3 ml-6 flex items-start gap-3 animate-fade-in-down">
                     <img
                        src={userProfile.avatarUrl || `https://api.dicebear.com/8.x/pixel-art/svg?seed=${userProfile.username}`}
                        alt={userProfile.username}
                        className="w-8 h-8 rounded-full border-2 border-gray-700 object-cover mt-1"
                    />
                    <form onSubmit={handleReplySubmit} className="flex-1">
                        <Textarea 
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder={`Replying to ${comment.user.username}...`}
                            rows={2}
                            className="bg-gray-700/50 text-sm"
                            autoFocus
                        />
                        <div className="mt-2 flex justify-end gap-2">
                             <Button type="button" onClick={() => setIsReplying(false)} className="h-7 px-3 text-xs bg-gray-600 hover:bg-gray-500">Cancel</Button>
                            <Button type="submit" disabled={!replyContent.trim()} className="h-7 px-3 text-xs">Reply</Button>
                        </div>
                    </form>
                </div>
            )}

            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-4 space-y-4">
                    {comment.replies.map(reply => (
                        <div key={reply.id} className="flex">
                            <ThreadConnector />
                            <div className="flex-1">
                                <Comment 
                                    comment={reply} 
                                    userProfile={userProfile} 
                                    onLike={onLike}
                                    onReply={onReply}
                                    onNavigateToProfile={onNavigateToProfile}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
