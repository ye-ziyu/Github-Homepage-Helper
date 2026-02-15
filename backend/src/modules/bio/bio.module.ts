import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { BioController } from './bio.controller';
import { BioService } from './bio.service';
import { BioQueueProcessor } from './queues/bio-queue.processor';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { RedisModule } from '../../common/redis/redis.module';
import { TranslationModule } from '../../common/translation/translation.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    TranslationModule,
    UserModule,
    AuthModule,
    BullModule.registerQueue({
      name: 'bio-generation',
    }),
  ],
  controllers: [BioController],
  providers: [BioService, BioQueueProcessor],
  exports: [BioService],
})
export class BioModule {}
