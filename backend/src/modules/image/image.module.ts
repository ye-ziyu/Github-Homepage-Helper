import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { RedisModule } from '../../common/redis/redis.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    RedisModule,
    AuthModule,
    BullModule.registerQueue({
      name: 'image-generation',
    }),
  ],
  controllers: [ImageController],
  providers: [ImageService],
  exports: [ImageService],
})
export class ImageModule {}
