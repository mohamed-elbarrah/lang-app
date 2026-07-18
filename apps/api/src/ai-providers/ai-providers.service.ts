import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenRouterProvider } from '../ai/providers/openrouter.provider';

@Injectable()
export class AiProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    providerType: string;
    apiKey: string;
    baseUrl?: string;
    defaultModel?: string;
    isActive?: boolean;
  }) {
    if (data.isActive) {
      await this.deactivateOthers();
    }

    return this.prisma.aiProvider.create({
      data: {
        name: data.name,
        providerType: data.providerType || 'openrouter',
        apiKey: data.apiKey,
        baseUrl: data.baseUrl,
        defaultModel: data.defaultModel,
        isActive: data.isActive ?? false,
      },
      include: { models: true },
    });
  }

  async findAll() {
    return this.prisma.aiProvider.findMany({
      include: { models: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string) {
    const provider = await this.prisma.aiProvider.findUnique({
      where: { id },
      include: { models: true },
    });

    if (!provider) {
      throw new NotFoundException('AI provider not found');
    }

    return provider;
  }

  async update(
    id: string,
    data: {
      name?: string;
      apiKey?: string;
      baseUrl?: string;
      defaultModel?: string;
      isActive?: boolean;
    },
  ) {
    const existing = await this.findById(id);

    if (data.isActive && !existing.isActive) {
      await this.deactivateOthers();
    }

    return this.prisma.aiProvider.update({
      where: { id },
      data,
      include: { models: true },
    });
  }

  async delete(id: string) {
    await this.findById(id);

    await this.prisma.providerModel.deleteMany({ where: { providerId: id } });
    await this.prisma.aiProvider.delete({ where: { id } });

    return { message: 'AI provider deleted' };
  }

  async testConnection(id: string) {
    const provider = await this.findById(id);
    const impl = this.createProviderInstance(provider);
    return impl.testConnection();
  }

  async fetchModels(id: string) {
    const provider = await this.findById(id);

    if (!provider.apiKey) {
      throw new BadRequestException('Provider has no API key configured');
    }

    const impl = this.createProviderInstance(provider);
    const models = await impl.fetchModels();

    const existingModels = await this.prisma.providerModel.findMany({
      where: { providerId: id },
    });

    for (const model of models) {
      const existing = existingModels.find((m) => m.modelId === model.id);
      if (existing) {
        if (existing.modelName !== model.name) {
          await this.prisma.providerModel.update({
            where: { id: existing.id },
            data: { modelName: model.name },
          });
        }
      } else {
        await this.prisma.providerModel.create({
          data: {
            providerId: provider.id,
            modelId: model.id,
            modelName: model.name,
            isEnabled: false,
          },
        });
      }
    }

    return this.prisma.providerModel.findMany({
      where: { providerId: id },
      orderBy: { modelName: 'asc' },
    });
  }

  async updateModels(
    id: string,
    data: { models: { id: string; isEnabled: boolean }[] },
  ) {
    await this.findById(id);

    for (const model of data.models) {
      await this.prisma.providerModel.update({
        where: { id: model.id },
        data: { isEnabled: model.isEnabled },
      });
    }

    return this.prisma.providerModel.findMany({
      where: { providerId: id },
      orderBy: { modelName: 'asc' },
    });
  }

  private async deactivateOthers() {
    await this.prisma.aiProvider.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
  }

  private createProviderInstance(provider: {
    apiKey: string;
    baseUrl?: string | null;
    defaultModel?: string | null;
  }) {
    return new OpenRouterProvider(
      provider.apiKey,
      provider.defaultModel || 'openai/gpt-4o-mini',
      provider.baseUrl || undefined,
    );
  }
}
