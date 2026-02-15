import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { GitHubService } from './github.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly githubService: GitHubService,
  ) {}

  async validateGitHubToken(token: string) {
    try {
      console.log('Validating GitHub token:', token.substring(0, 10) + '...');
      
      // Verify token with GitHub
      const userInfo = await this.githubService.getUserInfo(token);

      if (!userInfo) {
        throw new UnauthorizedException('Invalid GitHub token');
      }

      console.log('GitHub user info:', userInfo);

      // Check if user exists in database
      let user = await this.prisma.user.findUnique({
        where: { githubId: userInfo.id.toString() },
        include: { preferencesRel: true },
      });

      console.log('Found user:', user);

      // Create user if not exists
      if (!user) {
        console.log('Creating new user with GitHub token:', token.substring(0, 10) + '...');
        user = await this.prisma.user.create({
          data: {
            githubId: userInfo.id.toString(),
            username: userInfo.login,
            displayName: userInfo.name,
            email: userInfo.email,
            bio: userInfo.bio,
            location: userInfo.location,
            blog: userInfo.blog,
            company: userInfo.company,
            twitterUsername: userInfo.twitter_username,
            avatarUrl: userInfo.avatar_url,
            githubToken: token, // Store GitHub token
            followers: userInfo.followers,
            following: userInfo.following,
            publicRepos: userInfo.public_repos,
            lastSyncAt: new Date(),
            preferencesRel: {
              create: {},
            },
          },
          include: { preferencesRel: true },
        });
        console.log('Created new user:', user);
      } else {
        // Update user info
        console.log('Updating existing user with GitHub token:', token.substring(0, 10) + '...');
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            displayName: userInfo.name || user.displayName,
            email: userInfo.email || user.email,
            bio: userInfo.bio,
            location: userInfo.location,
            blog: userInfo.blog,
            company: userInfo.company,
            twitterUsername: userInfo.twitter_username,
            avatarUrl: userInfo.avatar_url,
            githubToken: token, // Update GitHub token
            followers: userInfo.followers,
            following: userInfo.following,
            publicRepos: userInfo.public_repos,
            lastSyncAt: new Date(),
          },
          include: { preferencesRel: true },
        });
        console.log('Updated existing user:', user);

        // Cache user info
        await this.redis.set(
          `user:${user.id}`,
          JSON.stringify(user),
          3600, // 1 hour
        );
        console.log('Cached user info');
      }

      // Generate JWT
      const jwtToken = this.jwtService.sign({
        userId: user.id,
        githubId: user.githubId,
        username: user.username,
      });

      return {
        isValid: true,
        userInfo: {
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
        },
        scopes: ['user', 'repo'],
        jwtToken,
        expiresIn: 86400, // 24 hours in seconds
      };
    } catch (error) {
      console.error('Error validating GitHub token:', error);
      throw error;
    }
  }

  async validateUser(userId: string) {
    // Always get fresh user info from database to ensure we have the latest githubToken
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      // Update cache with fresh user info
      await this.redis.set(`user:${userId}`, JSON.stringify(user), 3600);
    }

    return user;
  }

  async updateGitHubToken(userId: string, githubToken: string) {
    try {
      console.log('Updating GitHub token for user:', userId);
      console.log('New GitHub token:', githubToken.substring(0, 10) + '...');
      
      // Verify token with GitHub
      const userInfo = await this.githubService.getUserInfo(githubToken);

      if (!userInfo) {
        throw new UnauthorizedException('Invalid GitHub token');
      }

      console.log('GitHub user info:', userInfo);

      // Update user's GitHub token in database
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          githubToken: githubToken,
          displayName: userInfo.name,
          email: userInfo.email,
          bio: userInfo.bio,
          location: userInfo.location,
          blog: userInfo.blog,
          company: userInfo.company,
          twitterUsername: userInfo.twitter_username,
          avatarUrl: userInfo.avatar_url,
          followers: userInfo.followers,
          following: userInfo.following,
          publicRepos: userInfo.public_repos,
          lastSyncAt: new Date(),
        },
        include: { preferencesRel: true },
      });

      console.log('Updated GitHub token successfully for user:', user);

      // Invalidate cache
      await this.redis.del(`user:${userId}`);
      console.log('Cache invalidated');

      return {
        success: true,
        message: 'GitHub token updated successfully',
      };
    } catch (error) {
      console.error('Error updating GitHub token:', error);
      throw error;
    }
  }
}
