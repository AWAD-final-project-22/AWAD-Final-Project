-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('INBOX', 'TODO', 'IN_PROGRESS', 'DONE', 'SNOOZED');

-- CreateTable
CREATE TABLE "email_workflows" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gmailMessageId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "snippet" TEXT,
    "status" "WorkflowStatus" NOT NULL DEFAULT 'INBOX',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3),
    "snoozedUntil" TIMESTAMP(3),
    "aiSummary" TEXT,
    "urgencyScore" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_workflows_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_workflows_userId_status_idx" ON "email_workflows"("userId", "status");

-- CreateIndex
CREATE INDEX "email_workflows_userId_snoozedUntil_idx" ON "email_workflows"("userId", "snoozedUntil");

-- CreateIndex
CREATE INDEX "email_workflows_userId_deadline_idx" ON "email_workflows"("userId", "deadline");

-- CreateIndex
CREATE UNIQUE INDEX "email_workflows_userId_gmailMessageId_key" ON "email_workflows"("userId", "gmailMessageId");

-- AddForeignKey
ALTER TABLE "email_workflows" ADD CONSTRAINT "email_workflows_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
