import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { RedisService } from '../../../common/redis/redis.service';

@Processor('bio-generation')
export class BioQueueProcessor {
  private readonly logger = new Logger(BioQueueProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Process('generate-bio')
  async handleBioGeneration(job: Job) {
    const { userId, config, jobId, historyId } = job.data;

    this.logger.log(`Processing bio generation for user ${userId}`);

    try {
      // Update progress
      await this.updateProgress(historyId, 10);
      await this.updateJobCache(jobId, 10);

      // Get user info
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      await this.updateProgress(historyId, 30);
      await this.updateJobCache(jobId, 30);

      // Generate bio (in production, call OpenAI API)
      const bio = await this.generateBioContent(user, config);

      await this.updateProgress(historyId, 80);
      await this.updateJobCache(jobId, 80);

      // Save result
      const result = {
        bio,
        wordCount: bio.split(/\s+/).filter(w => w.length > 0).length,
        characterCount: bio.length,
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
      await this.updateJobCache(jobId, 100);

      // Clear job cache after completion
      setTimeout(() => {
        this.redis.del(`job:${jobId}`);
      }, 3600000); // 1 hour

      return result;
    } catch (error) {
      this.logger.error(`Bio generation failed: ${error.message}`);

      await this.prisma.generationHistory.update({
        where: { id: historyId },
        data: {
          status: 'failed',
          errorMessage: error.message,
        },
      });

      await this.updateJobCache(jobId, 100);

      throw error;
    }
  }

  private async generateBioContent(user: any, config: any): Promise<string> {
    // In production, call OpenAI API
    // For now, generate a simple bio based on user info

    const displayName = user.displayName || user.username;
    const languages = (user.languages as string[]).slice(0, 3).join(', ');
    const company = user.company ? ` at ${user.company}` : '';

    let bio = '';

    switch (config.language) {
      case 'zh':
        bio = `我是一名${languages || '全栈'}开发者${company}。`;
        if (user.bio) {
          bio += ` ${user.bio}`;
        }
        switch (config.style) {
          case 'professional':
            bio += ' 专注于构建高质量、可扩展的软件解决方案。';
            break;
          case 'casual':
            bio += ' 热爱编程，享受创造的过程。';
            break;
          case 'humorous':
            bio += ' 代码是我的母语，bug是我的朋友。';
            break;
          case 'minimal':
            bio += ' 简单即是美。';
            break;
        }
        break;
      case 'en':
      default:
        bio = `I am a ${languages || 'full-stack'} developer${company}.`;
        if (user.bio) {
          bio += ` ${user.bio}`;
        }
        switch (config.style) {
          case 'professional':
            bio += ' I focus on building high-quality, scalable software solutions.';
            break;
          case 'casual':
            bio += ' I love coding and enjoy the creative process.';
            break;
          case 'humorous':
            bio += ' I speak code and make friends with bugs.';
            break;
          case 'minimal':
            bio += ' Simple is beautiful.';
            break;
        }
        break;
    }

    return bio.trim();
  }

  private async updateProgress(historyId: string, progress: number) {
    await this.prisma.generationHistory.update({
      where: { id: historyId },
      data: { progress },
    });
  }

  private async updateJobCache(jobId: string, progress: number) {
    await this.redis.set(
      `job:${jobId}`,
      JSON.stringify({
        jobId,
        status: progress < 100 ? 'processing' : 'completed',
        progress,
        result: null,
        error: null,
      }),
      60,
    );
  }
}
