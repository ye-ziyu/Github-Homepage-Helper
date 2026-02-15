import { Job } from 'bull';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { RedisService } from '../../../common/redis/redis.service';
export declare class BioQueueProcessor {
    private readonly prisma;
    private readonly redis;
    private readonly logger;
    constructor(prisma: PrismaService, redis: RedisService);
    handleBioGeneration(job: Job): Promise<{
        bio: string;
        wordCount: number;
        characterCount: number;
    }>;
    private generateBioContent;
    private updateProgress;
    private updateJobCache;
}
