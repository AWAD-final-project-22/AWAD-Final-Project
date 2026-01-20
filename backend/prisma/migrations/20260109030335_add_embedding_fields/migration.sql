-- Enable pgvector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- AlterTable
ALTER TABLE "email_workflows" ADD COLUMN IF NOT EXISTS "embedding" vector(768);
ALTER TABLE "email_workflows" ADD COLUMN IF NOT EXISTS "embeddingStatus" TEXT DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX IF NOT EXISTS "email_workflows_userId_embeddingStatus_idx" ON "email_workflows"("userId", "embeddingStatus");
