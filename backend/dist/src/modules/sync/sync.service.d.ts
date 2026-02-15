import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { AuthService } from '../auth/auth.service';
import { GitHubService } from '../auth/github.service';
import { SyncProfileDto } from './dto/sync-profile.dto';
export declare class SyncService {
    private readonly prisma;
    private readonly redis;
    private readonly authService;
    private readonly githubService;
    constructor(prisma: PrismaService, redis: RedisService, authService: AuthService, githubService: GitHubService);
    syncProfile(userId: string, syncProfileDto: SyncProfileDto): Promise<{
        success: boolean;
        profile: import("../auth/github.service").GitHubUserInfo;
    }>;
    syncReadme(userId: string, body: {
        owner: string;
        repo: string;
        content: string;
        commitMessage?: string;
    }): Promise<{
        success: boolean;
        message: string;
        url: string;
    }>;
    createPullRequest(userId: string, body: any): Promise<{
        success: boolean;
        message: string;
        url: string;
    }>;
}
