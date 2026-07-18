import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserStats(userId: string) {
    const exams = await this.prisma.exam.findMany({
      where: { userId, status: 'completed' },
      orderBy: { completedAt: 'desc' },
      select: {
        id: true,
        score: true,
        questionCount: true,
        createdAt: true,
        completedAt: true,
      },
    });

    const totalExams = exams.length;
    const scores = exams
      .map((e) => e.score)
      .filter((s): s is number => s !== null);
    const averageScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : null;
    const bestScore = scores.length > 0 ? Math.max(...scores) : null;

    const recentExams = exams.slice(0, 5).map((e) => ({
      id: e.id,
      score: e.score,
      questionCount: e.questionCount,
      date: e.completedAt || e.createdAt,
    }));

    return {
      totalExams,
      averageScore,
      bestScore,
      recentExams,
    };
  }

  async getAdminStats() {
    const [totalUsers, totalExams, avgResult, activeProvider] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.exam.count({
          where: { status: 'completed' },
        }),
        this.prisma.exam.aggregate({
          where: { status: 'completed', score: { not: null } },
          _avg: { score: true },
        }),
        this.prisma.aiProvider.findFirst({
          where: { isActive: true },
          select: { name: true, providerType: true },
        }),
      ]);

    return {
      totalUsers,
      totalExams,
      averageScore: avgResult._avg.score
        ? Math.round(avgResult._avg.score)
        : null,
      activeProvider: activeProvider
        ? {
            name: activeProvider.name,
            type: activeProvider.providerType,
          }
        : null,
    };
  }
}
