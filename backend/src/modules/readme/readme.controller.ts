import { Controller, Post, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReadmeService } from './readme.service';
import { GenerateReadmeDto } from './dto/generate-readme.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('README')
@Controller('readme')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReadmeController {
  constructor(private readonly readmeService: ReadmeService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate README' })
  async generateReadme(
    @GetUser() user: any,
    @Body() generateReadmeDto: GenerateReadmeDto,
  ) {
    return this.readmeService.generateReadme(user.id, generateReadmeDto);
  }

  @Post('preview')
  @ApiOperation({ summary: 'Preview README' })
  async previewReadme(
    @GetUser() user: any,
    @Body() generateReadmeDto: GenerateReadmeDto,
  ) {
    return this.readmeService.previewReadme(user.id, generateReadmeDto);
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get README templates' })
  async getTemplates() {
    return this.readmeService.getTemplates();
  }
}
