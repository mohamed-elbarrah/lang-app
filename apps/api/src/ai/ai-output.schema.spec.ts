import { aiQuestionsResponseSchema } from './ai-output.schema';

describe('aiQuestionsResponseSchema', () => {
  it('validates a valid multiple_choice response', () => {
    const input = {
      questions: [
        {
          type: 'multiple_choice',
          content: {
            instruction: 'Choose the correct past tense form.',
            question: 'What is the past tense of go?',
            options: [
              { label: 'A', text: 'went' },
              { label: 'B', text: 'gone' },
              { label: 'C', text: 'going' },
              { label: 'D', text: 'goes' },
            ],
          },
          answerKey: { correctAnswer: 'A' },
          explanation: 'Went is the past tense of go.',
          order: 1,
          lessonTopic: 'Past Simple',
        },
      ],
    };
    const result = aiQuestionsResponseSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('validates a valid fill_blank response', () => {
    const input = {
      questions: [
        {
          type: 'fill_blank',
          content: {
            instruction: 'Fill in the blank with the correct verb form.',
            sentence: 'She ____ to school every day.',
          },
          answerKey: { correctAnswer: 'goes' },
          explanation: 'Present simple third person.',
          order: 1,
          lessonTopic: 'Present Simple',
        },
      ],
    };
    const result = aiQuestionsResponseSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('validates a valid error_correction response', () => {
    const input = {
      questions: [
        {
          type: 'error_correction',
          content: {
            instruction: 'Find and correct the error in the sentence.',
            sentence: 'He go to school.',
          },
          answerKey: { correctAnswer: 'He goes to school.' },
          explanation:
            'The error is "go" — with third-person singular subjects, the verb must take an -s ending. The correct form is "goes".',
          order: 1,
          lessonTopic: 'Present Simple',
        },
      ],
    };
    const result = aiQuestionsResponseSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('validates a valid sentence_creation response', () => {
    const input = {
      questions: [
        {
          type: 'sentence_creation',
          content: {
            instruction: 'Create a sentence using "although" to show contrast.',
            criteria: 'Must show contrast',
          },
          answerKey: { correctAnswer: 'Although it was raining, she went out.' },
          explanation: 'Shows contrast.',
          order: 1,
          lessonTopic: 'Conjunctions',
        },
      ],
    };
    const result = aiQuestionsResponseSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('validates a valid scenario response', () => {
    const input = {
      questions: [
        {
          type: 'scenario',
          content: {
            instruction: 'Choose the most polite response.',
            scenario: 'You are at a restaurant and the waiter is taking your order.',
            question: 'What do you say?',
            options: [
              { label: 'A', text: 'I want a pizza.' },
              { label: 'B', text: 'I would like a pizza.' },
              { label: 'C', text: 'Give me pizza.' },
              { label: 'D', text: 'Pizza now!' },
            ],
          },
          answerKey: { correctAnswer: 'B' },
          explanation: 'Polite form.',
          order: 1,
          lessonTopic: 'Modal Verbs',
        },
      ],
    };
    const result = aiQuestionsResponseSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('rejects response with answerKey inside content', () => {
    const input = {
      questions: [
        {
          type: 'multiple_choice',
          content: {
            instruction: 'Choose the correct answer.',
            question: 'What is X?',
            options: [
              { label: 'A', text: 'Option A' },
              { label: 'B', text: 'Option B' },
            ],
            correctAnswer: 'A',
          },
          order: 1,
          lessonTopic: 'Test',
        },
      ],
    };
    const result = aiQuestionsResponseSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects invalid question type', () => {
    const input = {
      questions: [
        {
          type: 'essay',
          content: { instruction: 'Write an essay', question: 'Write an essay' },
          order: 1,
          lessonTopic: 'Test',
        },
      ],
    };
    const result = aiQuestionsResponseSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects empty questions array', () => {
    const input = { questions: [] };
    const result = aiQuestionsResponseSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('rejects missing answers', () => {
    const input = {
      questions: [
        {
          type: 'multiple_choice',
          content: {
            instruction: 'Choose.',
            question: 'What is X?',
            options: [
              { label: 'A', text: 'A' },
              { label: 'B', text: 'B' },
            ],
          },
          order: 1,
          lessonTopic: 'Test',
        },
      ],
    };
    const result = aiQuestionsResponseSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('handles multiple questions', () => {
    const input = {
      questions: [
        {
          type: 'multiple_choice',
          content: {
            instruction: 'Choose.',
            question: 'Q1',
            options: [
              { label: 'A', text: 'Option A' },
              { label: 'B', text: 'Option B' },
            ],
          },
          answerKey: { correctAnswer: 'A' },
          explanation: 'E1',
          order: 1,
          lessonTopic: 'Lesson 1',
        },
        {
          type: 'fill_blank',
          content: {
            instruction: 'Fill in the blank.',
            sentence: '____ is the sun.',
          },
          answerKey: { correctAnswer: 'This' },
          explanation: 'E2',
          order: 2,
          lessonTopic: 'Lesson 2',
        },
      ],
    };
    const result = aiQuestionsResponseSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.questions).toHaveLength(2);
    }
  });
});
