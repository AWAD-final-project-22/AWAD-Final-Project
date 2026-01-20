-- Enable pg_trgm extension for fuzzy text search
-- This extension provides similarity() function for typo-tolerant matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN indexes for trigram similarity search on searchable fields
-- These indexes will speed up fuzzy search queries significantly
CREATE INDEX IF NOT EXISTS email_workflows_subject_trgm_idx 
  ON email_workflows USING GIN (subject gin_trgm_ops);

CREATE INDEX IF NOT EXISTS email_workflows_from_trgm_idx 
  ON email_workflows USING GIN ("from" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS email_workflows_snippet_trgm_idx 
  ON email_workflows USING GIN (snippet gin_trgm_ops);

CREATE INDEX IF NOT EXISTS email_workflows_ai_summary_trgm_idx 
  ON email_workflows USING GIN ("aiSummary" gin_trgm_ops);
