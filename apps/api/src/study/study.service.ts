import { Injectable, BadRequestException, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { Prisma } from '@prisma/client';
import type { GenerateStudyQuestionsParams } from '../ai/interfaces/ai-provider.interface';

const EXERCISE_COUNT = 10;

@Injectable()
export class StudyService {
  private readonly logger = new Logger(StudyService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {}

  async start(userId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { part: true },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const existing = await this.prisma.studySession.findFirst({
      where: { userId, lessonId, status: 'in_progress' },
    });

    if (existing) {
      return this.findById(existing.id, userId);
    }

    this.logger.log(`Creating study session for user ${userId}, lesson ${lesson.title}`);

    const session = await this.prisma.studySession.create({
      data: { userId, lessonId },
    });

    try {
      const formattedLesson = this.formatLesson(lesson);
      const aiQuestions = await this.generateExercises(formattedLesson, lesson.title);

      const answersData = aiQuestions.map((q, i) => ({
        type: q.type,
        content: q.content as Prisma.InputJsonValue,
        correctAnswer: q.answerKey.correctAnswer,
        explanation: q.explanation || null,
        order: i + 1,
      }));

      await this.prisma.$transaction(async (tx) => {
        await tx.studyAnswer.createMany({
          data: answersData.map((a) => ({ ...a, sessionId: session.id })),
        });
      });

      this.logger.log(`Study session ${session.id} created with ${aiQuestions.length} exercises`);
    } catch (error) {
      this.logger.error(`Study generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      await this.prisma.studySession.delete({ where: { id: session.id } }).catch(() => {});
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Failed to create study session. Please try again.',
      );
    }

    return this.findById(session.id, userId);
  }

  async findAll(userId: string) {
    const sessions = await this.prisma.studySession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        lesson: { select: { id: true, title: true } },
        _count: { select: { answers: true } },
      },
    });

    return sessions.map(({ _count, ...s }) => ({
      ...s,
      exerciseCount: _count.answers,
    }));
  }

  async findById(id: string, userId: string) {
    const session = await this.prisma.studySession.findUnique({
      where: { id },
      include: {
        lesson: { include: { part: true } },
        answers: { orderBy: { order: 'asc' } },
      },
    });

    if (!session) {
      throw new NotFoundException('Study session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const { answers, ...rest } = session;
    const safeAnswers = answers.map(({ correctAnswer, ...a }) => a);

    return { ...rest, answers: safeAnswers };
  }

  async findByIdFull(id: string, userId: string) {
    const session = await this.prisma.studySession.findUnique({
      where: { id },
      include: {
        lesson: { include: { part: true } },
        answers: { orderBy: { order: 'asc' } },
      },
    });

    if (!session) {
      throw new NotFoundException('Study session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return session;
  }

  async submitAnswer(
    sessionId: string,
    userId: string,
    exerciseIndex: number,
    answer: string,
  ) {
    const session = await this.prisma.studySession.findUnique({
      where: { id: sessionId },
      include: { answers: { orderBy: { order: 'asc' } } },
    });

    if (!session) {
      throw new NotFoundException('Study session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (session.status === 'completed') {
      throw new BadRequestException('Study session is already completed');
    }

    const exercise = session.answers[exerciseIndex];
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    const answerKey = exercise.correctAnswer ?? '';
    if (!answerKey) {
      throw new BadRequestException('Exercise has no answer key');
    }

    if (exercise.userAnswer != null) {
      const isCorrect = this.evaluateAnswer(exercise.type, answer, answerKey);

      return {
        index: exerciseIndex,
        isCorrect,
        correctAnswer: answerKey,
        explanation: exercise.explanation,
        alreadyAnswered: true,
      };
    }

    const isCorrect = this.evaluateAnswer(exercise.type, answer, answerKey);

    await this.prisma.studyAnswer.update({
      where: { id: exercise.id },
      data: {
        userAnswer: answer,
        isCorrect,
        score: isCorrect ? 100 : 0,
      },
    });

    return {
      index: exerciseIndex,
      isCorrect,
      correctAnswer: answerKey,
      explanation: exercise.explanation,
      alreadyAnswered: false,
    };
  }

  async complete(sessionId: string, userId: string) {
    const session = await this.prisma.studySession.findUnique({
      where: { id: sessionId },
      include: { answers: true },
    });

    if (!session) {
      throw new NotFoundException('Study session not found');
    }

    if (session.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (session.status === 'completed') {
      return this.findByIdFull(sessionId, userId);
    }

    const unanswered = session.answers.filter((a) => a.userAnswer == null);
    if (unanswered.length > 0) {
      await this.prisma.$transaction(
        unanswered.map((a) =>
          this.prisma.studyAnswer.update({
            where: { id: a.id },
            data: { isCorrect: false, score: 0 },
          }),
        ),
      );
    }

    const totalScore = session.answers.reduce((sum, a) => {
      if (a.score != null) return sum + a.score;
      if (a.isCorrect === false) return sum + 0;
      if (a.isCorrect === true) return sum + 100;
      return sum;
    }, 0);
    const score = Math.round(totalScore / session.answers.length);

    await this.prisma.studySession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        score,
        completedAt: new Date(),
      },
    });

    return this.findByIdFull(sessionId, userId);
  }

  private async generateExercises(formattedLesson: string, lessonTitle: string) {
    const params: GenerateStudyQuestionsParams = {
      lesson: formattedLesson,
      count: EXERCISE_COUNT,
      level: 'intermediate',
    };

    const response = await this.aiService.generateStudyQuestions(params);
    return response.questions;
  }

  private formatLesson(lesson: any): string {
    const parts: string[] = [];
    parts.push(`Title: ${lesson.title}`);
    parts.push(`Definition: ${lesson.definition}`);
    parts.push(`Rule: ${lesson.rule}`);
    const examples = Array.isArray(lesson.examples)
      ? (lesson.examples as string[]).join(', ')
      : '';
    if (examples) {
      parts.push(`Examples: ${examples}`);
    }
    if (lesson.part) {
      parts.unshift(`Part: ${lesson.part.name}`);
    }
    return parts.join('\n');
  }

  private evaluateAnswer(
    type: string,
    userAnswer: string,
    correctAnswer: string,
  ): boolean {
    const normalizedUser = String(userAnswer).trim().toLowerCase();
    const normalizedCorrect = correctAnswer.trim().toLowerCase();

    if (['multiple_choice', 'error_correction'].includes(type)) {
      return normalizedUser === normalizedCorrect;
    }

    if (type === 'fill_blank') {
      const acceptedAnswers = normalizedCorrect.split('|').map((a) => a.trim());
      return acceptedAnswers.some((a) => normalizedUser === a);
    }

    return normalizedUser === normalizedCorrect;
  }
}
