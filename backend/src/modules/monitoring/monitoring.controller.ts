import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MonitoringService } from './monitoring.service';

@ApiTags('Monitoring')
@Controller()
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  async healthCheck() {
    return this.monitoringService.getHealth();
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Prometheus metrics' })
  async getMetrics() {
    return this.monitoringService.getMetrics();
  }

  @Get('version')
  @ApiOperation({ summary: 'Version info' })
  async getVersion() {
    return this.monitoringService.getVersion();
  }
}
