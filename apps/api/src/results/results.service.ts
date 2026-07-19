import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResultsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    userId: string,
    params: { page?: number; limit?: number },
  ) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const [exams, total] = await Promise.all([
      this.prisma.exam.findMany({
        where: { userId, status: 'completed' },
        skip,
        take: limit,
        orderBy: { completedAt: 'desc' },
        select: {
          id: true,
          questionCount: true,
          correctionMode: true,
          score: true,
          createdAt: true,
          completedAt: true,
        },
      }),
      this.prisma.exam.count({
        where: { userId, status: 'completed' },
      }),
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

  async findById(examId: string, userId: string) {
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

    const correctCount = exam.questions.filter(
      (q) => q.isCorrect === true,
    ).length;
    const incorrectCount = exam.questions.filter(
      (q) => q.isCorrect === false,
    ).length;
    const unansweredCount = exam.questions.filter(
      (q) => q.isCorrect === null,
    ).length;

    const topicsToReview = exam.questions
      .filter((q) => q.isCorrect === false && q.lessonTopic)
      .map((q) => q.lessonTopic as string)
      .filter((v, i, a) => a.indexOf(v) === i);

    const safeQuestions = exam.questions.map(({ answerKey, ...q }) => q);

    return {
      ...exam,
      questions: safeQuestions,
      summary: {
        correctCount,
        incorrectCount,
        unansweredCount,
        totalQuestions: exam.questions.length,
        topicsToReview,
      },
    };
  }
}
