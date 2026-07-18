import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ExamsService } from './exams.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('exams')
@UseGuards(AuthGuard)
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body()
    body: {
      questionCount?: number;
      partIds?: string[];
      correctionMode?: 'instant' | 'final';
    },
  ) {
    return this.examsService.create(userId, body);
  }
}
