"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MonitoringService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const redis_service_1 = require("../../common/redis/redis.service");
let MonitoringService = class MonitoringService {
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async getHealth() {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            services: {
                database: await this.checkDatabase(),
                redis: await this.checkRedis(),
            },
            metrics: {
                memory: process.memoryUsage(),
                cpu: process.cpuUsage(),
            },
        };
        if (health.services.database.status !== 'up' || health.services.redis.status !== 'up') {
            health.status = 'degraded';
        }
        return health;
    }
    async getMetrics() {
        return `# HELP api_requests_total Total API requests
# TYPE api_requests_total counter
api_requests_total{endpoint="/api/v1/health",method="GET",status="200"} 12345

# HELP api_request_duration_seconds API request duration
# TYPE api_request_duration_seconds histogram
api_request_duration_seconds_bucket{le="0.1"} 100
api_request_duration_seconds_bucket{le="0.5"} 500
api_request_duration_seconds_bucket{le="1.0"} 800
api_request_duration_seconds_bucket{le="+Inf"} 1000
api_request_duration_seconds_sum 450
api_request_duration_seconds_count 1000
`;
    }
    async getVersion() {
        return {
            version: '1.0.0',
            buildDate: new Date().toISOString(),
            gitCommit: 'dev',
            apiVersion: 'v1',
            environment: process.env.NODE_ENV || 'development',
        };
    }
    async checkDatabase() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return {
                status: 'up',
                latency: Date.now(),
            };
        }
        catch (error) {
            return {
                status: 'down',
                error: error.message,
            };
        }
    }
    async checkRedis() {
        try {
            const start = Date.now();
            await this.redis.getClient().ping();
            return {
                status: 'up',
                latency: Date.now() - start,
            };
        }
        catch (error) {
            return {
                status: 'down',
                error: error.message,
            };
        }
    }
};
exports.MonitoringService = MonitoringService;
exports.MonitoringService = MonitoringService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], MonitoringService);
//# sourceMappingURL=monitoring.service.js.map