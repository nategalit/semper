-- Adds a lightweight counts column so the settings UI can show
-- per-type element totals without loading the full content blob.
ALTER TABLE imported_content
  ADD COLUMN IF NOT EXISTS element_counts jsonb NOT NULL DEFAULT '{}'::jsonb;
