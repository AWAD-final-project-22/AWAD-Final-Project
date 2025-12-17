-- AlterTable
ALTER TABLE "email_workflows"
ADD COLUMN "hasAttachment" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE
INDEX "email_workflows_userId_subject_idx" ON "email_workflows" ("userId", "subject");

-- CreateIndex
CREATE
INDEX "email_workflows_userId_from_idx" ON "email_workflows" ("userId", "from");

-- Enable pg_trgm extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create indexes for fuzzy search
CREATE
INDEX idx_email_workflows_subject_trgm ON email_workflows USING gin ("subject" gin_trgm_ops);

CREATE
INDEX idx_email_workflows_from_trgm ON email_workflows USING gin ("from" gin_trgm_ops);

CREATE
INDEX idx_email_workflows_snippet_trgm ON email_workflows USING gin ("snippet" gin_trgm_ops);

CREATE
INDEX idx_email_workflows_ai_summary_trgm ON email_workflows USING gin ("aiSummary" gin_trgm_ops);