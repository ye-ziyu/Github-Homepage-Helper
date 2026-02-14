import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsBoolean, IsOptional, IsObject } from 'class-validator';

export type BioStyle = 'professional' | 'casual' | 'humorous' | 'minimal';
export type BioLanguage = 'zh' | 'en' | 'bilingual';
export type BioLength = 'short' | 'medium' | 'long';

export class GenerateBioDto {
  @ApiProperty({ description: 'User info (optional)' })
  @IsOptional()
  @IsObject()
  userInfo?: any;

  @ApiProperty({ description: 'Skills (optional)' })
  @IsOptional()
  @IsObject()
  skills?: any;

  @ApiProperty({ description: 'Projects (optional)' })
  @IsOptional()
  projects?: any[];

  @ApiProperty({
    description: 'Bio configuration',
    example: {
      language: 'zh',
      style: 'professional',
      length: 'medium',
    },
  })
  @IsObject()
  config: {
    language: BioLanguage;
    style: BioStyle;
    length: BioLength;
    includeStats?: boolean;
    includeSkills?: boolean;
    includeProjects?: boolean;
  };

  @ApiProperty({ default: true, description: 'Process asynchronously' })
  @IsOptional()
  @IsBoolean()
  async?: boolean;
}
