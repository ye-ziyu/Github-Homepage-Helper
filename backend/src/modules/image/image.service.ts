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

  async getJobStatus(jobId: string) {
    const cached = await this.redis.get(`job:${jobId}`);
    if (cached) {
      const status = JSON.parse(cached);
      return {
        status: status.status,
        progress: status.progress,
        result: status.result,
        error: status.error,
      };
    }

    const history = await this.prisma.generationHistory.findFirst({
      where: { taskId: jobId },
    });

    if (!history) {
      return {
        status: 'not_found',
        progress: 0,
        result: null,
        error: 'Job not found',
      };
    }

    return {
      status: history.status,
      progress: history.progress,
      result: history.outputResult ? JSON.parse(history.outputResult) : null,
      error: history.errorMessage,
    };
  }

  async getStyles() {
    return [
      {
        id: 'realistic',
        name: '写实',
        description: '逼真的摄影风格人像',
        preview: '/styles/realistic.jpg',
      },
      {
        id: 'cartoon',
        name: '卡通',
        description: '可爱的卡通风格头像',
        preview: '/styles/cartoon.jpg',
      },
      {
        id: 'pixel',
        name: '像素',
        description: '8-bit像素艺术风格',
        preview: '/styles/pixel.jpg',
      },
      {
        id: 'illustration',
        name: '插画',
        description: '数字插画艺术风格',
        preview: '/styles/illustration.jpg',
      },
      {
        id: 'minimal',
        name: '极简',
        description: '简洁优雅的设计',
        preview: '/styles/minimal.jpg',
      },
    ];
  }

  async getModels() {
    return [
      {
        id: 'dall-e-3',
        name: 'DALL-E 3',
        description: '高质量图像生成，支持hd高清',
      },
      {
        id: 'dall-e-2',
        name: 'DALL-E 2',
        description: '经典图像生成，快速响应',
      },
      {
        id: 'sd-3.5',
        name: 'Stable Diffusion 3.5',
        description: '开源图像模型，创意生成',
      },
      {
        id: 'midjourney-v6',
        name: 'Midjourney V6',
        description: '艺术风格图像生成',
      },
    ];
  }
}
