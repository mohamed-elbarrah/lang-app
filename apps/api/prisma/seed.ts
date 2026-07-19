import { PrismaClient } from '@prisma/client';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

const prisma = new PrismaClient();

const lessonParts = [
  { name: 'The Present Tenses', order: 1 },
  { name: 'The Past Tenses', order: 2 },
  { name: 'The Future Tenses', order: 3 },
  { name: 'The Passive Voice', order: 4 },
  { name: 'Modal Verbs', order: 5 },
  { name: 'Advanced Structural Grammar', order: 6 },
];

const lessons = [
  // Part 1: The Present Tenses
  {
    partOrder: 1,
    order: 1,
    title: 'Present Simple',
    definition:
      'Used to express habits, general truths, and regular routines.',
    rule: '[Subject] + [Verb (s/es with he/she/it)]',
    examples: [
      'I drink coffee every morning.',
      'The sun rises in the east.',
      'Most people love traveling.',
    ],
  },
  {
    partOrder: 1,
    order: 2,
    title: 'Present Continuous',
    definition:
      'Used for actions happening exactly right now or temporary situations.',
    rule: '[Subject] + [am/is/are] + [Verb-ing]',
    examples: [
      'I am talking to my friend right now.',
      'She is looking for a new apartment.',
      'They are staying at a hotel this week.',
    ],
  },
  {
    partOrder: 1,
    order: 3,
    title: 'Present Perfect Simple',
    definition:
      'Used for past experiences where the exact time does not matter, or things connected to the present.',
    rule: '[Subject] + [have/has] + [Past Participle (V3)]',
    examples: [
      'I have visited Paris twice.',
      'He has lost his keys, so he cannot get in.',
      'We have lived here for five years.',
    ],
  },
  {
    partOrder: 1,
    order: 4,
    title: 'Present Perfect Continuous',
    definition:
      'Used to emphasize the duration of an ongoing action that started in the past and is still happening.',
    rule: '[Subject] + [have/has] + been + [Verb-ing]',
    examples: [
      'I have been waiting for the bus for an hour.',
      'It has been raining all day.',
      'They have been talking on the phone since 9 AM.',
    ],
  },
  // Part 2: The Past Tenses
  {
    partOrder: 2,
    order: 1,
    title: 'Past Simple',
    definition:
      'Used for completed actions that started and finished at a specific time in the past.',
    rule: '[Subject] + [Past Verb (V2)]',
    examples: [
      'I watched a great movie last night.',
      'We moved to this city in 2021.',
      'She cooked a delicious dinner yesterday.',
    ],
  },
  {
    partOrder: 2,
    order: 2,
    title: 'Past Continuous',
    definition:
      'Used to describe an action that was progressively happening at a specific moment in the past.',
    rule: '[Subject] + [was/were] + [Verb-ing]',
    examples: [
      'I was sleeping when you called me.',
      'They were walking in the park at 5 PM.',
      'She was listening to music while studying.',
    ],
  },
  {
    partOrder: 2,
    order: 3,
    title: 'Past Perfect Simple',
    definition:
      'Used to show which of two past actions happened first (the older past).',
    rule: '[Subject] + [had] + [Past Participle (V3)]',
    examples: [
      'The train had left before I arrived at the station.',
      'She had already eaten lunch when I invited her.',
      'I realized that I had forgotten my wallet at home.',
    ],
  },
  {
    partOrder: 2,
    order: 4,
    title: 'Past Perfect Continuous',
    definition:
      'Used to show the duration of an ongoing action up until a specific point in the past.',
    rule: '[Subject] + [had] + been + [Verb-ing]',
    examples: [
      'He had been driving for four hours before he took a break.',
      'They had been living in London for years before they learned English.',
      'She had been working out all morning, so she was exhausted.',
    ],
  },
  // Part 3: The Future Tenses
  {
    partOrder: 3,
    order: 1,
    title: 'Future Simple (Will)',
    definition:
      'Used for instant decisions, promises, offers, or general predictions.',
    rule: '[Subject] + will + [Base Verb]',
    examples: [
      'I am tired; I think I will go to bed.',
      'Do not worry, I will help you tomorrow.',
      'I think it will rain next week.',
    ],
  },
  {
    partOrder: 3,
    order: 2,
    title: 'Future Simple (Going to)',
    definition:
      'Used for prior plans, intentions, or predictions based on clear evidence.',
    rule: '[Subject] + [am/is/are] + going to + [Base Verb]',
    examples: [
      'I am going to visit my family this weekend.',
      'Look at those black clouds; it is going to rain.',
      'We are going to buy a new car next month.',
    ],
  },
  {
    partOrder: 3,
    order: 3,
    title: 'Future Continuous',
    definition:
      'Used to describe an action that will be progressively happening at a specific point in the future.',
    rule: '[Subject] + will be + [Verb-ing]',
    examples: [
      'This time tomorrow, I will be flying to New York.',
      'Do not call me at 8 PM; I will be watching the game.',
      'They will be having dinner when you arrive.',
    ],
  },
  {
    partOrder: 3,
    order: 4,
    title: 'Future Perfect Simple',
    definition:
      'Used to state that an action will be completely finished before a specific point in the future.',
    rule: '[Subject] + will have + [Past Participle (V3)]',
    examples: [
      'By 10 PM, I will have finished my homework.',
      'They will have lived here for ten years by next month.',
      'Call me at 9; the meeting will have ended by then.',
    ],
  },
  {
    partOrder: 3,
    order: 5,
    title: 'Future Perfect Continuous',
    definition:
      'Used to project into the future and look back at the duration of an ongoing action.',
    rule: '[Subject] + will have been + [Verb-ing]',
    examples: [
      'By midnight, I will have been studying for five hours.',
      'In December, she will have been working at this school for three years.',
      'By the time you wake up, they will have been traveling for twelve hours.',
    ],
  },
  // Part 4: The Passive Voice
  {
    partOrder: 4,
    order: 1,
    title: 'Present Simple Passive',
    definition:
      'Used for regular occurrences, general facts, or routines where the doer is unknown or unimportant.',
    rule: '[Object] + [am/is/are] + [Past Participle (V3)]',
    examples: [
      'Coffee is grown in Brazil.',
      'The letters are delivered every afternoon.',
      'Spanish is spoken in many countries.',
    ],
  },
  {
    partOrder: 4,
    order: 2,
    title: 'Present Continuous Passive',
    definition:
      'Used for actions that are being received or undergoing a process right now.',
    rule: '[Object] + [am/is/are] + being + [Past Participle (V3)]',
    examples: [
      'My car is being repaired at the shop right now.',
      'The house is being painted this week.',
      'The dinner is being cooked at the moment.',
    ],
  },
  {
    partOrder: 4,
    order: 3,
    title: 'Present Perfect Passive',
    definition:
      'Used for completed recent actions where the result on the object matters most.',
    rule: '[Object] + [have/has] + been + [Past Participle (V3)]',
    examples: [
      'The keys have been found.',
      'The movie has been watched by millions.',
      'The window has been broken.',
    ],
  },
  {
    partOrder: 4,
    order: 4,
    title: 'Past Simple Passive',
    definition:
      'Used for a completed past action focused on the receiver.',
    rule: '[Object] + [was/were] + [Past Participle (V3)]',
    examples: [
      'The book was written in 1990.',
      'The cake was eaten yesterday.',
      'The packages were delivered this morning.',
    ],
  },
  {
    partOrder: 4,
    order: 5,
    title: 'Past Continuous Passive',
    definition:
      'Used for an action that was undergoing a process at a specific past moment.',
    rule: '[Object] + [was/were] + being + [Past Participle (V3)]',
    examples: [
      'The road was being paved when we drove past.',
      'The meeting was being recorded.',
      'The dogs were being fed when the guests arrived.',
    ],
  },
  {
    partOrder: 4,
    order: 6,
    title: 'Past Perfect Passive',
    definition:
      'Used to show that a passive action occurred before another past milestone.',
    rule: '[Object] + had been + [Past Participle (V3)]',
    examples: [
      'The room had been cleaned before the guests arrived.',
      'The wallet had been stolen before he realized it.',
      'The problem had been solved before the boss asked.',
    ],
  },
  {
    partOrder: 4,
    order: 7,
    title: 'Future Simple Passive',
    definition:
      'Used to indicate actions that will be performed on an object in the future.',
    rule: '[Object] + will be + [Past Participle (V3)]',
    examples: [
      'The results will be announced tomorrow.',
      'The packages will be shipped next Monday.',
      'A new park will be built in the neighborhood.',
    ],
  },
  {
    partOrder: 4,
    order: 8,
    title: 'Future Perfect Passive',
    definition:
      'Used to express that an action will have been done to an object by a certain time.',
    rule: '[Object] + will have been + [Past Participle (V3)]',
    examples: [
      'The project will have been finished by Friday.',
      'The dinner will have been prepared before you get home.',
      'All tickets will have been sold by tomorrow morning.',
    ],
  },
  // Part 5: Modal Verbs
  {
    partOrder: 5,
    order: 1,
    title: 'Can / Could',
    definition:
      'Used to express present or past ability, ask for permission, or make requests.',
    rule: '[Subject] + can/could + [Base Verb]',
    examples: [
      'I can speak three languages fluently.',
      'Could you please pass the salt?',
      'When I was young, I could run very fast.',
    ],
  },
  {
    partOrder: 5,
    order: 2,
    title: 'May / Might',
    definition:
      'Used to express a strong or weak possibility, or to ask for permission formally.',
    rule: '[Subject] + may/might + [Base Verb]',
    examples: [
      'Take an umbrella; it may rain later.',
      'I might travel to Tokyo next year, but I am not sure.',
      'May I use your restroom, please?',
    ],
  },
  {
    partOrder: 5,
    order: 3,
    title: 'Must / Have to',
    definition:
      'Used to express strong internal feelings of obligation, rules, laws, or logical certainty.',
    rule: '[Subject] + must/have to + [Base Verb]',
    examples: [
      'You must stop when the traffic light is red.',
      'I have to wake up early tomorrow for an interview.',
      'He has been working for 12 hours; he must be tired.',
    ],
  },
  {
    partOrder: 5,
    order: 4,
    title: 'Should / Ought to',
    definition:
      'Used to offer advice, opinions, suggestions, or express logical expectations.',
    rule: '[Subject] + should/ought to + [Base Verb]',
    examples: [
      'You should eat more vegetables for your health.',
      'We ought to leave now or we will be late.',
      'The weather is clear; the plane should arrive on time.',
    ],
  },
  {
    partOrder: 5,
    order: 5,
    title: 'Would',
    definition:
      'Used for imaginary situations, polite offers, requests, or past repeated habits.',
    rule: '[Subject] + would + [Base Verb]',
    examples: [
      'Would you like a cup of tea?',
      'If I won the lottery, I would buy a house.',
      'When we were kids, we would play outside every day.',
    ],
  },
  // Part 6: Advanced Structural Grammar
  {
    partOrder: 6,
    order: 1,
    title: 'Conditionals (Type 0 & 1)',
    definition:
      'Type 0 is for absolute facts and truths. Type 1 is for highly likely future outcomes.',
    rule:
      'Type 0: If + Present Simple, Present Simple\nType 1: If + Present Simple, Will + Base Verb',
    examples: [
      'If you freeze water, it becomes ice.',
      'If it rains tomorrow, I will stay at home.',
      'If you exercise regularly, you feel healthier.',
    ],
  },
  {
    partOrder: 6,
    order: 2,
    title: 'Conditionals (Type 2 & 3)',
    definition:
      'Type 2 is for unreal or imaginary situations in the present. Type 3 is for past regrets or imaginary past scenarios.',
    rule:
      'Type 2: If + Past Simple, Would + Base Verb\nType 3: If + Past Perfect, Would have + Past Participle (V3)',
    examples: [
      'If I spoke fluent English, I would travel the world.',
      'If I had studied harder, I would have passed the test.',
      'If she were taller, she would play basketball.',
    ],
  },
  {
    partOrder: 6,
    order: 3,
    title: 'Reported Speech',
    definition:
      'Used to report what someone else said without using exact quotes.',
    rule: 'Tenses shift backward (e.g., Present Simple becomes Past Simple)',
    examples: [
      'He said that he was happy.',
      'She told me that she had lost her wallet.',
      'They said that they would visit the next day.',
    ],
  },
  {
    partOrder: 6,
    order: 4,
    title: 'Relative Clauses',
    definition:
      'Used to define or give more information about a noun using who, which, that, where.',
    rule: '[Noun] + [who/which/that/where] + [Clause]',
    examples: [
      'The man who lives next door is a doctor.',
      'This is the book that inspired me to change my life.',
      'I remember the restaurant where we had our first dinner.',
    ],
  },
  {
    partOrder: 6,
    order: 5,
    title: 'Inversion',
    definition:
      'Used to add extreme dramatic emphasis or variety by flipping the subject and auxiliary verb.',
    rule: '[Negative Word] + [Auxiliary Verb] + [Subject] + [Main Verb]',
    examples: [
      'Never have I seen such a beautiful sunset.',
      'Rarely does he come late to appointments.',
      'Not only did she cook dinner, but she also cleaned the house.',
    ],
  },
  {
    partOrder: 6,
    order: 6,
    title: 'Causative Verbs',
    definition:
      'Used when you do not do an action yourself, but arrange for someone else to perform it for you.',
    rule: '[Subject] + [have/get] + [Object] + [Past Participle (V3)]',
    examples: [
      'I need to have my hair cut this weekend.',
      'She got her car washed yesterday.',
      'We are going to have our house painted next summer.',
    ],
  },
];

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@langapp.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (process.env.NODE_ENV === 'production' && adminPassword === 'admin123') {
    console.warn('WARNING: Using default admin password in production is insecure. Set ADMIN_PASSWORD env var.');
  }

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
        password: adminPassword,
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

  const lessonCount = await prisma.lesson.count();
  if (lessonCount === 0) {
    const createdParts = await Promise.all(
      lessonParts.map((part) =>
        prisma.lessonPart.create({ data: part }),
      ),
    );

    const partMap = new Map(
      createdParts.map((p) => [p.order, p.id]),
    );

    await Promise.all(
      lessons.map((lesson) =>
        prisma.lesson.create({
          data: {
            partId: partMap.get(lesson.partOrder)!,
            order: lesson.order,
            title: lesson.title,
            definition: lesson.definition,
            rule: lesson.rule,
            examples: lesson.examples,
          },
        }),
      ),
    );

    console.log(`${lessons.length} lessons seeded`);
  } else {
    console.log('Lessons already exist');
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
