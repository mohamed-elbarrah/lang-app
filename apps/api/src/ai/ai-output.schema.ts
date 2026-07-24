import { z } from 'zod';

const questionTypeSchema = z.enum([
  'multiple_choice',
  'fill_blank',
  'error_correction',
  'sentence_creation',
  'scenario',
]);

const optionItemSchema = z.object({
  label: z.string().length(1),
  text: z.string().min(1).max(500),
});

const multipleChoiceContentSchema = z.object({
  instruction: z.string().min(1).max(500),
  question: z.string().min(1).max(1000),
  options: z.array(optionItemSchema).min(2).max(6),
});

const fillBlankContentSchema = z.object({
  instruction: z.string().min(1).max(500),
  sentence: z.string().min(1).max(500),
});

const errorCorrectionContentSchema = z.object({
  instruction: z.string().min(1).max(500),
  sentence: z.string().min(1).max(500),
});

const sentenceCreationContentSchema = z.object({
  instruction: z.string().min(1).max(1000),
  criteria: z.string().min(1).max(500),
});

const scenarioContentSchema = z.object({
  instruction: z.string().min(1).max(500),
  scenario: z.string().min(1).max(1000),
  question: z.string().min(1).max(500),
  options: z.array(optionItemSchema).min(2).max(6),
});

const answerKeySchema = z.object({
  correctAnswer: z.string().min(1).max(500),
});

export const generatedQuestionSchema = z.object({
  type: questionTypeSchema,
  content: z.union([
    multipleChoiceContentSchema,
    fillBlankContentSchema,
    errorCorrectionContentSchema,
    sentenceCreationContentSchema,
    scenarioContentSchema,
  ]),
  answerKey: answerKeySchema,
  explanation: z.string().min(1).max(2000).optional().default(''),
  order: z.number().int().min(1),
  lessonTopic: z.string().min(1).max(200).optional(),
});

export const aiQuestionsResponseSchema = z.object({
  questions: z.array(generatedQuestionSchema).min(1).max(50),
});

export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>;
export type AiQuestionsResponse = z.infer<typeof aiQuestionsResponseSchema>;
