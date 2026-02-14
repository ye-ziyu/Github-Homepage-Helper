import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { AuthService } from '../auth/auth.service';
import { GitHubService } from '../auth/github.service';
import { SyncProfileDto } from './dto/sync-profile.dto';

@Injectable()
export class SyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly authService: AuthService,
    private readonly githubService: GitHubService,
  ) {}

  async syncProfile(userId: string, syncProfileDto: SyncProfileDto) {
    // Get user's GitHub token
    // In production, retrieve encrypted token from database
    const token = ''; // Get from database

    if (!token) {
      throw new UnauthorizedException('GitHub token not found');
    }

    // Update GitHub profile
    const updatedProfile = await this.githubService.updateProfile(token, {
      bio: syncProfileDto.bio,
      location: syncProfileDto.location,
      blog: syncProfileDto.blog,
      company: syncProfileDto.company,
      twitter_username: syncProfileDto.twitterUsername,
    });

    // Update local database
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        bio: syncProfileDto.bio,
        location: syncProfileDto.location,
        blog: syncProfileDto.blog,
        company: syncProfileDto.company,
        twitterUsername: syncProfileDto.twitterUsername,
      },
    });

    // Invalidate cache
    await this.redis.del(`user:${userId}:info`);

    return { success: true, profile: updatedProfile };
  }

  async syncReadme(
    userId: string,
    body: { owner: string; repo: string; content: string; commitMessage?: string },
  ) {
    // Get user's GitHub token
    const token = ''; // Get from database

    if (!token) {
      throw new UnauthorizedException('GitHub token not found');
    }

    // Create or update README
    const contentBase64 = Buffer.from(body.content).toString('base64');

    // In production, use GitHub API to create/update file
    // For now, return success
    return {
      success: true,
      message: 'README synced successfully',
      url: `https://github.com/${body.owner}/${body.repo}/blob/main/README.md`,
    };
  }

  async createPullRequest(userId: string, body: any) {
    // Get user's GitHub token
    const token = ''; // Get from database

    if (!token) {
      throw new UnauthorizedException('GitHub token not found');
    }

    // In production, create PR using GitHub API
    return {
      success: true,
      message: 'Pull request created',
      url: `https://github.com/${body.owner}/${body.repo}/pull/${body.prNumber}`,
    };
  }
}
