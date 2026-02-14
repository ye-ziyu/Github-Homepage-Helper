import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly authService: AuthService,
  ) {}

  async getUserInfo(userId: string, refresh = false) {
    const cacheKey = `user:${userId}:info`;

    // Check cache if not refreshing
    if (!refresh) {
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { preferencesRel: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userInfo = {
      id: user.id,
      githubId: user.githubId,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      bio: user.bio,
      location: user.location,
      blog: user.blog,
      company: user.company,
      twitterUsername: user.twitterUsername,
      avatarUrl: user.avatarUrl,
      followers: user.followers,
      following: user.following,
      publicRepos: user.publicRepos,
      stars: user.stars,
      languages: user.languages as string[],
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    // Cache for 5 minutes
    await this.redis.set(cacheKey, JSON.stringify(userInfo), 300);

    return userInfo;
  }

  async getUserRepos(
    userId: string,
    options: {
      cursor?: string;
      page_size: number;
      sort?: string;
      direction?: string;
    },
  ) {
    const cacheKey = `user:${userId}:repos:${options.cursor || '0'}:${options.page_size}`;

    // Check cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // In production, fetch from GitHub API
    // For now, return empty array
    const result = {
      repos: [],
      pagination: {
        next_cursor: null,
        prev_cursor: null,
        has_more: false,
        total: user.publicRepos,
      },
    };

    // Cache for 30 minutes
    await this.redis.set(cacheKey, JSON.stringify(result), 1800);

    return result;
  }

  async getUserLanguages(userId: string) {
    const cacheKey = `user:${userId}:languages`;

    // Check cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const languages = user.languages as Array<{
      name: string;
      bytes: number;
      percentage: number;
      repos: number;
    }>;

    const result = {
      languages: languages || [],
      cachedAt: new Date().toISOString(),
    };

    // Cache for 1 hour
    await this.redis.set(cacheKey, JSON.stringify(result), 3600);

    return result;
  }

  async getUserStats(userId: string) {
    const cacheKey = `user:${userId}:stats`;

    // Check cache
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const result = {
      followers: user.followers,
      following: user.following,
      publicRepos: user.publicRepos,
      totalStarsReceived: user.stars,
      totalStarsGiven: 0,
      totalCommits: 0,
      totalPullRequests: 0,
      totalIssues: 0,
      contributionGraph: {
        total: 0,
        lastYear: 0,
        longestStreak: 0,
        currentStreak: 0,
      },
      cachedAt: new Date().toISOString(),
    };

    // Cache for 5 minutes
    await this.redis.set(cacheKey, JSON.stringify(result), 300);

    return result;
  }
}
