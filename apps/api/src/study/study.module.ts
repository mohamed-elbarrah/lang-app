import { Module } from '@nestjs/common';
import { StudyController } from './study.controller';
import { StudyService } from './study.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [StudyController],
  providers: [StudyService],
  exports: [StudyService],
})
export class StudyModule {}
