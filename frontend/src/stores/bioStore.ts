import { create } from 'zustand';
import { AsyncJobResponse, BioGenerateResult, BioConfig } from '../types';
import { bioApi } from '../api';

interface BioState {
  generatedBio: string | null;
  generatedShortBio: string | null;
  shortBioLanguage: 'zh' | 'en';
  bioOption: 'original' | 'generated';
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
  setShortBioLanguage: (language: 'zh' | 'en') => void;
  setBioOption: (option: 'original' | 'generated') => void;
}

export const useBioStore = create<BioState>()(
  (set, get) => ({
    generatedBio: null,
    generatedShortBio: null,
    shortBioLanguage: 'zh',
    bioOption: 'generated',
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
            generatedShortBio: response.shortBio || '',
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
        console.log('Job status:', status); // Add debug log
        
        set({
          jobStatus: { ...status, createdAt: new Date().toISOString(), status: status.status as 'pending' | 'processing' | 'completed' | 'failed' },
          progress: status.progress,
        });

        if (status.status === 'completed') {
          // Handle different result formats
          let bioContent = '';
          let shortBioContent = '';
          if (status.result) {
            if (typeof status.result === 'string') {
              bioContent = status.result;
            } else if (status.result.bio) {
              bioContent = status.result.bio;
              shortBioContent = status.result.shortBio || '';
            } else {
              bioContent = JSON.stringify(status.result);
            }
          }
          
          console.log('Generated bio:', bioContent); // Add debug log
          console.log('Generated short bio:', shortBioContent); // Add debug log
          
          set({
            generatedBio: bioContent || '生成成功但内容为空',
            generatedShortBio: shortBioContent || '',
            shortBioLanguage: 'zh',
            isLoading: false,
            progress: 100,
          });
        } else if (status.status === 'failed') {
          set({
            isLoading: false,
            error: status.error || 'Bio generation failed',
          });
        } else if (status.status === 'processing' || status.status === 'pending') {
          // Continue polling
          setTimeout(() => get().checkJobStatus(jobId), 2000);
        } else if (status.status === 'not_found') {
          set({
            isLoading: false,
            error: '任务未找到，请重新生成',
          });
        } else {
          // Unknown status, stop loading
          set({
            isLoading: false,
            error: `未知状态: ${status.status}`,
          });
        }
      } catch (error: any) {
        console.error('Check job status error:', error); // Add debug log
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
        generatedShortBio: null,
        shortBioLanguage: 'zh',
        bioOption: 'generated',
        jobStatus: null,
        isLoading: false,
        error: null,
        progress: 0,
      });
    },

    setShortBioLanguage: (language: 'zh' | 'en' | ((prev: 'zh' | 'en') => 'zh' | 'en')) => {
      set(state => ({
        shortBioLanguage: typeof language === 'function' ? language(state.shortBioLanguage) : language
      }));
    },

    setBioOption: (option: 'original' | 'generated') => {
      set({ bioOption: option });
    },
  })
);
