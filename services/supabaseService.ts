import { createClient, type User } from '@supabase/supabase-js';
import type { UserProfile } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase environment variables are not set. Authentication will not work.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Supabase Authentication Service
 * Handles user authentication and profile management
 */
export const supabaseService = {
  /**
   * Sign up a new user with email and password
   */
  async signUp(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { user: null, error: error as Error };
    }
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, error: error as Error };
    }
  },

  /**
   * Sign in with Google OAuth
   */
  async signInWithGoogle(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        throw error;
      }

      // The browser will be redirected to Google for authentication
      return { error: null };
    } catch (error) {
      console.error('Google sign in error:', error);
      return { error: error as Error };
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },

  /**
   * Get the currently authenticated user
   */
  getCurrentUser(): User | null {
    return supabase.auth.getUser().then(({ data }) => data.user).catch(() => null) as unknown as User | null;
  },

  /**
   * Get the current auth session
   */
  getCurrentSession() {
    return supabase.auth.getSession();
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },

  /**
   * Create or update a user profile in the database
   */
  async upsertUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...profileData,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
        });

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error) {
      console.error('Profile upsert error:', error);
      return { error: error as Error };
    }
  },

  /**
   * Fetch a user profile by user ID
   */
  async fetchUserProfile(userId: string): Promise<{ profile: UserProfile | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return { profile: null, error: null };
        }
        throw error;
      }

      return { profile: data as UserProfile, error: null };
    } catch (error) {
      console.error('Profile fetch error:', error);
      return { profile: null, error: error as Error };
    }
  },

  /**
   * Fetch a user profile by username
   */
  async fetchUserProfileByUsername(username: string): Promise<{ profile: UserProfile | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return { profile: null, error: null };
        }
        throw error;
      }

      return { profile: data as UserProfile, error: null };
    } catch (error) {
      console.error('Profile fetch by username error:', error);
      return { profile: null, error: error as Error };
    }
  },

  /**
   * Sign in anonymously
   */
  async signInAnonymously(): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        throw error;
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Anonymous sign in error:', error);
      return { user: null, error: error as Error };
    }
  },
};

export default supabaseService;