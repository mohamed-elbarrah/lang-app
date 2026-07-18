import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenRouterProvider } from './providers/openrouter.provider';
import type { GenerateQuestionsParams, EvaluateAnswerParams } from './interfaces/ai-provider.interface';

@Injectable()
export class AiService {
  constructor(private readonly prisma: PrismaService) {}

  async generateQuestions(params: GenerateQuestionsParams) {
    const provider = await this.getActiveProvider();
    const impl = new OpenRouterProvider(
      provider.apiKey,
      provider.defaultModel || 'openai/gpt-4o-mini',
      provider.baseUrl || undefined,
    );
    return impl.generateQuestions(params);
  }

  async evaluateAnswer(params: EvaluateAnswerParams) {
    const provider = await this.getActiveProvider();
    const impl = new OpenRouterProvider(
      provider.apiKey,
      provider.defaultModel || 'openai/gpt-4o-mini',
      provider.baseUrl || undefined,
    );
    return impl.evaluateAnswer(params);
  }

  async generateExplanation(params: EvaluateAnswerParams) {
    const provider = await this.getActiveProvider();
    const impl = new OpenRouterProvider(
      provider.apiKey,
      provider.defaultModel || 'openai/gpt-4o-mini',
      provider.baseUrl || undefined,
    );
    return impl.generateExplanation(params);
  }

  private async getActiveProvider() {
    const provider = await this.prisma.aiProvider.findFirst({
      where: { isActive: true },
    });

    if (!provider) {
      throw new BadRequestException('No active AI provider configured');
    }

    if (!provider.apiKey) {
      throw new BadRequestException('Active AI provider has no API key configured');
    }

    return provider;
  }
}
