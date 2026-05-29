CREATE TABLE IF NOT EXISTS imported_content (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label          text        NOT NULL,
  index_url      text        NOT NULL,
  enabled        boolean     NOT NULL DEFAULT true,
  last_synced_at timestamptz,
  spell_count    int         NOT NULL DEFAULT 0,
  content        jsonb       NOT NULL DEFAULT '[]'::jsonb,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE imported_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own content"
  ON imported_content FOR ALL
  USING (user_id = auth.uid());

CREATE INDEX imported_content_user_enabled
  ON imported_content (user_id, enabled);
