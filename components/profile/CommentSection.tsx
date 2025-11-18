import React, { useState } from 'react';
import type { UserPost, UserProfile, Comment as CommentType } from '../../types';
import { Comment } from './Comment';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';

interface CommentSectionProps {
    post: UserPost;
    userProfile: UserProfile;
    onLikeComment: (commentId: string) => void;
    onAddComment: (content: string, parentId?: string) => void;
    onNavigateToProfile: (username: string) => void;
}

export const CommentSection = ({ post, userProfile, onLikeComment, onAddComment, onNavigateToProfile }: CommentSectionProps) => {
    const [newComment, setNewComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            onAddComment(newComment);
            setNewComment('');
        }
    };

    return (
        <div className="p-4 border-t border-gray-700/50 space-y-6">
            {/* Form to add a new top-level comment */}
            <form onSubmit={handleSubmit} className="flex items-start gap-3">
                <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.name}
                    className="w-9 h-9 rounded-full border-2 border-gray-700 object-cover mt-1"
                />
                <div className="flex-1">
                    <Textarea 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..." 
                        rows={2} 
                        className="bg-gray-700/50"
                    />
                    <div className="mt-2 flex justify-end">
                        <Button type="submit" disabled={!newComment.trim()} className="h-8 px-4 text-sm">Post Comment</Button>
                    </div>
                </div>
            </form>
            
            {/* List of comments */}
            <div className="space-y-6">
                {post.comments.map(comment => (
                    <Comment 
                        key={comment.id} 
                        comment={comment} 
                        userProfile={userProfile}
                        onLike={onLikeComment}
                        onReply={onAddComment}
                        onNavigateToProfile={onNavigateToProfile}
                    />
                ))}
            </div>
        </div>
    );
};
