import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { GenerateAvatarDto } from './dto/generate-avatar.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImageService {
  constructor(
    @InjectQueue('image-generation') private imageQueue: Queue,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async generateAvatar(userId: string, generateAvatarDto: GenerateAvatarDto) {
    const jobId = uuidv4();

    // Create generation history
    const history = await this.prisma.generationHistory.create({
      data: {
        userId,
        generationType: 'avatar',
        inputConfig: {
          userInfo: generateAvatarDto.userInfo,
          config: generateAvatarDto.config
        } as any,
        status: 'pending',
        taskId: jobId,
      },
    });

    // Add to queue
    await this.imageQueue.add('generate-avatar', {
      userId,
      config: generateAvatarDto.config,
      jobId,
      historyId: history.id,
    });

    return {
      jobId,
      status: 'pending',
      estimatedTime: 30,
      createdAt: new Date().toISOString(),
    };
  }

  async getStyles() {
    return [
      {
        id: 'realistic',
        name: 'Realistic',
        description: 'Photorealistic portrait',
        preview: '/styles/realistic.jpg',
      },
      {
        id: 'cartoon',
        name: 'Cartoon',
        description: 'Cartoon style avatar',
        preview: '/styles/cartoon.jpg',
      },
      {
        id: 'pixel',
        name: 'Pixel Art',
        description: '8-bit pixel art style',
        preview: '/styles/pixel.jpg',
      },
      {
        id: 'illustration',
        name: 'Illustration',
        description: 'Digital illustration style',
        preview: '/styles/illustration.jpg',
      },
      {
        id: 'minimal',
        name: 'Minimalist',
        description: 'Clean and simple design',
        preview: '/styles/minimal.jpg',
      },
    ];
  }
}
