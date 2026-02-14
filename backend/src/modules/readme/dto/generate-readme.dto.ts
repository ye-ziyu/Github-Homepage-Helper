import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsArray, IsObject } from 'class-validator';

export type ReadmeTheme = 'light' | 'dark' | 'auto';

export class GenerateReadmeDto {
  @ApiProperty({ description: 'User info (optional)', required: true })
  @IsObject()
  userInfo: any;

  @ApiProperty({ description: 'Bio text (optional)' })
  @IsOptional()
  bio?: string;

  @ApiProperty({ description: 'Avatar URL (optional)' })
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({ description: 'Skills list (optional)' })
  @IsOptional()
  @IsArray()
  skills?: string[];

  @ApiProperty({ description: 'Projects list (optional)' })
  @IsOptional()
  projects?: any[];

  @ApiProperty({
    description: 'README configuration',
    example: {
      sections: ['header', 'about', 'skills'],
      theme: 'auto',
      showStats: true,
      showVisitors: true,
    },
  })
  @IsObject()
  config: {
    sections?: string[];
    theme?: ReadmeTheme;
    showStats?: boolean;
    showVisitors?: boolean;
  };
}
