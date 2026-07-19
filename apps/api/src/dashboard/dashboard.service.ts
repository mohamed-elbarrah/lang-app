import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserStats(userId: string) {
    const [totalExams, aggregate, recentExams] = await Promise.all([
      this.prisma.exam.count({
        where: { userId, status: 'completed' },
      }),
      this.prisma.exam.aggregate({
        where: { userId, status: 'completed', score: { not: null } },
        _avg: { score: true },
        _max: { score: true },
      }),
      this.prisma.exam.findMany({
        where: { userId, status: 'completed' },
        orderBy: { completedAt: 'desc' },
        take: 5,
        select: {
          id: true,
          score: true,
          questionCount: true,
          createdAt: true,
          completedAt: true,
        },
      }),
    ]);

    return {
      totalExams,
      averageScore: aggregate._avg.score
        ? Math.round(aggregate._avg.score)
        : null,
      bestScore: aggregate._max.score ?? null,
      recentExams: recentExams.map((e) => ({
        id: e.id,
        score: e.score,
        questionCount: e.questionCount,
        date: e.completedAt || e.createdAt,
      })),
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
