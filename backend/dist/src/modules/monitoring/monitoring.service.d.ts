import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
export declare class MonitoringService {
    private readonly prisma;
    private readonly redis;
    constructor(prisma: PrismaService, redis: RedisService);
    getHealth(): Promise<{
        status: string;
        timestamp: string;
        uptime: number;
        services: {
            database: {
                status: string;
                latency: number;
                error?: undefined;
            } | {
                status: string;
                error: any;
                latency?: undefined;
            };
            redis: {
                status: string;
                latency: number;
                error?: undefined;
            } | {
                status: string;
                error: any;
                latency?: undefined;
            };
        };
        metrics: {
            memory: NodeJS.MemoryUsage;
            cpu: NodeJS.CpuUsage;
        };
    }>;
    getMetrics(): Promise<string>;
    getVersion(): Promise<{
        version: string;
        buildDate: string;
        gitCommit: string;
        apiVersion: string;
        environment: string;
    }>;
    private checkDatabase;
    private checkRedis;
}
