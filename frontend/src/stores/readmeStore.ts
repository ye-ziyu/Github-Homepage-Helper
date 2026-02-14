import { create } from 'zustand';
import { ReadmeGenerateResult, ReadmeConfig } from '../types';
import { readmeApi } from '../api';

interface ReadmeState {
  generatedReadme: string | null;
  previewReadme: string | null;
  isLoading: boolean;
  error: string | null;
  templates: any[];
  wordCount: number;
  lineCount: number;

  generateReadme: (config: ReadmeConfig) => Promise<void>;
  preview: (config: ReadmeConfig) => Promise<void>;
  getTemplates: () => Promise<void>;
  syncToGitHub: (owner: string, repo: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useReadmeStore = create<ReadmeState>((set, get) => ({
  generatedReadme: null,
  previewReadme: null,
  isLoading: false,
  error: null,
  templates: [],
  wordCount: 0,
  lineCount: 0,

  generateReadme: async (config: ReadmeConfig) => {
    set({ isLoading: true, error: null });
    try {
      const result = await readmeApi.generate({ config });
      set({
        generatedReadme: result.readme,
        wordCount: result.wordCount,
        lineCount: result.lineCount,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to generate readme',
      });
    }
  },

  preview: async (config: ReadmeConfig) => {
    set({ isLoading: true, error: null });
    try {
      const result = await readmeApi.preview({ config });
      set({
        previewReadme: result.readme,
        wordCount: result.wordCount,
        lineCount: result.lineCount,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to generate preview',
      });
    }
  },

  getTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const templates = await readmeApi.getTemplates();
      set({ templates, isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch templates',
      });
    }
  },

  syncToGitHub: async (owner: string, repo: string) => {
    const { generatedReadme } = get();
    if (!generatedReadme) {
      set({ error: 'No readme content to sync' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      await readmeApi.readme({
        owner,
        repo,
        content: generatedReadme,
        commitMessage: 'Update README via GitHub Profile Enhancer',
      });
      set({ isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to sync readme',
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      generatedReadme: null,
      previewReadme: null,
      isLoading: false,
      error: null,
      wordCount: 0,
      lineCount: 0,
    });
  },
}));
