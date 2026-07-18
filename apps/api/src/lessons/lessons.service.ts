import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const parts = await this.prisma.lessonPart.findMany({
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    return parts;
  }

  async findById(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: { part: true },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  async create(data: {
    partId: string;
    order: number;
    title: string;
    definition: string;
    rule: string;
    examples: string[];
  }) {
    const part = await this.prisma.lessonPart.findUnique({
      where: { id: data.partId },
    });

    if (!part) {
      throw new NotFoundException('Lesson part not found');
    }

    return this.prisma.lesson.create({
      data: {
        partId: data.partId,
        order: data.order,
        title: data.title,
        definition: data.definition,
        rule: data.rule,
        examples: data.examples,
      },
      include: { part: true },
    });
  }

  async update(
    id: string,
    data: {
      partId?: string;
      order?: number;
      title?: string;
      definition?: string;
      rule?: string;
      examples?: string[];
    },
  ) {
    const existing = await this.findById(id);

    if (data.partId) {
      const part = await this.prisma.lessonPart.findUnique({
        where: { id: data.partId },
      });
      if (!part) {
        throw new NotFoundException('Lesson part not found');
      }
    }

    return this.prisma.lesson.update({
      where: { id },
      data: {
        partId: data.partId ?? existing.partId,
        order: data.order ?? existing.order,
        title: data.title ?? existing.title,
        definition: data.definition ?? existing.definition,
        rule: data.rule ?? existing.rule,
        examples: data.examples ?? (existing.examples as string[]),
      },
      include: { part: true },
    });
  }

  async delete(id: string) {
    await this.findById(id);

    await this.prisma.lesson.delete({ where: { id } });

    return { message: 'Lesson deleted' };
  }
}
