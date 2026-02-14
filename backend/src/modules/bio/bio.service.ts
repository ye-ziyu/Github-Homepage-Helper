import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';
import { GenerateBioDto } from './dto/generate-bio.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BioService {
  constructor(
    @InjectQueue('bio-generation') private bioQueue: Queue,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async generateBio(userId: string, generateBioDto: GenerateBioDto) {
    const jobId = uuidv4();

    // Create generation history
    const history = await this.prisma.generationHistory.create({
      data: {
        userId,
        generationType: 'bio',
        inputConfig: generateBioDto,
        status: 'pending',
        taskId: jobId,
      },
    });

    // Add to queue
    await this.bioQueue.add('generate-bio', {
      userId,
      config: generateBioDto.config,
      jobId,
      historyId: history.id,
    });

    return {
      jobId,
      status: 'pending',
      estimatedTime: 10,
      createdAt: new Date().toISOString(),
    };
  }

  async getJobStatus(jobId: string) {
    // Check cache first
    const cached = await this.redis.get(`job:${jobId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Get from database
    const history = await this.prisma.generationHistory.findFirst({
      where: { taskId: jobId },
    });

    if (!history) {
      return {
        jobId,
        status: 'not_found',
        progress: 0,
        result: null,
        error: null,
      };
    }

    const result = {
      jobId,
      status: history.status,
      progress: history.progress,
      result: history.outputResult ? JSON.parse(history.outputResult) : null,
      error: history.errorMessage,
    };

    // Cache for 1 minute
    await this.redis.set(`job:${jobId}`, JSON.stringify(result), 60);

    return result;
  }

  async getTemplates() {
    return [
      {
        id: 'developer',
        name: 'Developer',
        description: 'Professional developer bio',
        template: 'I am a passionate {languages} developer with {years} years of experience.',
      },
      {
        id: 'student',
        name: 'Student',
        description: 'Student/learner bio',
        template: 'I am a student learning {languages} and interested in {topics}.',
      },
      {
        id: 'open-source',
        name: 'Open Source',
        description: 'Open source contributor bio',
        template: 'I contribute to open source projects and love building things with {languages}.',
      },
    ];
  }
}
