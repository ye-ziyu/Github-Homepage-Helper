import { create } from 'zustand';
import { AsyncJobResponse, BioGenerateResult, BioConfig } from '../types';
import { bioApi } from '../api';

interface BioState {
  generatedBio: string | null;
  jobStatus: AsyncJobResponse | null;
  isLoading: boolean;
  error: string | null;
  templates: any[];
  progress: number;

  generateBio: (config: BioConfig) => Promise<void>;
  checkJobStatus: (jobId: string) => Promise<void>;
  getTemplates: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useBioStore = create<BioState>((set, get) => ({
  generatedBio: null,
  jobStatus: null,
  isLoading: false,
  error: null,
  templates: [],
  progress: 0,

  generateBio: async (config: BioConfig) => {
    set({ isLoading: true, error: null, progress: 0 });
    try {
      const response = await bioApi.generate({ config, async: true });

      if ('jobId' in response) {
        // Async response
        set({ jobStatus: response, isLoading: true });
        // Start polling for status
        get().checkJobStatus(response.jobId);
      } else {
        // Sync response
        set({
          generatedBio: response.bio,
          isLoading: false,
          progress: 100,
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to generate bio',
      });
    }
  },

  checkJobStatus: async (jobId: string) => {
    try {
      const status = await bioApi.getJobStatus(jobId);
      set({
        jobStatus: { ...status, createdAt: new Date().toISOString(), status: status.status as 'pending' | 'processing' | 'completed' | 'failed' },
        progress: status.progress,
      });

      if (status.status === 'completed' && status.result) {
        set({
          generatedBio: status.result.bio || status.result,
          isLoading: false,
          progress: 100,
        });
      } else if (status.status === 'failed') {
        set({
          isLoading: false,
          error: status.error || 'Bio generation failed',
        });
      } else if (status.status === 'processing') {
        // Continue polling
        setTimeout(() => get().checkJobStatus(jobId), 2000);
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to check job status',
      });
    }
  },

  getTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const templates = await bioApi.getTemplates();
      set({ templates: templates as any[], isLoading: false });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch templates',
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      generatedBio: null,
      jobStatus: null,
      isLoading: false,
      error: null,
      progress: 0,
    });
  },
}));
