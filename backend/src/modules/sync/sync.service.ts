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
    try {
      console.log('Syncing profile for user:', userId);
      console.log('Profile data:', syncProfileDto);
      
      // Get user's GitHub token
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      console.log('Found user:', user);
      const token = user?.githubToken || '';
      console.log('GitHub token:', token ? token.substring(0, 10) + '...' : 'No token found');

      let updatedProfile = null;

      // Only update GitHub profile if token is available
      if (token) {
        try {
          console.log('Updating GitHub profile...');
          // Update GitHub profile
          updatedProfile = await this.githubService.updateProfile(token, {
            bio: syncProfileDto.bio,
            location: syncProfileDto.location,
            blog: syncProfileDto.blog,
            company: syncProfileDto.company,
            twitter_username: syncProfileDto.twitterUsername,
          });
          console.log('GitHub profile updated successfully:', updatedProfile);
        } catch (error) {
          // If GitHub update fails, continue with local update
          console.error('Failed to update GitHub profile:', error);
        }
      } else {
        console.log('No GitHub token available, skipping GitHub update');
      }

      // Always update local database
      console.log('Updating local database...');
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
      console.log('Local database updated successfully');

      // Invalidate cache
      await this.redis.del(`user:${userId}:info`);
      console.log('Cache invalidated');

      return { success: true, profile: updatedProfile };
    } catch (error) {
      console.error('Error syncing profile:', error);
      return { success: false, error: 'Failed to sync profile' };
    }
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
