import apiClient from './client';
import {
  UserInfo,
  Repository,
  LanguageStats,
  UserStats,
  BioGenerateRequest,
  AsyncJobResponse,
  BioGenerateResult,
  ImageGenerateRequest,
  ReadmeGenerateRequest,
  ReadmeGenerateResult,
  SyncProfileRequest,
  CursorPagination,
} from '../types';

// Auth API
export const authApi = {
  validateToken: (token: string) =>
    apiClient.post<{ isValid: boolean; userInfo: UserInfo; jwtToken: string; expiresIn: number }>(
      '/auth/validate',
      { token }
    ),
};

// User API
export const userApi = {
  getInfo: (params?: { refresh?: boolean; include?: string }) =>
    apiClient.get<UserInfo>('/user/info', { params }),
  getRepos: (params?: {
    cursor?: string;
    page_size?: number;
    sort?: string;
    type?: string;
    direction?: string;
  }) =>
    apiClient.get<{ repos: Repository[]; pagination: CursorPagination }>('/user/repos', { params }),
  getLanguages: () => apiClient.get<LanguageStats>('/user/languages'),
  getStats: () => apiClient.get<UserStats>('/user/stats'),
};

// Bio API
export const bioApi = {
  generate: (data: BioGenerateRequest) =>
    apiClient.post<AsyncJobResponse | BioGenerateResult>('/bio/generate', data),
  getJobStatus: (jobId: string) =>
    apiClient.get<{ jobId: string; status: string; progress: number; result: any; error: any }>(
      `/bio/jobs/${jobId}`
    ),
  getTemplates: () => apiClient.get('/bio/templates'),
};

// Image API
export const imageApi = {
  generateAvatar: (data: ImageGenerateRequest) =>
    apiClient.post<AsyncJobResponse>('/image/generate-avatar', data),
  getStyles: () => apiClient.get('/image/styles'),
};

// README API
export const readmeApi = {
  generate: (data: ReadmeGenerateRequest) =>
    apiClient.post<ReadmeGenerateResult>('/readme/generate', data),
  preview: (data: ReadmeGenerateRequest) =>
    apiClient.post<ReadmeGenerateResult>('/readme/preview', data),
  getTemplates: () => apiClient.get('/readme/templates'),
};

// Sync API
export const syncApi = {
  profile: (data: SyncProfileRequest) => apiClient.post('/sync/profile', data),
  readme: (data: { owner: string; repo: string; content: string; commitMessage?: string }) =>
    apiClient.post('/sync/readme', data),
  pullRequest: (data: any) => apiClient.post('/sync/pull-request', data),
};

// Health API
export const healthApi = {
  check: () => apiClient.get('/health'),
  version: () => apiClient.get('/version'),
};
