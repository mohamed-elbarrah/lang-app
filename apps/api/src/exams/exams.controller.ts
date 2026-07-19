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
import { CreateExamDto } from '../common/dto/create-exam.dto';
import { SubmitAnswerDto } from '../common/dto/submit-answer.dto';
import { UpdateExamModeDto } from '../common/dto/update-exam-mode.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('exams')
@UseGuards(AuthGuard)
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  create(
    @CurrentUser('id') userId: string,
    @Body() body: CreateExamDto,
  ) {
    return this.examsService.create(userId, body);
  }

  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.examsService.findAll(userId, query);
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
    @Body() body: SubmitAnswerDto,
  ) {
    return this.examsService.submitAnswer(id, userId, body);
  }

  @Post(':id/retake')
  retake(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.examsService.retake(id, userId);
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
    @Body() body: UpdateExamModeDto,
  ) {
    return this.examsService.switchMode(id, userId, body.correctionMode);
  }
}
