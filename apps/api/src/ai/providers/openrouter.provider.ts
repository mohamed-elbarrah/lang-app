import {
  AiProvider,
  GenerateQuestionsParams,
  EvaluateAnswerParams,
} from '../interfaces/ai-provider.interface';

interface OpenRouterModel {
  id: string;
  name: string;
  created?: number;
  description?: string;
}

interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' };
}

interface ChatCompletionResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export class OpenRouterProvider implements AiProvider {
  constructor(
    private readonly apiKey: string,
    private readonly model: string,
    private readonly baseUrl: string = 'https://openrouter.ai/api/v1',
  ) {}

  async generateQuestions(params: GenerateQuestionsParams): Promise<string> {
    const randomSeed = Date.now();
    const prompt = `You are an English grammar test generator. Generate ${params.count} questions based on the following lesson content. Each lesson includes its part (group), definition, grammar rule, and example sentences.

Lesson content:
${params.lessons}

Generate exactly ${params.count} questions. Distribute the questions across different lessons and types. Avoid repetitive or overly similar questions. Be creative.

Each question must be a JSON object with these fields:
- "type": one of "multiple_choice", "fill_blank", "error_correction", "sentence_creation", "scenario"
- "content": an object containing the question data. Structure depends on type:
  * multiple_choice: { "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A" }
  * fill_blank: { "sentence": "... ____ ...", "correctAnswer": "word" }
  * error_correction: { "sentence": "...", "error": "...", "correctAnswer": "..." }
  * sentence_creation: { "instruction": "...", "criteria": "...", "correctAnswer": "..." }
  * scenario: { "scenario": "...", "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "B" }
- "order": a number starting from 1
- "lessonTopic": the title of the lesson this question is based on

Return a JSON object with a "questions" array containing all generated questions. Use variety and creativity. Random seed: ${randomSeed}.`;

    const response = await this.chatCompletion([
      { role: 'system', content: 'You are an English grammar test generator. Always respond with valid JSON. Create varied, non-repetitive questions.' },
      { role: 'user', content: prompt },
    ], 0.8, 4000);

    return response;
  }

  async evaluateAnswer(params: EvaluateAnswerParams): Promise<string> {
    const prompt = `Evaluate the following English grammar question:

Question: ${params.question}
Correct Answer: ${params.correctAnswer}
Student's Answer: ${params.userAnswer}

Determine if the student's answer is correct. Consider partial credit for near-correct answers.
Return a JSON object with:
- "isCorrect": boolean (true if fully correct)
- "score": number between 0 and 100
- "feedback": string (brief feedback to the student)
- "correctionHint": string (if wrong, hint toward the right answer)`;

    const response = await this.chatCompletion([
      { role: 'system', content: 'You are an English teacher evaluating student answers. Always respond with valid JSON.' },
      { role: 'user', content: prompt },
    ], 0.3, 1000);

    return response;
  }

  async generateExplanation(params: EvaluateAnswerParams): Promise<string> {
    const prompt = `Explain the following English grammar question in detail:

Question: ${params.question}
Correct Answer: ${params.correctAnswer}

Provide a clear, pedagogical explanation suitable for an English learner. Include:
- Why the correct answer is right
- The grammar rule being tested
- Common mistakes to avoid

Return a JSON object with:
- "explanation": string (the full explanation)
- "rule": string (the grammar rule being tested)
- "examples": string[] (2-3 example sentences)`;

    const response = await this.chatCompletion([
      { role: 'system', content: 'You are an English teacher providing detailed grammar explanations. Always respond with valid JSON.' },
      { role: 'user', content: prompt },
    ], 0.3, 1500);

    return response;
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  async fetchModels(): Promise<{ id: string; name: string }[]> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const json = (await response.json()) as OpenRouterModelsResponse;

    return json.data.map((model) => ({
      id: model.id,
      name: model.name || model.id,
    }));
  }

  private async chatCompletion(
    messages: ChatMessage[],
    temperature = 0.5,
    maxTokens = 2000,
  ): Promise<string> {
    const body: ChatCompletionRequest = {
      model: this.model,
      messages,
      temperature,
      max_tokens: maxTokens,
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://langapp.local',
        'X-Title': 'LangApp',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const json = (await response.json()) as ChatCompletionResponse;
    return json.choices[0]?.message?.content || '';
  }
}
