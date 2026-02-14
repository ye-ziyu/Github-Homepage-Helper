// User Types
export interface UserInfo {
  id: string;
  githubId: string;
  username: string;
  displayName?: string;
  email?: string;
  bio?: string;
  location?: string;
  blog?: string;
  company?: string;
  twitterUsername?: string;
  avatarUrl?: string;
  followers: number;
  following: number;
  publicRepos: number;
  stars: number;
  languages: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Repository {
  id: string;
  name: string;
  fullName: string;
  description?: string;
  language?: string;
  stars: number;
  forks: number;
  isFork: boolean;
  topics: string[];
  homepage?: string;
  htmlUrl: string;
  updatedAt: string;
}

export interface LanguageStats {
  languages: Array<{
    name: string;
    bytes: number;
    percentage: number;
    repos: number;
  }>;
  cachedAt: string;
}

export interface UserStats {
  followers: number;
  following: number;
  publicRepos: number;
  totalCommits?: number;
  totalPullRequests?: number;
  totalIssues?: number;
  totalStarsReceived: number;
  totalStarsGiven: number;
  contributionGraph: {
    total: number;
    lastYear: number;
    longestStreak: number;
    currentStreak: number;
  };
  cachedAt: string;
}

// API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  metadata?: {
    requestId: string;
    timestamp: string;
    duration: number;
    version: string;
  };
}

export interface CursorPagination {
  nextCursor?: string;
  prevCursor?: string;
  hasMore: boolean;
  total: number;
}

// Bio Generation Types
export type BioStyle = 'professional' | 'casual' | 'humorous' | 'minimal';
export type BioLanguage = 'zh' | 'en' | 'bilingual';
export type BioLength = 'short' | 'medium' | 'long';

export interface BioConfig {
  language: BioLanguage;
  style: BioStyle;
  length: BioLength;
  includeStats?: boolean;
  includeSkills?: boolean;
  includeProjects?: boolean;
}

export interface BioGenerateRequest {
  userInfo?: UserInfo;
  skills?: {
    languages?: Array<{ name: string; level: string }>;
    frameworks?: string[];
    tools?: string[];
  };
  projects?: Array<Repository>;
  config: BioConfig;
  async?: boolean;
}

export interface AsyncJobResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  estimatedTime?: number;
  createdAt: string;
  callbackUrl?: string;
}

export interface BioGenerateResult {
  bio: string;
  wordCount: number;
  characterCount: number;
}

// Image Generation Types
export type ImageStyle = 'realistic' | 'cartoon' | 'pixel' | 'illustration' | 'minimal';
export type ImageGender = 'male' | 'female' | 'neutral' | 'undefined';
export type ImageAgeGroup = 'young' | 'adult' | 'mature';

export interface ImageConfig {
  style: ImageStyle;
  gender?: ImageGender;
  ageGroup?: ImageAgeGroup;
  accessories?: string[];
  clothing?: string;
  expression?: string;
  backgroundColor?: string;
  size?: string;
}

export interface ImageGenerateRequest {
  config: ImageConfig;
  userInfo?: UserInfo;
}

// README Generation Types
export type ReadmeTheme = 'light' | 'dark' | 'auto';

export interface ReadmeConfig {
  sections: string[];
  theme?: ReadmeTheme;
  showStats?: boolean;
  showVisitors?: boolean;
}

export interface ReadmeGenerateRequest {
  userInfo: UserInfo;
  bio?: string;
  avatarUrl?: string;
  skills?: string[];
  projects?: Repository[];
  config: ReadmeConfig;
}

export interface ReadmeGenerateResult {
  readme: string;
  wordCount: number;
  lineCount: number;
}

// Sync Types
export interface SyncProfileRequest {
  bio?: string;
  location?: string;
  blog?: string;
  company?: string;
  twitterUsername?: string;
}

export interface SyncReadmeRequest {
  owner: string;
  repo: string;
  content: string;
  commitMessage?: string;
  branch?: string;
}

// WebSocket Types
export interface WebSocketMessage {
  type: string;
  data: any;
}

export interface TaskProgressMessage extends WebSocketMessage {
  type: 'task_progress';
  data: {
    taskId: string;
    progress: number;
    message: string;
  };
}

export interface TaskCompleteMessage extends WebSocketMessage {
  type: 'task_complete';
  data: {
    taskId: string;
    result: any;
  };
}

export interface TaskErrorMessage extends WebSocketMessage {
  type: 'task_error';
  data: {
    taskId: string;
    error: string;
  };
}
