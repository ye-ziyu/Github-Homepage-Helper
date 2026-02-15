import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TranslationModule } from './translation/translation.module';

@Module({
  imports: [ConfigModule, TranslationModule],
  exports: [TranslationModule],
})
export class CommonModule {}
