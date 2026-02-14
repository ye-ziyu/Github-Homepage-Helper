import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsArray, IsString } from 'class-validator';

export type ImageStyle = 'realistic' | 'cartoon' | 'pixel' | 'illustration' | 'minimal';
export type ImageGender = 'male' | 'female' | 'neutral' | 'undefined';
export type ImageAgeGroup = 'young' | 'adult' | 'mature';

export class GenerateAvatarDto {
  @ApiProperty({ description: 'User info (optional)' })
  @IsOptional()
  userInfo?: any;

  @ApiProperty({
    description: 'Avatar configuration',
    example: {
      style: 'realistic',
      gender: 'undefined',
      ageGroup: 'adult',
    },
  })
  config: {
    style: ImageStyle;
    gender?: ImageGender;
    ageGroup?: ImageAgeGroup;
    accessories?: string[];
    clothing?: string;
    expression?: string;
    backgroundColor?: string;
    size?: string;
  };
}
