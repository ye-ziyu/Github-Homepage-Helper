import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { SyncProfileDto } from './dto/sync-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Sync')
@Controller('sync')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('profile')
  @ApiOperation({ summary: 'Sync profile to GitHub' })
  async syncProfile(
    @GetUser() user: any,
    @Body() syncProfileDto: SyncProfileDto,
  ) {
    return this.syncService.syncProfile(user.id, syncProfileDto);
  }

  @Post('readme')
  @ApiOperation({ summary: 'Sync README to GitHub' })
  async syncReadme(
    @GetUser() user: any,
    @Body() body: { owner: string; repo: string; content: string; commitMessage?: string },
  ) {
    return this.syncService.syncReadme(user.id, body);
  }

  @Post('pull-request')
  @ApiOperation({ summary: 'Create Pull Request' })
  async createPullRequest(
    @GetUser() user: any,
    @Body() body: any,
  ) {
    return this.syncService.createPullRequest(user.id, body);
  }
}
