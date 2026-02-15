import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ValidateTokenDto } from './dto/validate-token.dto';
import { UpdateGitHubTokenDto } from './dto/update-github-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Validate GitHub token' })
  async validateToken(@Body() validateTokenDto: ValidateTokenDto) {
    return this.authService.validateGitHubToken(validateTokenDto.token);
  }

  @Post('update-github-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update GitHub token' })
  async updateGitHubToken(@Request() req: any, @Body() updateGitHubTokenDto: UpdateGitHubTokenDto) {
    const userId = req.user.userId;
    return this.authService.updateGitHubToken(userId, updateGitHubTokenDto.token);
  }
}
