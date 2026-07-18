import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@langapp.com';

  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingUser) {
    console.log('Admin user already exists');
  } else {
    const auth = betterAuth({
      database: prismaAdapter(prisma, { provider: 'postgresql' }),
      emailAndPassword: { enabled: true },
    });

    await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: 'admin123',
        name: 'Admin',
      },
    });

    await prisma.user.update({
      where: { email: adminEmail },
      data: { role: 'admin', emailVerified: true },
    });

    console.log('Admin user created');
  }

  const providerCount = await prisma.aiProvider.count();
  if (providerCount === 0) {
    await prisma.aiProvider.create({
      data: {
        name: 'OpenRouter',
        providerType: 'openrouter',
        apiKey: '',
        isActive: false,
      },
    });
    console.log('Default AI provider created');
  } else {
    console.log('AI providers already exist');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
