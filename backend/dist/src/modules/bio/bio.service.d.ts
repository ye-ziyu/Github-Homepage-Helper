import { Queue } from 'bull';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { GenerateBioDto } from './dto/generate-bio.dto';
export declare class BioService {
    private bioQueue;
    private readonly prisma;
    private readonly redis;
    constructor(bioQueue: Queue, prisma: PrismaService, redis: RedisService);
    generateBio(userId: string, generateBioDto: GenerateBioDto): Promise<{
        jobId: any;
        status: string;
        estimatedTime: number;
        createdAt: string;
    }>;
    getJobStatus(jobId: string): Promise<any>;
    getTemplates(): Promise<{
        id: string;
        name: string;
        description: string;
        template: string;
    }[]>;
}
