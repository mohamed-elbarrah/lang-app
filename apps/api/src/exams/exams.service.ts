import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { Prisma } from '@prisma/client';
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async create(userId: string, dto: CreateExamDto) {
    const questionCount = dto.questionCount ?? 10;
    const correctionMode = dto.correctionMode ?? 'final';

    if (questionCount < 1 || questionCount > 50) {
      throw new BadRequestException('questionCount must be between 1 and 50');
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

    const formattedLessons = this.formatLessonsForPrompt(selectedLessons);

    const aiResponse = await this.aiService.generateQuestions({
      lessons: formattedLessons,
      count: questionCount,
    });

    let parsed: { questions: unknown[] };
    try {
      parsed = JSON.parse(aiResponse);
    } catch {
      const jsonMatch = aiResponse.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[1]);
        } catch {
          throw new BadRequestException(
            'Failed to parse AI response as JSON',
          );
        }
      } else {
        throw new BadRequestException(
          'Failed to parse AI response as JSON',
        );
      }
    }

    if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
      throw new BadRequestException(
        'AI response did not contain valid questions',
      );
    }

    const questions = parsed.questions.slice(0, questionCount).map((q: any, i: number) => ({
      type: q.type || 'multiple_choice',
      content: q.content || {},
      order: q.order || i + 1,
      lessonTopic: q.lessonTopic || selectedLessons[0]?.title || null,
    }));

    const contentHash = createHash('sha256')
      .update(JSON.stringify(questions))
      .digest('hex');

    const exam = await this.prisma.$transaction(async (tx) => {
      return tx.exam.create({
        data: {
          userId,
          questionCount: questions.length,
          contentHash,
          correctionMode,
          status: 'in_progress',
          questions: {
            create: questions,
          },
        },
        include: {
          questions: {
            orderBy: { order: 'asc' },
          },
        },
      });
    });

    return exam;
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

    const isInProgress = exam.status === 'in_progress';

    const questions = exam.questions.map((q) => {
      const { correctAnswer, ...rest } = q;
      if (isInProgress) {
        return rest;
      }
      return q;
    });

    return { ...exam, questions };
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

    const nextQuestion = exam.questions.find((q) => q.userAnswer === null);

    if (!nextQuestion) {
      return { completed: true, examId };
    }

    const { correctAnswer, ...question } = nextQuestion;
    return question;
  }

  async submitAnswer(
    examId: string,
    userId: string,
    dto: SubmitAnswerDto,
  ) {
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

    if (exam.status !== 'in_progress') {
      throw new BadRequestException('Exam is already completed');
    }

    const question = exam.questions.find(
      (q) => q.id === dto.questionId,
    );

    if (!question) {
      throw new NotFoundException('Question not found in this exam');
    }

    if (question.userAnswer !== null) {
      throw new BadRequestException('Question already answered');
    }

    const correctAnswerStr =
      typeof question.correctAnswer === 'string'
        ? question.correctAnswer
        : JSON.stringify(question.correctAnswer);

    let isCorrect = false;
    let explanation: string | null = null;

    if (correctAnswerStr) {
      try {
        const evaluationResponse = await this.aiService.evaluateAnswer({
          question: JSON.stringify(question.content),
          userAnswer: JSON.stringify(dto.answer),
          correctAnswer: correctAnswerStr,
        });

        const evaluation = JSON.parse(evaluationResponse);
        isCorrect = evaluation.isCorrect ?? false;
        explanation = evaluation.explanation || evaluation.feedback || null;
      } catch {
        isCorrect = false;
        explanation = null;
      }
    }

    await this.prisma.question.update({
      where: { id: question.id },
      data: {
        userAnswer: dto.answer as Prisma.InputJsonValue,
        isCorrect,
        explanation,
      },
    });

    const remainingQuestions = exam.questions.filter(
      (q) =>
        q.id !== question.id &&
        q.userAnswer === null,
    );

    if (remainingQuestions.length === 0) {
      return await this.complete(examId, userId);
    }

    const nextQuestion = remainingQuestions[0];
    const { correctAnswer: _, ...safeQuestion } = nextQuestion;

    return {
      completed: false,
      isCorrect,
      explanation,
      nextQuestion: safeQuestion,
      progress: {
        answered: exam.questions.length - remainingQuestions.length,
        total: exam.questions.length,
      },
    };
  }

  async complete(examId: string, userId: string) {
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
      throw new BadRequestException('Exam is already completed');
    }

    const unansweredQuestions = exam.questions.filter(
      (q) => q.userAnswer === null,
    );

    for (const question of unansweredQuestions) {
      const correctAnswerStr =
        typeof question.correctAnswer === 'string'
          ? question.correctAnswer
          : JSON.stringify(question.correctAnswer);

      if (correctAnswerStr) {
        try {
          const evaluationResponse = await this.aiService.evaluateAnswer({
            question: JSON.stringify(question.content),
            userAnswer: JSON.stringify(null),
            correctAnswer: correctAnswerStr,
          });

          const evaluation = JSON.parse(evaluationResponse);

          await this.prisma.question.update({
            where: { id: question.id },
            data: {
              userAnswer: Prisma.JsonNull,
              isCorrect: false,
              explanation: evaluation.explanation || evaluation.feedback || null,
            },
          });
        } catch {
          await this.prisma.question.update({
            where: { id: question.id },
            data: {
              isCorrect: false,
            },
          });
        }
      } else {
        await this.prisma.question.update({
          where: { id: question.id },
          data: {
            isCorrect: false,
          },
        });
      }
    }

    const updatedQuestions = await this.prisma.question.findMany({
      where: { examId },
      orderBy: { order: 'asc' },
    });

    const correctCount = updatedQuestions.filter(
      (q) => q.isCorrect === true,
    ).length;

    const score = Math.round(
      (correctCount / updatedQuestions.length) * 100,
    );

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

    return completedExam;
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

    return this.prisma.exam.update({
      where: { id: examId },
      data: { correctionMode },
    });
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
