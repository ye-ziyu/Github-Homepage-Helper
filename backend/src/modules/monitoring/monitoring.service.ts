import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class MonitoringService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

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

  private async checkDatabase() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'up',
        latency: Date.now(),
      };
    } catch (error) {
      return {
        status: 'down',
        error: error.message,
      };
    }
  }

  private async checkRedis() {
    try {
      const start = Date.now();
      await this.redis.getClient().ping();
      return {
        status: 'up',
        latency: Date.now() - start,
      };
    } catch (error) {
      return {
        status: 'down',
        error: error.message,
      };
    }
  }
}
