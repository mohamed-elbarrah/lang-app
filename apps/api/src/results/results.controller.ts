import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ResultsService } from './results.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('results')
@UseGuards(AuthGuard)
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get()
  findAll(
    @CurrentUser('id') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.resultsService.findAll(userId, query);
  }

  @Get(':examId')
  findOne(
    @Param('examId') examId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.resultsService.findById(examId, userId);
  }
}
