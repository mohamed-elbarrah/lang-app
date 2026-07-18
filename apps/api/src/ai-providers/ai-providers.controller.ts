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
import { AiProvidersService } from './ai-providers.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller('ai-providers')
@UseGuards(AuthGuard, AdminGuard)
export class AiProvidersController {
  constructor(private readonly aiProvidersService: AiProvidersService) {}

  @Get()
  findAll() {
    return this.aiProvidersService.findAll();
  }

  @Post()
  create(
    @Body()
    body: {
      name: string;
      providerType: string;
      apiKey: string;
      baseUrl?: string;
      defaultModel?: string;
      isActive?: boolean;
    },
  ) {
    return this.aiProvidersService.create(body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.aiProvidersService.findById(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      apiKey?: string;
      baseUrl?: string;
      defaultModel?: string;
      isActive?: boolean;
    },
  ) {
    return this.aiProvidersService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.aiProvidersService.delete(id);
  }

  @Post('test-connection')
  testConnection(@Body() body: { id: string }) {
    return this.aiProvidersService.testConnection(body.id);
  }

  @Get(':id/models')
  getModels(@Param('id') id: string) {
    return this.aiProvidersService.fetchModels(id);
  }

  @Patch(':id/models')
  updateModels(
    @Param('id') id: string,
    @Body() body: { models: { id: string; isEnabled: boolean }[] },
  ) {
    return this.aiProvidersService.updateModels(id, body);
  }
}
