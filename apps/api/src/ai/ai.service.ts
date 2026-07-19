import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenRouterProvider } from './providers/openrouter.provider';
import type { GenerateQuestionsParams, EvaluateAnswerParams } from './interfaces/ai-provider.interface';
import { aiQuestionsResponseSchema } from './ai-output.schema';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generateQuestions(params: GenerateQuestionsParams) {
    this.logger.log(`Generating ${params.count} questions via AI`);
    const start = Date.now();

    const provider = await this.getActiveProvider();
    this.logger.log(`Using AI provider: ${provider.name} (${provider.providerType})`);

    const impl = new OpenRouterProvider(
      provider.apiKey,
      provider.defaultModel || 'openai/gpt-4o-mini',
      provider.baseUrl || undefined,
    );

    const raw = await impl.generateQuestions(params);
    const parsed = this.parseAndValidateQuestions(raw);

    const duration = Date.now() - start;
    this.logger.log(`Generated ${parsed.questions.length} questions in ${duration}ms`);
    return parsed;
  }

  async evaluateAnswer(params: EvaluateAnswerParams) {
    this.logger.log(`Evaluating answer via AI`);
    const provider = await this.getActiveProvider();
    const impl = new OpenRouterProvider(
      provider.apiKey,
      provider.defaultModel || 'openai/gpt-4o-mini',
      provider.baseUrl || undefined,
    );
    return impl.evaluateAnswer(params);
  }

  async generateExplanation(params: EvaluateAnswerParams) {
    this.logger.log(`Generating explanation via AI`);
    const provider = await this.getActiveProvider();
    const impl = new OpenRouterProvider(
      provider.apiKey,
      provider.defaultModel || 'openai/gpt-4o-mini',
      provider.baseUrl || undefined,
    );
    return impl.generateExplanation(params);
  }

  private parseAndValidateQuestions(raw: string) {
    let parsed: unknown;

    try {
      parsed = JSON.parse(raw);
    } catch {
      const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[1]);
        } catch {
          throw new BadRequestException('Failed to parse AI response as JSON');
        }
      } else {
        throw new BadRequestException('Failed to parse AI response as JSON');
      }
    }

    const result = aiQuestionsResponseSchema.safeParse(parsed);
    if (!result.success) {
      this.logger.warn(`AI output validation failed: ${result.error.message}`);
      throw new BadRequestException(
        'AI response did not contain valid questions. Please try again.',
      );
    }

    return result.data;
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
