import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { createHash } from 'crypto';

interface CreateExamDto {
  questionCount?: number;
  partIds?: string[];
  correctionMode?: 'instant' | 'final';
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
