import { Queue } from 'bull';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { GenerateAvatarDto } from './dto/generate-avatar.dto';
export declare class ImageService {
    private imageQueue;
    private readonly prisma;
    private readonly redis;
    constructor(imageQueue: Queue, prisma: PrismaService, redis: RedisService);
    generateAvatar(userId: string, generateAvatarDto: GenerateAvatarDto): Promise<{
        jobId: any;
        status: string;
        estimatedTime: number;
        createdAt: string;
    }>;
    getStyles(): Promise<{
        id: string;
        name: string;
        description: string;
        preview: string;
    }[]>;
}
