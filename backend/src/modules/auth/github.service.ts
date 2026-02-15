import { Injectable, NotFoundException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface GitHubUserInfo {
  id: number;
  login: string;
  name?: string;
  email?: string;
  bio?: string;
  location?: string;
  blog?: string;
  company?: string;
  twitter_username?: string;
  avatar_url: string;
  followers: number;
  following: number;
  public_repos: number;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description?: string;
  language?: string;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  topics: string[];
  homepage?: string;
  html_url: string;
  updated_at: string;
}

@Injectable()
export class GitHubService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      timeout: 10000,
      httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
    });
  }

  async getUserInfo(token: string): Promise<GitHubUserInfo | null> {
    try {
      const response = await this.client.get<GitHubUserInfo>('/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('GitHub API error:', error.response?.data || error.message);
      // 详细记录错误信息以便调试
      if (error.response) {
        console.error('GitHub API error status:', error.response.status);
        console.error('GitHub API error data:', error.response.data);
      }
      return null;
    }
  }

  async getUserRepos(
    token: string,
    options: {
      page?: number;
      per_page?: number;
      sort?: string;
      direction?: string;
      type?: string;
    } = {},
  ): Promise<GitHubRepo[]> {
    try {
      const response = await this.client.get<GitHubRepo[]>('/user/repos', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: options.page || 1,
          per_page: options.per_page || 20,
          sort: options.sort || 'updated',
          direction: options.direction || 'desc',
          type: options.type || 'all',
        },
      });
      return response.data;
    } catch (error) {
      console.error('GitHub API error:', error);
      throw new NotFoundException('Failed to fetch repositories');
    }
  }

  async getUserLanguages(token: string): Promise<Record<string, number>> {
    const repos = await this.getUserRepos(token, { per_page: 100 });
    const languages: Record<string, number> = {};

    for (const repo of repos) {
      if (repo.language) {
        languages[repo.language] = (languages[repo.language] || 0) + 1;
      }
    }

    return languages;
  }

  async updateProfile(
    token: string,
    data: {
      bio?: string;
      location?: string;
      blog?: string;
      company?: string;
      twitter_username?: string;
    },
  ): Promise<GitHubUserInfo> {
    try {
      console.log('Updating GitHub profile with data:', data);
      console.log('Using GitHub token:', token.substring(0, 10) + '...'); // Log first 10 chars for debugging
      
      const response = await this.client.patch<GitHubUserInfo>('/user', data, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      });
      
      console.log('GitHub profile updated successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('GitHub API error status:', error.response?.status);
      console.error('GitHub API error data:', error.response?.data);
      console.error('GitHub API error message:', error.message);
      throw new NotFoundException('Failed to update profile');
    }
  }

  async getRateLimit(token: string): Promise<{ remaining: number; limit: number }> {
    try {
      const response = await this.client.get('/rate_limit', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return {
        remaining: response.data.resources.core.remaining,
        limit: response.data.resources.core.limit,
      };
    } catch (error) {
      return { remaining: 0, limit: 5000 };
    }
  }
}
