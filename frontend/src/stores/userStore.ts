import { create } from 'zustand';
import { UserInfo, Repository, LanguageStats, UserStats, CursorPagination } from '../types';
import { userApi } from '../api';

interface UserState {
  userInfo: UserInfo | null;
  repos: Repository[];
  languages: LanguageStats | null;
  stats: UserStats | null;
  isLoading: boolean;
  error: string | null;
  pagination: CursorPagination | null;

  fetchUserInfo: (refresh?: boolean) => Promise<void>;
  fetchRepos: (params?: { cursor?: string; page_size?: number }) => Promise<void>;
  fetchLanguages: () => Promise<void>;
  fetchStats: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  userInfo: null,
  repos: [],
  languages: null,
  stats: null,
  isLoading: false,
  error: null,
  pagination: null,

  fetchUserInfo: async (refresh = false) => {
    set({ isLoading: true, error: null });
    try {
      const userInfo = await userApi.getInfo({ refresh });
      set({ userInfo, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch user info',
      });
    }
  },

  fetchRepos: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userApi.getRepos(params);
      set({
        repos: response.repos,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch repos',
      });
    }
  },

  fetchLanguages: async () => {
    set({ isLoading: true, error: null });
    try {
      const languages = await userApi.getLanguages();
      set({ languages, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch languages',
      });
    }
  },

  fetchStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const stats = await userApi.getStats();
      set({ stats, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch stats',
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      userInfo: null,
      repos: [],
      languages: null,
      stats: null,
      isLoading: false,
      error: null,
      pagination: null,
    });
  },
}));
