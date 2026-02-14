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
    // Verify token with GitHub
    const userInfo = await this.githubService.getUserInfo(token);

    if (!userInfo) {
      throw new UnauthorizedException('Invalid GitHub token');
    }

    // Check if user exists in database
    let user = await this.prisma.user.findUnique({
      where: { githubId: userInfo.id.toString() },
      include: { preferencesRel: true },
    });

    // Create user if not exists
    if (!user) {
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
    } else {
      // Update user info
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
          followers: userInfo.followers,
          following: userInfo.following,
          publicRepos: userInfo.public_repos,
          lastSyncAt: new Date(),
        },
        include: { preferencesRel: true },
      });

      // Cache user info
      await this.redis.set(
        `user:${user.id}`,
        JSON.stringify(user),
        3600, // 1 hour
      );
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
  }

  async validateUser(userId: string) {
    const cached = await this.redis.get(`user:${userId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      await this.redis.set(`user:${userId}`, JSON.stringify(user), 3600);
    }

    return user;
  }
}
