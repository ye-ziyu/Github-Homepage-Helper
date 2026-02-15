import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserInfo } from '../types';
import { authApi } from '../api';
import { apiClient } from '../api/client';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  userInfo: UserInfo | null;
  isLoading: boolean;
  error: string | null;

  login: (token: string) => Promise<void>;
  logout: () => void;
  validateToken: () => Promise<void>;
  updateGitHubToken: (githubToken: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      userInfo: null,
      isLoading: false,
      error: null,

      login: async (token: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.validateToken(token);
          if (response.isValid && response.userInfo) {
            // Set token in apiClient for future requests
            apiClient.setToken(response.jwtToken);
            
            set({
              isAuthenticated: true,
              token: response.jwtToken,
              userInfo: response.userInfo,
              isLoading: false,
            });
          } else {
            set({
              isLoading: false,
              error: 'Invalid token or unable to fetch user info',
            });
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Authentication failed',
          });
        }
      },

      logout: () => {
        // Clear token from apiClient
        apiClient.clearToken();
        
        set({
          isAuthenticated: false,
          token: null,
          userInfo: null,
          error: null,
        });
        localStorage.removeItem('auth-storage');
      },

      validateToken: async () => {
        const { token } = get();
        if (!token) return;

        set({ isLoading: true });
        try {
          const response = await authApi.validateToken(token);
          if (response.isValid && response.userInfo) {
            set({
              isAuthenticated: true,
              userInfo: response.userInfo,
              isLoading: false,
            });
          } else {
            get().logout();
          }
        } catch (error) {
          get().logout();
        }
      },

      updateGitHubToken: async (githubToken: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.updateGitHubToken(githubToken);
          if (response.success) {
            // Refresh user info to get updated data
            await get().validateToken();
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Failed to update GitHub token',
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        userInfo: state.userInfo,
      }),
    }
  )
);
