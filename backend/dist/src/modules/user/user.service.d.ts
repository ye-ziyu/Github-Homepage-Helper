import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { AuthService } from '../auth/auth.service';
export declare class UserService {
    private readonly prisma;
    private readonly redis;
    private readonly authService;
    constructor(prisma: PrismaService, redis: RedisService, authService: AuthService);
    getUserInfo(userId: string, refresh?: boolean): Promise<any>;
    getUserRepos(userId: string, options: {
        cursor?: string;
        page_size: number;
        sort?: string;
        direction?: string;
    }): Promise<any>;
    getUserLanguages(userId: string): Promise<any>;
    getUserStats(userId: string): Promise<any>;
}
