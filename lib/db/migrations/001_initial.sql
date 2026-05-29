-- Run this migration in your Supabase project's SQL editor.
-- Dashboard → SQL Editor → New query → paste and run.

-- ─── Characters ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS characters (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  level      integer     NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 20),
  race_id    text,
  class_id   text,
  data       jsonb       NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS characters_user_id_idx    ON characters(user_id);
CREATE INDEX IF NOT EXISTS characters_updated_at_idx ON characters(updated_at DESC);

-- ─── Row Level Security ───────────────────────────────────────────────────────

ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- Users can only read and modify their own characters.
CREATE POLICY "users can manage own characters"
  ON characters
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── updated_at trigger ───────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER characters_updated_at
  BEFORE UPDATE ON characters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
