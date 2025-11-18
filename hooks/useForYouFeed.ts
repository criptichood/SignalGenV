
import { useMemo } from 'react';
import type { UserPost, UserProfile } from '@/types';

// Scoring weights
const W_RECENCY = 1.5; // Emphasize newer content
const W_LIKES = 0.5;
const W_COMMENTS = 1.0;
const W_FOLLOWING = 2.0; // Strongly prioritize content from followed users
const W_SIGNAL = 2.5; // Highlight valuable signal posts
const W_VALIDATED_IDEA = 3.0; // Give an even bigger boost to user ideas with AI feedback

// Time decay factor (in hours)
const HALF_LIFE = 24; // Content's score halves every 24 hours

/**
 * A custom hook to generate a "For You" algorithmic feed.
 * It scores posts based on recency, engagement, and user connections,
 * creating a more personalized and relevant feed than a simple chronological one.
 *
 * @param posts - The array of all posts.
 * @param users - The array of all users.
 * @param currentUser - The profile of the currently logged-in user.
 * @returns A memoized, sorted array of posts for the "For You" feed.
 */
export function useForYouFeed(posts: UserPost[], users: UserProfile[], currentUser: UserProfile) {

  const scoredPosts = useMemo(() => {
    if (!currentUser) return [];

    const now = Date.now();

    return posts.map(post => {
      const originalPost = post.repostOf || post;

      // 1. Recency Score (Exponential Decay)
      const ageHours = (now - originalPost.createdAt) / (1000 * 60 * 60);
      const recencyScore = Math.exp(-(ageHours * Math.log(2)) / HALF_LIFE);

      // 2. Engagement Score
      const likeScore = originalPost.likedBy.length * W_LIKES;
      const commentScore = originalPost.commentCount * W_COMMENTS;

      // 3. Social Graph Score
      const isFollowing = currentUser.following.includes(originalPost.author.username);
      const followingScore = isFollowing ? W_FOLLOWING : 0;
      
      // 4. Content Score
      let contentScore = 0;
      if (originalPost.attachedSignalId) {
          contentScore = W_SIGNAL;
      } else if (originalPost.attachedTradeIdea) {
          contentScore = originalPost.attachedTradeIdea.aiFeedback ? W_VALIDATED_IDEA : W_SIGNAL;
      }

      // Final Score Calculation
      const totalScore = 
          (recencyScore * W_RECENCY) +
          likeScore +
          commentScore +
          followingScore +
          contentScore;

      return {
        ...post,
        score: totalScore,
      };
    });

  }, [posts, currentUser]);

  // Sort posts by score in descending order
  const sortedPosts = useMemo(() => {
    return scoredPosts.sort((a, b) => b.score - a.score);
  }, [scoredPosts]);

  return sortedPosts;
}