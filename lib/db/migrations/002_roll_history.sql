CREATE TABLE IF NOT EXISTS roll_history (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id  uuid        NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  user_id       uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rolled_at     timestamptz NOT NULL DEFAULT now(),
  label         text        NOT NULL,
  dice          text        NOT NULL,
  results       jsonb       NOT NULL,
  modifier      int         NOT NULL DEFAULT 0,
  total         int         NOT NULL,
  mode          text        CHECK (mode IN ('advantage', 'disadvantage')),
  roll_type     text        NOT NULL DEFAULT 'other'
                              CHECK (roll_type IN ('attack','check','save','damage','other'))
);

ALTER TABLE roll_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users can manage own rolls"
  ON roll_history FOR ALL
  USING (user_id = auth.uid());

-- Keep the table lean: drop rolls older than 7 days automatically.
-- Requires pg_cron or periodic cleanup; for now just cap queries to 50 rows.
CREATE INDEX IF NOT EXISTS roll_history_character_id_rolled_at
  ON roll_history (character_id, rolled_at DESC);
