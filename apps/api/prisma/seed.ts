import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, 'sha512')
    .toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  const adminEmail = 'admin@langapp.com';

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existing) {
    await prisma.user.create({
      data: {
        name: 'Admin',
        email: adminEmail,
        passwordHash: hashPassword('admin123'),
        role: 'admin',
      },
    });
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
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
