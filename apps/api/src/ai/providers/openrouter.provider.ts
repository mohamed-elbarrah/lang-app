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
    const levelInstructions: Record<string, string> = {
      beginner: 'Beginner level: Test basic understanding. Use simple vocabulary, clear contexts, and one-step grammar rules. Multiple choice options should have one clearly correct answer with obviously wrong distractors.',
      intermediate: 'Intermediate level: Test practical application. Use moderate vocabulary, real-world contexts, and multi-step grammar rules. Include some nuance in distractors.',
      advanced: 'Advanced level: Test mastery. Use complex vocabulary, subtle contexts, and edge cases. Include exceptions, formal/informal distinctions, and advanced structures.',
    };

    const prompt = this.buildGenerationPrompt(params, levelInstructions[params.level] || levelInstructions.beginner);

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

  private buildGenerationPrompt(
    params: GenerateQuestionsParams,
    levelInstruction: string,
  ): string {
    const modeLabel = params.context?.mode === 'retake' ? 'retake' : 'fresh exam';
    const sourceLessons = params.context?.sourceLessonTitles?.length
      ? `Source lessons: ${params.context.sourceLessonTitles.join(', ')}`
      : '';
    const previousQuestions = params.context?.previousQuestionSummaries?.length
      ? `Questions to avoid repeating:\n${params.context.previousQuestionSummaries
          .map((item, index) => `${index + 1}. ${item}`)
          .join('\n')}`
      : '';

    const jsonTemplate = JSON.stringify(
      {
        questions: [
          {
            type: 'multiple_choice',
            content: {
              instruction: 'Choose the correct option to complete the sentence.',
              question: 'She ___ to school every day.',
              options: [
                { label: 'A', text: 'go' },
                { label: 'B', text: 'goes' },
                { label: 'C', text: 'going' },
              ],
            },
            answerKey: { correctAnswer: 'B' },
            explanation: 'Third-person singular requires "goes" in simple present.',
            order: 1,
            lessonTopic: 'Simple Present Tense',
          },
          {
            type: 'fill_blank',
            content: {
              instruction: 'Fill in the blank with the correct verb form.',
              sentence: 'She ____ to school every day.',
            },
            answerKey: { correctAnswer: 'goes' },
            explanation: 'Third-person singular requires "goes".',
            order: 2,
            lessonTopic: 'Simple Present Tense',
          },
          {
            type: 'error_correction',
            content: {
              instruction: 'Find and correct the grammatical error.',
              sentence: 'She go to school every day.',
            },
            answerKey: { correctAnswer: 'goes' },
            explanation: 'Subject "She" is third-person singular, so the verb should be "goes".',
            order: 3,
            lessonTopic: 'Subject-Verb Agreement',
          },
          {
            type: 'sentence_creation',
            content: {
              instruction: 'Create a sentence using the given word.',
              criteria: 'Write one sentence using "although" to show contrast.',
            },
            answerKey: { correctAnswer: 'Although it was raining, she went to the park.' },
            explanation: '"Although" introduces a contrasting clause.',
            order: 4,
            lessonTopic: 'Conjunctions',
          },
          {
            type: 'scenario',
            content: {
              instruction: 'Choose the best response in this situation.',
              scenario: 'You are at a restaurant. The waiter asks what you would like to drink.',
              question: 'What do you say?',
              options: [
                { label: 'A', text: 'I want a water.' },
                { label: 'B', text: 'I would like some water, please.' },
                { label: 'C', text: 'Give me water.' },
              ],
            },
            answerKey: { correctAnswer: 'B' },
            explanation: '"I would like..." is the most polite and natural response.',
            order: 5,
            lessonTopic: 'Polite Requests',
          },
        ],
      },
      null,
      2,
    );

    return [
      `You are an English grammar test generator for ${modeLabel}.`,
      `Generate exactly ${params.count} questions based on the lesson content below.`,
      '',
      levelInstruction,
      '',
      'Generation rules:',
      '- Use the lesson content as the only source of truth.',
      '- Spread questions across different lessons, grammar targets, and surface forms.',
      '- Vary sentence length, lexical field, context, and distractor style.',
      '- Avoid paraphrasing the same stem across questions.',
      '- Do not reuse the same sentence skeleton or scenario framing more than once.',
      '- If this is a retake, make the new questions clearly different from the previous exam while still testing the same lessons.',
      '- Keep every option plausible but ensure one clear correct answer.',
      '',
      'You must return a JSON object with a "questions" array. Every question object must have exactly these fields:',
      '- "type": one of "multiple_choice", "fill_blank", "error_correction", "sentence_creation", "scenario"',
      '- "content": an object. The fields inside depend on the type (see below). Must NEVER contain the answer.',
      '- "answerKey": an object with a single field "correctAnswer" (string). Must NEVER be a plain string.',
      '- "explanation": string explaining the grammar rule being tested.',
      '- "order": integer starting from 1, incrementing for each question.',
      '- "lessonTopic": string matching one of the lesson titles above.',
      '',
      'Per-type content structure (follow exactly):',
      '- multiple_choice: { "instruction": string, "question": string, "options": [{ "label": "A", "text": "..." }, ...] }',
      '- fill_blank:     { "instruction": string, "sentence": string (use "____" as the blank) }',
      '- error_correction: { "instruction": string, "sentence": string (contains the error) }',
      '- sentence_creation: { "instruction": string, "criteria": string }',
      '- scenario:       { "instruction": string, "scenario": string, "question": string, "options": [{ "label": "A", "text": "..." }, ...] }',
      '',
      'Options format: each option is { "label": "A", "text": "..." }. Labels are single uppercase letters (A, B, C...).',
      'For fill_blank answerKey: use pipe "|" to separate multiple acceptable answers: { "correctAnswer": "word1|word2|word3" }',
      '',
      'Here is the exact JSON structure to follow (use your own content, do not copy these examples):',
      jsonTemplate,
      '',
      'Lesson content:',
      params.lessons,
      previousQuestions ? '' : undefined,
      previousQuestions || undefined,
      sourceLessons ? '' : undefined,
      sourceLessons || undefined,
      '',
      'Return valid JSON only.',
    ]
      .filter((segment): segment is string => Boolean(segment))
      .join('\n');
  }
}
