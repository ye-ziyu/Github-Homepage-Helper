import { MonitoringService } from './monitoring.service';
export declare class MonitoringController {
    private readonly monitoringService;
    constructor(monitoringService: MonitoringService);
    healthCheck(): Promise<{
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
}
