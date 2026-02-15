import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { GitHubService } from './github.service';
export declare class AuthService {
    private readonly jwtService;
    private readonly prisma;
    private readonly redis;
    private readonly githubService;
    constructor(jwtService: JwtService, prisma: PrismaService, redis: RedisService, githubService: GitHubService);
    validateGitHubToken(token: string): Promise<{
        isValid: boolean;
        userInfo: {
            id: string;
            githubId: string;
            username: string;
            displayName: string;
            email: string;
            bio: string;
            location: string;
            blog: string;
            company: string;
            twitterUsername: string;
            avatarUrl: string;
            followers: number;
            following: number;
            publicRepos: number;
            stars: number;
            languages: string[];
            createdAt: string;
            updatedAt: string;
        };
        scopes: string[];
        jwtToken: string;
        expiresIn: number;
    }>;
    validateUser(userId: string): Promise<any>;
}
