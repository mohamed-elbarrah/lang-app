import {
  AiProvider,
  GenerateQuestionsParams,
  EvaluateAnswerParams,
} from '../interfaces/ai-provider.interface';

interface OpenRouterModel {
  id: string;
  name: string;
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
    const prompt = `You are an English grammar test generator. Generate ${params.count} questions based on the following lesson content.

Lesson content:
${params.lessons}

Generate exactly ${params.count} questions. Distribute the questions across different lessons and types.

Each question must be a JSON object with these fields:
- "type": one of "multiple_choice", "fill_blank", "error_correction", "sentence_creation", "scenario"
- "content": an object containing ONLY the public question data (NO answer key):
  * multiple_choice: { "instruction": "Choose the correct option.", "question": "...", "options": [{ "label": "A", "text": "..." }, { "label": "B", "text": "..." }] }
  * fill_blank: { "instruction": "Fill in the blank.", "sentence": "... ____ ..." }
  * error_correction: { "instruction": "Find and correct the error.", "sentence": "..." }
  * sentence_creation: { "instruction": "Create a sentence.", "criteria": "..." }
  * scenario: { "instruction": "Choose the best response.", "scenario": "...", "question": "...", "options": [{ "label": "A", "text": "..." }, { "label": "B", "text": "..." }] }
- "answerKey": an object containing the correct answer (NEVER included in content):
  * multiple_choice: { "correctAnswer": "A" }
  * fill_blank: { "correctAnswer": "word1|word2|word3" } — use pipe for multiple acceptable answers
  * error_correction: { "correctAnswer": "..." }
  * sentence_creation: { "correctAnswer": "..." }
  * scenario: { "correctAnswer": "A" }
- "explanation": string (pedagogical explanation of the correct answer — for error_correction, explain what the error was and why)
- "order": a number starting from 1
- "lessonTopic": the title of the lesson this question is based on

IMPORTANT: The "answerKey" must NEVER be inside "content". They must be separate fields.

CRITICAL format rules:
- Options must use { "label": "A", "text": "..." } format. Label is a single uppercase letter. Text is the full option text.
- For fill_blank embedding "____" (4 underscores) in the sentence as the blank marker.
- For error_correction, do NOT include an "error" field in content. The student must find the error themselves. Include the error explanation in the "explanation" field instead.
- Make the "instruction" field specific to the question content, not generic.

Return a JSON object with a "questions" array. Random seed: ${randomSeed}.`;

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
- "explanation": string (detailed pedagogical explanation including the grammar rule being tested)`;

    const response = await this.chatCompletion([
      { role: 'system', content: 'You are an English teacher evaluating student answers. Always respond with valid JSON.' },
      { role: 'user', content: prompt },
    ], 0.3, 1500);

    return response;
  }

  async generateExplanation(params: EvaluateAnswerParams): Promise<string> {
    const prompt = `Explain the following English grammar question in detail:

Question: ${params.question}
Correct Answer: ${params.correctAnswer}

Provide a clear, pedagogical explanation suitable for an English learner.

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
      response_format: { type: 'json_object' },
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
      const safeMessage = response.status >= 500
        ? `AI provider server error (${response.status})`
        : `AI provider request failed (${response.status})`;
      throw new Error(safeMessage);
    }

    const json = (await response.json()) as ChatCompletionResponse;
    return json.choices[0]?.message?.content || '';
  }
}
