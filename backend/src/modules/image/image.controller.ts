import { Controller, Post, Get, Body } from '@nestjs/common';
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
  @ApiOperation({ summary: 'Generate avatar (async)' })
  async generateAvatar(
    @GetUser() user: any,
    @Body() generateAvatarDto: GenerateAvatarDto,
  ) {
    return this.imageService.generateAvatar(user.id, generateAvatarDto);
  }

  @Get('styles')
  @ApiOperation({ summary: 'Get available styles' })
  async getStyles() {
    return this.imageService.getStyles();
  }
}
