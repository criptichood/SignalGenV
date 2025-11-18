import { useStore } from '@/store';
import { supabaseService } from '@/services';

/**
 * Session Management Utility
 * Handles user session initialization and management
 */
export const sessionManager = {
  /**
   * Initialize the session when the app starts
   * This should be called once when the app loads
   */
  async initializeSession(): Promise<void> {
    try {
      const { data: { session }, error } = await supabaseService.getCurrentSession();

      if (error) {
        console.error('Error getting session:', error);
        return;
      }

      if (session) {
        // Update the store with the session data
        useStore.getState().setAuthState(true, session.user);
      } else {
        // If no session exists, ensure the store reflects this
        useStore.getState().setAuthState(false, null);
      }
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  },

  /**
   * Refresh the session manually
   */
  async refreshSession(): Promise<void> {
    try {
      const { data: { session }, error } = await supabaseService.getCurrentSession();

      if (error) {
        console.error('Error getting session:', error);
        return;
      }

      if (session) {
        useStore.getState().setAuthState(true, session.user);
      } else {
        useStore.getState().setAuthState(false, null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const store = useStore.getState();
    return store.isAuthenticated;
  },

  /**
   * Get current user data
   */
  getCurrentUser() {
    const store = useStore.getState();
    return store.user;
  }
};