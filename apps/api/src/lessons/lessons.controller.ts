import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CreateLessonDto } from '../common/dto/create-lesson.dto';
import { UpdateLessonDto } from '../common/dto/update-lesson.dto';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  findAll() {
    return this.lessonsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lessonsService.findById(id);
  }

  @Post()
  @UseGuards(AuthGuard, AdminGuard)
  create(@Body() body: CreateLessonDto) {
    return this.lessonsService.create(body);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AdminGuard)
  update(@Param('id') id: string, @Body() body: UpdateLessonDto) {
    return this.lessonsService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AdminGuard)
  delete(@Param('id') id: string) {
    return this.lessonsService.delete(id);
  }
}
