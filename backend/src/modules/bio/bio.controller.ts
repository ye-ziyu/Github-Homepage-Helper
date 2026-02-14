import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BioService } from './bio.service';
import { GenerateBioDto } from './dto/generate-bio.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Bio')
@Controller('bio')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BioController {
  constructor(private readonly bioService: BioService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate bio (async)' })
  async generateBio(
    @GetUser() user: any,
    @Body() generateBioDto: GenerateBioDto,
  ) {
    return this.bioService.generateBio(user.id, generateBioDto);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get bio templates' })
  async getTemplates() {
    return this.bioService.getTemplates();
  }

  @Get('jobs/:jobId')
  @ApiOperation({ summary: 'Get job status' })
  async getJobStatus(@Param('jobId') jobId: string) {
    return this.bioService.getJobStatus(jobId);
  }
}
