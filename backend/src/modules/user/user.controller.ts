import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('User')
@Controller('user')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('info')
  @ApiOperation({ summary: 'Get user info' })
  async getUserInfo(
    @GetUser() user: any,
    @Query('refresh') refresh?: string,
  ) {
    return this.userService.getUserInfo(user.id, refresh === 'true');
  }

  @Get('repos')
  @ApiOperation({ summary: 'Get user repositories' })
  async getUserRepos(
    @GetUser() user: any,
    @Query('cursor') cursor?: string,
    @Query('page_size') page_size?: string,
    @Query('sort') sort?: string,
    @Query('direction') direction?: string,
  ) {
    return this.userService.getUserRepos(user.id, {
      cursor,
      page_size: page_size ? parseInt(page_size) : 20,
      sort,
      direction,
    });
  }

  @Get('languages')
  @ApiOperation({ summary: 'Get user language stats' })
  async getUserLanguages(@GetUser() user: any) {
    return this.userService.getUserLanguages(user.id);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user stats' })
  async getUserStats(@GetUser() user: any) {
    return this.userService.getUserStats(user.id);
  }
}
