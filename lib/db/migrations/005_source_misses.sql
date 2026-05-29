-- Add source_misses column to track unrecognized book name strings found during sync.
-- Each entry: { source: string, abbrev: string, count: number }
ALTER TABLE imported_content
  ADD COLUMN IF NOT EXISTS source_misses jsonb NOT NULL DEFAULT '[]'::jsonb;
