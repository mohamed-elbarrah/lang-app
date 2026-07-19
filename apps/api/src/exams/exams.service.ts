import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { Prisma, QuestionType } from '@prisma/client';
import { createHash } from 'crypto';

interface CreateExamDto {
  questionCount?: number;
  partIds?: string[];
  correctionMode?: 'instant' | 'final';
}

interface SubmitAnswerDto {
  questionId: string;
  answer: unknown;
}

@Injectable()
export class ExamsService {
  private readonly logger = new Logger(ExamsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async create(userId: string, dto: CreateExamDto) {
    const questionCount = dto.questionCount ?? 10;
    const correctionMode = dto.correctionMode ?? 'final';

    if (questionCount < 3 || questionCount > 50) {
      throw new BadRequestException('questionCount must be between 3 and 50');
    }

    const where = dto.partIds && dto.partIds.length > 0
      ? { partId: { in: dto.partIds } }
      : {};

    const lessons = await this.prisma.lesson.findMany({
      where,
      include: { part: true },
      orderBy: { order: 'asc' },
    });

    if (lessons.length === 0) {
      throw new BadRequestException(
        dto.partIds && dto.partIds.length > 0
          ? 'No lessons found for the selected parts'
          : 'No lessons available',
      );
    }

    const selectedLessons = this.selectLessons(lessons, questionCount);

    this.logger.log(`Creating exam for user ${userId}: ${questionCount} questions, ${correctionMode} mode`);

    const exam = await this.prisma.exam.create({
      data: {
        userId,
        questionCount,
        correctionMode,
        status: 'generating',
      },
    });

    try {
      await this.generateExamContent(exam.id, userId, selectedLessons, questionCount, correctionMode);
      this.logger.log(`Exam ${exam.id} created with ${questionCount} questions`);
    } catch (error) {
      this.logger.error(`Exam generation failed for ${exam.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      await this.prisma.exam.delete({ where: { id: exam.id } }).catch((e) => {
        this.logger.error(`Failed to delete broken exam ${exam.id}: ${e.message}`);
      });
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to generate exam. Please try again.',
      );
    }

    return this.findById(exam.id, userId);
  }

  async retake(examId: string, userId: string) {
    const original = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: { orderBy: { order: 'asc' } } },
    });

    if (!original) {
      throw new NotFoundException('Exam not found');
    }

    if (original.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const newExam = await this.prisma.exam.create({
      data: {
        userId,
        questionCount: original.questionCount,
        correctionMode: original.correctionMode,
        status: 'generating',
      },
    });

    const questions = original.questions.map((q, i) => ({
      examId: newExam.id,
      type: q.type,
      content: q.content as Prisma.InputJsonValue,
      correctAnswer: q.correctAnswer,
      answerKey: q.answerKey as Prisma.InputJsonValue,
      explanation: q.explanation,
      order: i + 1,
      lessonTopic: q.lessonTopic,
    }));

    await this.prisma.$transaction(async (tx) => {
      await tx.question.createMany({ data: questions });
      await tx.exam.update({
        where: { id: newExam.id },
        data: { status: 'in_progress' },
      });
    });

    return this.findById(newExam.id, userId);
  }

  private async generateExamContent(
    examId: string,
    userId: string,
    selectedLessons: any[],
    questionCount: number,
    correctionMode: string,
  ) {
    const formattedLessons = this.formatLessonsForPrompt(selectedLessons);
    const aiResponse = await this.aiService.generateQuestions({
      lessons: formattedLessons,
      count: questionCount,
    });
    const aiQuestions = aiResponse.questions;

    const questions = aiQuestions.map((q, i) => {
      const lesson = selectedLessons[i % selectedLessons.length];
      return {
        type: q.type,
        content: q.content as Prisma.InputJsonValue,
        answerKey: q.answerKey as Prisma.InputJsonValue,
        correctAnswer: q.answerKey.correctAnswer,
        explanation: q.explanation || null,
        order: i + 1,
        lessonTopic: q.lessonTopic || lesson?.title || null,
      };
    });

    const contentHash = createHash('sha256')
      .update(JSON.stringify(questions.map(({ answerKey, ...rest }) => rest)))
      .digest('hex');

    await this.prisma.$transaction(async (tx) => {
      await tx.question.createMany({
        data: questions.map((q) => ({
          ...q,
          examId,
        })),
      });

      await tx.exam.update({
        where: { id: examId },
        data: {
          contentHash,
          questionCount: questions.length,
          status: 'in_progress',
        },
      });
    });
  }

  async findAll(
    userId: string,
    params: { page?: number; limit?: number },
  ) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const [exams, total] = await Promise.all([
      this.prisma.exam.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          questionCount: true,
          correctionMode: true,
          status: true,
          score: true,
          createdAt: true,
          completedAt: true,
        },
      }),
      this.prisma.exam.count({ where: { userId } }),
    ]);

    return {
      data: exams,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string, userId: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (exam.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (exam.status === 'generating') {
      const { questions, ...rest } = exam;
      return {
        ...rest,
        questions: [],
      };
    }

    const isInProgress = exam.status === 'in_progress';

    const safeQuestions = exam.questions.map((q) => {
      if (isInProgress) {
        const { correctAnswer, answerKey, ...rest } = q;
        return rest;
      }
      const { answerKey, ...rest } = q;
      return rest;
    });

    return { ...exam, questions: safeQuestions };
  }

  async getCurrentQuestion(examId: string, userId: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (exam.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (exam.status === 'completed') {
      return { completed: true, examId };
    }

    if (exam.status === 'generating') {
      return { generating: true, examId, message: 'Exam is being prepared...' };
    }

    const nextQuestion = exam.questions.find((q) => q.userAnswer === null);

    if (!nextQuestion) {
      return { completed: true, examId };
    }

    const { correctAnswer, answerKey, ...question } = nextQuestion;
    return question;
  }

  async submitAnswer(
    examId: string,
    userId: string,
    dto: SubmitAnswerDto,
  ) {
    this.logger.log(`Submitting answer for exam ${examId}, question ${dto.questionId}`);

    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (exam.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (exam.status === 'completed') {
      throw new BadRequestException('Exam is already completed');
    }

    if (exam.status === 'generating') {
      throw new BadRequestException('Exam is still being generated. Please try again shortly.');
    }

    let { isCorrect, explanation } = await this.evaluateAnswer(examId, dto);

    const updated = await this.prisma.question.updateMany({
      where: {
        id: dto.questionId,
        examId,
        userAnswer: { equals: Prisma.DbNull },
      },
      data: {
        userAnswer: dto.answer as Prisma.InputJsonValue,
        isCorrect,
        explanation,
      },
    });

    if (updated.count === 0) {
      const question = await this.prisma.question.findUnique({
        where: { id: dto.questionId },
      });

      if (!question || question.examId !== examId) {
        throw new NotFoundException('Question not found in this exam');
      }

      throw new BadRequestException('Question already answered');
    }

    const totalCount = await this.prisma.question.count({
      where: { examId },
    });

    const remainingCount = await this.prisma.question.count({
      where: {
        examId,
        userAnswer: { equals: Prisma.DbNull },
      },
    });

    if (remainingCount === 0) {
      this.logger.log(`All questions answered for exam ${examId}, auto-completing`);
      await this.complete(examId, userId);
      return {
        completed: true,
        isCorrect,
        explanation,
        progress: { answered: totalCount, total: totalCount },
      };
    }

    const nextQuestion = await this.prisma.question.findFirst({
      where: {
        examId,
        userAnswer: { equals: Prisma.DbNull },
      },
      orderBy: { order: 'asc' },
    });

    if (!nextQuestion) {
      this.logger.log(`No next question found for exam ${examId}, completing`);
      await this.complete(examId, userId);
      return {
        completed: true,
        isCorrect,
        explanation,
        progress: { answered: totalCount, total: totalCount },
      };
    }

    const { correctAnswer, answerKey, ...safeQuestion } = nextQuestion;

    return {
      completed: false,
      isCorrect,
      explanation,
      nextQuestion: safeQuestion,
      progress: {
        answered: totalCount - remainingCount,
        total: totalCount,
      },
    };
  }

  async complete(examId: string, userId: string) {
    this.logger.log(`Completing exam ${examId}`);

    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (exam.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (exam.status === 'completed') {
      throw new BadRequestException('Exam is already completed');
    }

    const unanswered = await this.prisma.question.findMany({
      where: {
        examId,
        userAnswer: { equals: Prisma.DbNull },
      },
    });

    if (unanswered.length > 0) {
      await this.prisma.$transaction(async (tx) => {
        for (const question of unanswered) {
          const isCorrect = false;
          const explanation = question.explanation || 'No answer provided.';

          await tx.question.update({
            where: { id: question.id },
            data: {
              userAnswer: Prisma.DbNull,
              isCorrect,
              explanation,
            },
          });
        }
      });
    }

    const allQuestions = await this.prisma.question.findMany({
      where: { examId },
      orderBy: { order: 'asc' },
    });

    const correctCount = allQuestions.filter((q) => q.isCorrect === true).length;
    const score = Math.round((correctCount / allQuestions.length) * 100);

    const completedExam = await this.prisma.exam.update({
      where: { id: examId },
      data: {
        status: 'completed',
        score,
        completedAt: new Date(),
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    const questions = completedExam.questions.map(
      ({ answerKey: _, ...q }) => q,
    );
    const { questions: _, ...safe } = completedExam;
    return { ...safe, questions };
  }

  async switchMode(
    examId: string,
    userId: string,
    correctionMode: 'instant' | 'final',
  ) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      throw new NotFoundException('Exam not found');
    }

    if (exam.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (exam.status !== 'in_progress') {
      throw new BadRequestException('Cannot change mode on a completed exam');
    }

    await this.prisma.exam.update({
      where: { id: examId },
      data: { correctionMode },
    });

    return this.findById(examId, userId);
  }

  private async evaluateAnswer(
    examId: string,
    dto: SubmitAnswerDto,
  ): Promise<{ isCorrect: boolean; explanation: string | null }> {
    const question = await this.prisma.question.findUnique({
      where: { id: dto.questionId },
    });

    if (!question || question.examId !== examId) {
      throw new NotFoundException('Question not found in this exam');
    }

    const answerKey = question.answerKey as { correctAnswer: string } | null;
    const correctAnswer = answerKey?.correctAnswer || question.correctAnswer;

    if (!correctAnswer) {
      return { isCorrect: false, explanation: null };
    }

    const type = question.type as QuestionType;

    if (this.canEvaluateDeterministically(type)) {
      const isCorrect = this.deterministicEvaluate(type, dto.answer, correctAnswer);
      return {
        isCorrect,
        explanation: isCorrect ? null : question.explanation || null,
      };
    }

    return this.aiEvaluate(question, dto.answer, correctAnswer);
  }

  private canEvaluateDeterministically(type: QuestionType): boolean {
    return ['multiple_choice', 'fill_blank', 'error_correction'].includes(type);
  }

  private deterministicEvaluate(
    type: QuestionType,
    userAnswer: unknown,
    correctAnswer: string,
  ): boolean {
    const normalizedUser = String(userAnswer).trim().toLowerCase();
    const normalizedCorrect = correctAnswer.trim().toLowerCase();

    switch (type) {
      case 'multiple_choice':
      case 'error_correction':
        return normalizedUser === normalizedCorrect;

      case 'fill_blank': {
        const acceptedAnswers = normalizedCorrect.split('|').map((a) => a.trim());
        return acceptedAnswers.some((a) => normalizedUser === a);
      }

      default:
        return false;
    }
  }

  private createEvaluationFingerprint(questionId: string, userAnswer: unknown): string {
    return createHash('sha256')
      .update(`${questionId}:${JSON.stringify(userAnswer)}`)
      .digest('hex');
  }

  private async aiEvaluate(
    question: any,
    userAnswer: unknown,
    correctAnswer: string,
  ): Promise<{ isCorrect: boolean; explanation: string | null }> {
    const fingerprint = this.createEvaluationFingerprint(question.id, userAnswer);

    const cached = await this.prisma.answerEvaluation.findUnique({
      where: { fingerprint },
    });

    if (cached) {
      return {
        isCorrect: cached.isCorrect,
        explanation: cached.explanation || null,
      };
    }

    try {
      const evaluationResponse = await this.aiService.evaluateAnswer({
        question: JSON.stringify(question.content),
        userAnswer: JSON.stringify(userAnswer),
        correctAnswer,
      });

      let evaluation: Record<string, unknown>;
      try {
        evaluation = JSON.parse(evaluationResponse);
      } catch {
        this.logger.warn(`AI evaluation returned invalid JSON: ${evaluationResponse}`);
        return { isCorrect: false, explanation: null };
      }

      const isCorrect = Boolean(evaluation.isCorrect);
      const explanation = String(evaluation.explanation || evaluation.feedback || '');

      const result = { isCorrect, explanation: explanation || null };

      await this.prisma.answerEvaluation
        .create({
          data: {
            fingerprint,
            isCorrect: result.isCorrect,
            score: typeof evaluation.score === 'number' ? evaluation.score : null,
            feedback: String(evaluation.feedback ?? '') || null,
            explanation: result.explanation,
          },
        })
        .catch(() => {
          // Ignore duplicate fingerprint errors (race conditions)
        });

      return result;
    } catch (error) {
      this.logger.warn(`AI evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { isCorrect: false, explanation: null };
    }
  }

  private selectLessons(lessons: any[], count: number) {
    if (lessons.length <= count) {
      return lessons;
    }

    const shuffled = [...lessons];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  private formatLessonsForPrompt(lessons: any[]): string {
    let currentPart = '';
    const parts: string[] = [];

    for (const lesson of lessons) {
      if (lesson.part && lesson.part.name !== currentPart) {
        currentPart = lesson.part.name;
        parts.push(`\nPart: ${currentPart}`);
      }

      parts.push(`\n--- ${lesson.title} ---`);
      parts.push(`Definition: ${lesson.definition}`);
      parts.push(`Rule: ${lesson.rule}`);

      const examples = Array.isArray(lesson.examples)
        ? (lesson.examples as string[]).join(', ')
        : '';
      if (examples) {
        parts.push(`Examples: ${examples}`);
      }
    }

    return parts.join('\n');
  }
}
