import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SyncProfileDto {
  @ApiProperty({ description: 'Bio text', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ description: 'Location', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Blog URL', required: false })
  @IsOptional()
  @IsString()
  blog?: string;

  @ApiProperty({ description: 'Company', required: false })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiProperty({ description: 'Twitter username', required: false })
  @IsOptional()
  @IsString()
  twitterUsername?: string;
}
