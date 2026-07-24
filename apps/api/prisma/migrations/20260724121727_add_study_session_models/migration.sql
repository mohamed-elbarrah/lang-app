-- CreateEnum
CREATE TYPE "StudySessionStatus" AS ENUM ('in_progress', 'completed');

-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "status" "StudySessionStatus" NOT NULL DEFAULT 'in_progress',
    "score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyAnswer" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "content" JSONB NOT NULL,
    "userAnswer" TEXT,
    "correctAnswer" TEXT,
    "isCorrect" BOOLEAN,
    "score" INTEGER,
    "explanation" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudyAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudySession_userId_idx" ON "StudySession"("userId");

-- CreateIndex
CREATE INDEX "StudySession_userId_lessonId_idx" ON "StudySession"("userId", "lessonId");

-- CreateIndex
CREATE INDEX "StudySession_userId_status_idx" ON "StudySession"("userId", "status");

-- CreateIndex
CREATE INDEX "StudyAnswer_sessionId_idx" ON "StudyAnswer"("sessionId");

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyAnswer" ADD CONSTRAINT "StudyAnswer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "StudySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
