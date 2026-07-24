import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { IsString, IsNotEmpty, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { StudyService } from './study.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

class StartStudyDto {
  @IsString()
  @IsNotEmpty()
  lessonId!: string;
}

class SubmitExerciseDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  exerciseIndex!: number;

  @IsString()
  @IsNotEmpty()
  answer!: string;
}

@Controller('study')
@UseGuards(AuthGuard)
export class StudyController {
  constructor(private readonly studyService: StudyService) {}

  @Post()
  start(
    @CurrentUser('id') userId: string,
    @Body() body: StartStudyDto,
  ) {
    return this.studyService.start(userId, body.lessonId);
  }

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.studyService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.studyService.findById(id, userId);
  }

  @Get(':id/review')
  review(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.studyService.findByIdFull(id, userId);
  }

  @Post(':id/answers')
  submitAnswer(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() body: SubmitExerciseDto,
  ) {
    return this.studyService.submitAnswer(id, userId, body.exerciseIndex, body.answer);
  }

  @Post(':id/complete')
  complete(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.studyService.complete(id, userId);
  }
}
