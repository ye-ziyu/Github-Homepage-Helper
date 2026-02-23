import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { RedisService } from '../../../common/redis/redis.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Processor('image-generation')
export class ImageQueueProcessor {
  private readonly logger = new Logger(ImageQueueProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
  ) {}

  @Process('generate-avatar')
  async handleAvatarGeneration(job: Job) {
    const { userId, config, jobId, historyId } = job.data;

    this.logger.log(`Processing avatar generation for user ${userId}, job: ${jobId}`);

    try {
      await this.updateProgress(historyId, 10);
      await this.updateJobCache(jobId, 10);

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      await this.updateProgress(historyId, 30);
      await this.updateJobCache(jobId, 30);

      const prompt = this.buildPrompt(user, config);
      this.logger.log(`Generated prompt: ${prompt}`);

      const imageUrl = await this.generateImageWithAPIEasy(prompt, config);

      await this.updateProgress(historyId, 80);
      await this.updateJobCache(jobId, 80);

      const result = {
        imageUrl,
        prompt,
        style: config?.style || 'realistic',
      };

      await this.prisma.generationHistory.update({
        where: { id: historyId },
        data: {
          status: 'completed',
          progress: 100,
          outputResult: JSON.stringify(result),
        },
      });

      await this.updateProgress(historyId, 100);
      await this.updateJobCache(jobId, 100, result);

      setTimeout(() => {
        this.redis.del(`job:${jobId}`);
      }, 3600000);

      return result;
    } catch (error: any) {
      this.logger.error(`Avatar generation failed: ${error.message}`);
      if (error.response?.data) {
        this.logger.error(`Full error: ${JSON.stringify(error.response.data)}`);
      }

      await this.prisma.generationHistory.update({
        where: { id: historyId },
        data: {
          status: 'failed',
          errorMessage: error.message,
        },
      });

      await this.updateJobCache(jobId, 100, null, error.message);

      throw error;
    }
  }

  private buildPrompt(user: any, config: any): string {
    const displayName = user.displayName || user.username;
    const bio = user.bio || '';
    const company = user.company || '';
    const location = user.location || '';
    const style = config?.style || 'realistic';

    let stylePrompt = '';
    switch (style) {
      case 'realistic':
        stylePrompt = 'photorealistic professional portrait photo, high quality, studio lighting, sharp focus';
        break;
      case 'cartoon':
        stylePrompt = 'cute cartoon style avatar, vibrant colors, clean lines, modern design';
        break;
      case 'pixel':
        stylePrompt = '8-bit pixel art style character portrait, retro game aesthetic';
        break;
      case 'illustration':
        stylePrompt = 'digital illustration style, artistic portrait, detailed, creative';
        break;
      case 'minimal':
        stylePrompt = 'minimalist design, simple geometric shapes, clean and elegant';
        break;
      default:
        stylePrompt = 'professional portrait, high quality';
    }

    const basePrompt = `Professional GitHub profile avatar for ${displayName}`;
    const contextInfo = [
      bio ? `developer background: ${bio.substring(0, 100)}` : '',
      company ? `at ${company}` : '',
      location ? `from ${location}` : '',
    ].filter(Boolean).join(', ');

    const gender = config?.gender;
    const ageGroup = config?.ageGroup;
    const accessories = config?.accessories || [];
    const expression = config?.expression;

    const extraDetails = [];
    if (gender && gender !== 'undefined') {
      extraDetails.push(gender === 'male' ? 'male' : gender === 'female' ? 'female' : 'neutral gender');
    }
    if (ageGroup) {
      extraDetails.push(ageGroup === 'young' ? 'young appearance' : ageGroup === 'adult' ? 'adult appearance' : 'mature appearance');
    }
    if (accessories.length > 0) {
      const accessoryMap: Record<string, string> = {
        glasses: 'wearing glasses',
        headphones: 'wearing headphones',
        hat: 'wearing a hat',
        scarf: 'wearing a scarf',
      };
      accessories.forEach((acc: string) => {
        if (accessoryMap[acc]) extraDetails.push(accessoryMap[acc]);
      });
    }
    if (expression) {
      const expressionMap: Record<string, string> = {
        happy: 'happy expression',
        smile: 'smiling',
        neutral: 'neutral expression',
        serious: 'serious look',
        cool: 'cool expression',
      };
      if (expressionMap[expression]) extraDetails.push(expressionMap[expression]);
    }

    const extraDetailsStr = extraDetails.join(', ');

    return `${basePrompt}, ${contextInfo ? `(${contextInfo})` : ''}, ${stylePrompt}, ${extraDetailsStr}, professional social media profile picture, facing camera, white background, high quality, 8k`;
  }

  private async generateImageWithAPIEasy(prompt: string, config: any): Promise<string> {
    const apiKey = this.configService.get<string>('API_EASY_KEY');
    const apiUrl = this.configService.get<string>('API_EASY_URL') || 'https://api.apiyi.com/v1/images/generations';

    if (!apiKey || apiKey === 'your_api_easy_key_here') {
      throw new Error('API_EASY_KEY not configured. Please configure your API Easy Key in .env file. Get your key at https://api.apiyi.com');
    }

    const size = config?.size || '1024x1024';
    const model = config?.model || 'dall-e-3';

    this.logger.log(`Calling API Easy: ${apiUrl}, model: ${model}, size: ${size}`);
    this.logger.log(`Prompt: ${prompt}`);

    try {
      const requestBody: any = {
        model: model,
        prompt: prompt,
        n: 1,
        size: size,
      };

      if (model === 'dall-e-3') {
        requestBody.quality = 'standard';
      }

      const response = await axios.post(
        apiUrl,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          timeout: 120000,
        }
      );

      this.logger.log(`API response status: ${response.status}`);

      if (response.data?.data && response.data.data.length > 0) {
        const imageUrl = response.data.data[0].url;
        this.logger.log(`Generated image URL: ${imageUrl}`);
        return imageUrl;
      }

      throw new Error('No image URL in response');
    } catch (error: any) {
      this.logger.error(`API Easy request failed: ${error.message}`);
      if (error.response?.data) {
        this.logger.error(`Error details: ${JSON.stringify(error.response.data)}`);
        throw new Error(`Image generation failed: ${error.response.data.error?.message || error.message}`);
      }
      throw new Error(`Image generation failed: ${error.message}`);
    }
  }

  private async updateProgress(historyId: string, progress: number) {
    try {
      await this.prisma.generationHistory.update({
        where: { id: historyId },
        data: { progress },
      });
    } catch (error: any) {
      this.logger.warn(`Failed to update progress in DB: ${error.message}`);
    }
  }

  private async updateJobCache(
    jobId: string,
    progress: number,
    result?: any,
    error?: string
  ) {
    try {
      const status = {
        status: error ? 'failed' : (progress === 100 ? 'completed' : 'processing'),
        progress,
        result,
        error,
      };
      await this.redis.set(`job:${jobId}`, JSON.stringify(status), 3600);
    } catch (error: any) {
      this.logger.warn(`Failed to update job cache: ${error.message}`);
    }
  }
}
