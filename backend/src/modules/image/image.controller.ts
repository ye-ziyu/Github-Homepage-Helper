import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ImageService } from './image.service';
import { GenerateAvatarDto } from './dto/generate-avatar.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Image')
@Controller('image')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('generate-avatar')
  @ApiOperation({ summary: 'Generate avatar using API Easy (async)' })
  async generateAvatar(
    @GetUser() user: any,
    @Body() generateAvatarDto: GenerateAvatarDto,
  ) {
    return this.imageService.generateAvatar(user.id, generateAvatarDto);
  }

  @Get('job-status/:jobId')
  @ApiOperation({ summary: 'Get image generation job status' })
  async getJobStatus(@Param('jobId') jobId: string) {
    return this.imageService.getJobStatus(jobId);
  }

  @Get('styles')
  @ApiOperation({ summary: 'Get available avatar styles' })
  async getStyles() {
    return this.imageService.getStyles();
  }

  @Get('models')
  @ApiOperation({ summary: 'Get available image generation models' })
  async getModels() {
    return this.imageService.getModels();
  }
}
