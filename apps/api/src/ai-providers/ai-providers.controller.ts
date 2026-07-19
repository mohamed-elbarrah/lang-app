import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AiProvidersService } from './ai-providers.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';
import { CreateAiProviderDto } from '../common/dto/create-ai-provider.dto';
import { UpdateAiProviderDto } from '../common/dto/update-ai-provider.dto';
import { UpdateProviderModelsDto } from '../common/dto/update-provider-models.dto';
import { TestConnectionDto } from '../common/dto/test-connection.dto';

@Controller('ai-providers')
@UseGuards(AuthGuard, AdminGuard)
export class AiProvidersController {
  constructor(private readonly aiProvidersService: AiProvidersService) {}

  @Get()
  findAll() {
    return this.aiProvidersService.findAll();
  }

  @Post()
  create(@Body() body: CreateAiProviderDto) {
    return this.aiProvidersService.create(body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aiProvidersService.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateAiProviderDto) {
    return this.aiProvidersService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.aiProvidersService.delete(id);
  }

  @Post('test-connection')
  testConnection(@Body() body: TestConnectionDto) {
    return this.aiProvidersService.testConnection(body.id);
  }

  @Get(':id/models')
  getModels(@Param('id') id: string, @Query('apiKey') apiKey?: string) {
    return this.aiProvidersService.fetchModels(id, apiKey);
  }

  @Patch(':id/models')
  updateModels(@Param('id') id: string, @Body() body: UpdateProviderModelsDto) {
    return this.aiProvidersService.updateModels(id, body);
  }
}
