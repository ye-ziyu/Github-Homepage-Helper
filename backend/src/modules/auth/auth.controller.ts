import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ValidateTokenDto } from './dto/validate-token.dto';

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
}
