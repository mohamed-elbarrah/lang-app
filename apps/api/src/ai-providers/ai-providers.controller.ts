import { Controller } from '@nestjs/common';
import { AiProvidersService } from './ai-providers.service';

@Controller('ai-providers')
export class AiProvidersController {
  constructor(private readonly aiProvidersService: AiProvidersService) {}
}
