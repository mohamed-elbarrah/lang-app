import { AiProvider, GenerateQuestionsParams, EvaluateAnswerParams } from '../interfaces/ai-provider.interface';

export class OpenRouterProvider implements AiProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly baseUrl: string = 'https://openrouter.ai/api/v1',
  ) {}

  async generateQuestions(params: GenerateQuestionsParams): Promise<string> {
    throw new Error('Not implemented');
  }

  async evaluateAnswer(params: EvaluateAnswerParams): Promise<string> {
    throw new Error('Not implemented');
  }

  async generateExplanation(params: EvaluateAnswerParams): Promise<string> {
    throw new Error('Not implemented');
  }

  async testConnection(): Promise<boolean> {
    throw new Error('Not implemented');
  }

  async fetchModels(): Promise<{ id: string; name: string }[]> {
    throw new Error('Not implemented');
  }
}
