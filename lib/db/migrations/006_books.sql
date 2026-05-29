-- Track the unique abbreviated book names found in each content source sync.
-- disabled_books stores the user-selected subset of books to exclude from queries.
ALTER TABLE imported_content
  ADD COLUMN IF NOT EXISTS books jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE imported_content
  ADD COLUMN IF NOT EXISTS disabled_books jsonb NOT NULL DEFAULT '[]'::jsonb;
