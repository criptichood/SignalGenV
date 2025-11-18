import React, { useMemo } from 'react';
import type { UserPost } from '../../types';
import { Dialog } from '../ui/Dialog';
import { PostCard } from './PostCard';
import { useSocialStore } from '../../store/socialStore';

interface ViewPostModalProps {
    post: UserPost | null;
    onClose: () => void;
    onNavigateToProfile: (username: string) => void;
}

export const ViewPostModal = ({
  post,
  onClose,
  onNavigateToProfile,
}: ViewPostModalProps) => {
  const { 
      users, handleDeletePost, handleLikePost, handleAddComment, 
      handleLikeComment, handleRepost, handleUndoRepost, setPostToShare
  } = useSocialStore();

  const currentUser = useMemo(() => users.find(u => u.username === 'CryptoTrader123')!, [users]);

  if (!post) {
    return null;
  }

  return (
    <Dialog isOpen={true} onClose={onClose} title="View Post" maxWidth="max-w-2xl">
      <div className="-m-6">
        <PostCard
          post={post}
          currentUser={currentUser}
          onDelete={() => {
            handleDeletePost(post);
            onClose(); // Close modal after deleting
          }}
          onLike={handleLikePost}
          onAddComment={handleAddComment}
          onLikeComment={handleLikeComment}
          onNavigateToProfile={onNavigateToProfile}
          onRepost={handleRepost}
          onUndoRepost={handleUndoRepost}
          onShareViaDm={setPostToShare}
        />
      </div>
    </Dialog>
  );
};
