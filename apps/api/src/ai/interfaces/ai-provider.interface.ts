export interface GenerateQuestionsParams {
  lessons: string;
  count: number;
  level: string;
  context?: {
    mode: 'fresh' | 'retake';
    sourceLessonTitles?: string[];
    previousQuestionSummaries?: string[];
  };
}

export interface EvaluateAnswerParams {
  question: string;
  userAnswer: string;
  correctAnswer: string;
}

export interface GenerateStudyQuestionsParams {
  lesson: string;
  count: number;
  level: string;
}

export interface AiProvider {
  generateQuestions(params: GenerateQuestionsParams): Promise<string>;
  generateStudyQuestions(params: GenerateStudyQuestionsParams): Promise<string>;
  evaluateAnswer(params: EvaluateAnswerParams): Promise<string>;
  generateExplanation(params: EvaluateAnswerParams): Promise<string>;
  testConnection(): Promise<boolean>;
  fetchModels(): Promise<{ id: string; name: string }[]>;
}
