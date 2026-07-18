import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
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

  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.examsService.findAll(userId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.examsService.findById(id, userId);
  }

  @Get(':id/current-question')
  getCurrentQuestion(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.examsService.getCurrentQuestion(id, userId);
  }

  @Post(':id/answers')
  submitAnswer(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: { questionId: string; answer: unknown },
  ) {
    return this.examsService.submitAnswer(id, userId, body);
  }

  @Post(':id/complete')
  complete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.examsService.complete(id, userId);
  }

  @Patch(':id/mode')
  switchMode(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: { correctionMode: 'instant' | 'final' },
  ) {
    return this.examsService.switchMode(id, userId, body.correctionMode);
  }
}
