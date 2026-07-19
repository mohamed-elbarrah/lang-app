import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenRouterProvider } from '../ai/providers/openrouter.provider';

@Injectable()
export class AiProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    name: string;
    providerType?: string;
    apiKey: string;
    baseUrl?: string;
    defaultModel?: string;
    isActive?: boolean;
  }) {
    if (data.isActive && !data.apiKey) {
      throw new BadRequestException('Cannot create an active provider without an API key');
    }

    return this.prisma.$transaction(async (tx) => {
      if (data.isActive) {
        await tx.aiProvider.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
      }

      const provider = await tx.aiProvider.create({
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

      return this.toSafeProvider(provider);
    });
  }

  async findAll() {
    const providers = await this.prisma.aiProvider.findMany({
      include: { models: true },
      orderBy: { name: 'asc' },
    });

    return this.toSafeProviderList(providers);
  }

  async findById(id: string) {
    const provider = await this.prisma.aiProvider.findUnique({
      where: { id },
      include: { models: true },
    });

    if (!provider) {
      throw new NotFoundException('AI provider not found');
    }

    return this.toSafeProvider(provider);
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
    const existing = await this.prisma.aiProvider.findUnique({
      where: { id },
      include: { models: true },
    });

    if (!existing) {
      throw new NotFoundException('AI provider not found');
    }

    if (data.isActive && !existing.apiKey && !data.apiKey) {
      throw new BadRequestException('Cannot activate provider without an API key');
    }

    return this.prisma.$transaction(async (tx) => {
      if (data.isActive && !existing.isActive) {
        await tx.aiProvider.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
      }

      const provider = await tx.aiProvider.update({
        where: { id },
        data,
        include: { models: true },
      });

      return this.toSafeProvider(provider);
    });
  }

  async delete(id: string) {
    await this.findById(id);

    await this.prisma.$transaction(async (tx) => {
      await tx.providerModel.deleteMany({ where: { providerId: id } });
      await tx.aiProvider.delete({ where: { id } });
    });

    return { message: 'AI provider deleted' };
  }

  async testConnection(id: string) {
    const provider = await this.prisma.aiProvider.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new NotFoundException('AI provider not found');
    }

    const impl = this.createProviderInstance(provider);
    return impl.testConnection();
  }

  async fetchModels(id: string, tempApiKey?: string) {
    const provider = await this.prisma.aiProvider.findUnique({
      where: { id },
    });

    if (!provider) {
      throw new NotFoundException('AI provider not found');
    }

    const apiKey = tempApiKey || provider.apiKey;

    if (!apiKey) {
      throw new BadRequestException('Provider has no API key configured');
    }

    const impl = new OpenRouterProvider(
      apiKey,
      provider.defaultModel || 'openai/gpt-4o-mini',
      provider.baseUrl || undefined,
    );
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

    await this.prisma.$transaction(async (tx) => {
      for (const model of data.models) {
        const existing = await tx.providerModel.findUnique({
          where: { id: model.id },
        });

        if (!existing || existing.providerId !== id) {
          throw new NotFoundException(
            `Model with id "${model.id}" not found for this provider`,
          );
        }

        await tx.providerModel.update({
          where: { id: model.id },
          data: { isEnabled: model.isEnabled },
        });
      }
    });

    return this.prisma.providerModel.findMany({
      where: { providerId: id },
      orderBy: { modelName: 'asc' },
    });
  }

  private maskApiKey(apiKey: string): string {
    if (apiKey.length <= 8) return '****';
    return apiKey.slice(0, 4) + '****' + apiKey.slice(-4);
  }

  private toSafeProvider(provider: any) {
    const { apiKey, ...safe } = provider;
    return {
      ...safe,
      hasApiKey: !!apiKey,
      apiKey: apiKey ? this.maskApiKey(apiKey) : null,
    };
  }

  private toSafeProviderList(providers: any[]) {
    return providers.map(p => this.toSafeProvider(p));
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
