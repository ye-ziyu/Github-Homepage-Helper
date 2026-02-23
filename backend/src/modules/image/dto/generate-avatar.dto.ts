import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsArray, IsString, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export type ImageStyle = 'realistic' | 'cartoon' | 'pixel' | 'illustration' | 'minimal';
export type ImageGender = 'male' | 'female' | 'neutral' | 'undefined';
export type ImageAgeGroup = 'young' | 'adult' | 'mature';

export class AvatarConfigDto {
  @ApiProperty({ description: 'Style', enum: ['realistic', 'cartoon', 'pixel', 'illustration', 'minimal'] })
  @IsEnum(['realistic', 'cartoon', 'pixel', 'illustration', 'minimal'])
  style: ImageStyle;

  @ApiProperty({ description: 'Gender', required: false, enum: ['male', 'female', 'neutral', 'undefined'] })
  @IsOptional()
  @IsEnum(['male', 'female', 'neutral', 'undefined'])
  gender?: ImageGender;

  @ApiProperty({ description: 'Age group', required: false, enum: ['young', 'adult', 'mature'] })
  @IsOptional()
  @IsEnum(['young', 'adult', 'mature'])
  ageGroup?: ImageAgeGroup;

  @ApiProperty({ description: 'Accessories', required: false, isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accessories?: string[];

  @ApiProperty({ description: 'Clothing', required: false })
  @IsOptional()
  @IsString()
  clothing?: string;

  @ApiProperty({ description: 'Expression', required: false })
  @IsOptional()
  @IsString()
  expression?: string;

  @ApiProperty({ description: 'Background color', required: false })
  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @ApiProperty({ description: 'Image size', required: false, example: '1024x1024' })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiProperty({ description: 'AI model', required: false, example: 'dall-e-3' })
  @IsOptional()
  @IsString()
  model?: string;
}

export class GenerateAvatarDto {
  @ApiProperty({ description: 'User info (optional)', required: false })
  @IsOptional()
  @IsObject()
  userInfo?: any;

  @ApiProperty({ description: 'Avatar configuration', type: AvatarConfigDto })
  @ValidateNested()
  @Type(() => AvatarConfigDto)
  config: AvatarConfigDto;
}
