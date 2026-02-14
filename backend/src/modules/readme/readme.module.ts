import { Module } from '@nestjs/common';
import { ReadmeController } from './readme.controller';
import { ReadmeService } from './readme.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { RedisModule } from '../../common/redis/redis.module';
import { UserModule } from '../user/user.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, RedisModule, UserModule, AuthModule],
  controllers: [ReadmeController],
  providers: [ReadmeService],
  exports: [ReadmeService],
})
export class ReadmeModule {}
