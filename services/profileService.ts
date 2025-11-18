import type { UserProfile } from '../types';
import supabaseService from './supabaseService';

/**
 * Profile Service
 * Handles user profile operations with Supabase
 */
export const profileService = {
  /**
   * Update user profile in the database
   */
  async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabaseService.upsertUserProfile(userId, profileData);
      return { error: error };
    } catch (error) {
      console.error('Profile update error:', error);
      return { error: error as Error };
    }
  },

  /**
   * Fetch user profile by user ID
   */
  async fetchProfile(userId: string): Promise<{ profile: UserProfile | null; error: Error | null }> {
    try {
      const { profile, error } = await supabaseService.fetchUserProfile(userId);
      return { profile, error };
    } catch (error) {
      console.error('Profile fetch error:', error);
      return { profile: null, error: error as Error };
    }
  },

  /**
   * Fetch user profile by username
   */
  async fetchProfileByUsername(username: string): Promise<{ profile: UserProfile | null; error: Error | null }> {
    try {
      const { profile, error } = await supabaseService.fetchUserProfileByUsername(username);
      return { profile, error };
    } catch (error) {
      console.error('Profile fetch by username error:', error);
      return { profile: null, error: error as Error };
    }
  },
};

export default profileService;