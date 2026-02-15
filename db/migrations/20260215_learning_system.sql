-- Learning System schema extension for Language Learning Platform

CREATE TABLE IF NOT EXISTS learning_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_exercises INTEGER NOT NULL DEFAULT 0 CHECK (total_exercises >= 0),
  completed_exercises INTEGER NOT NULL DEFAULT 0 CHECK (completed_exercises >= 0),
  correct_answers INTEGER NOT NULL DEFAULT 0 CHECK (correct_answers >= 0),
  wrong_answers INTEGER NOT NULL DEFAULT 0 CHECK (wrong_answers >= 0),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS user_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  concept_id BIGINT NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  status VARCHAR(16) NOT NULL CHECK (status IN ('new', 'learning', 'learned')),
  correct_answers INTEGER NOT NULL DEFAULT 0 CHECK (correct_answers >= 0),
  wrong_answers INTEGER NOT NULL DEFAULT 0 CHECK (wrong_answers >= 0),
  last_seen_at TIMESTAMPTZ,
  next_review_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, concept_id)
);

CREATE TABLE IF NOT EXISTS session_exercises (
  id BIGSERIAL PRIMARY KEY,
  session_id BIGINT NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
  concept_id BIGINT NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  exercise_type VARCHAR(32) NOT NULL,
  order_index INTEGER NOT NULL CHECK (order_index > 0),
  result VARCHAR(16) CHECK (result IN ('correct', 'wrong')),
  UNIQUE (session_id, order_index)
);

CREATE TABLE IF NOT EXISTS exercises_log (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  concept_id BIGINT NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  exercise_type VARCHAR(32) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  session_id BIGINT NOT NULL REFERENCES learning_sessions(id) ON DELETE CASCADE,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_status_review
  ON user_progress (user_id, status, next_review_at);

CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_started
  ON learning_sessions (user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_session_exercises_session_order
  ON session_exercises (session_id, order_index);

CREATE INDEX IF NOT EXISTS idx_exercises_log_user_answered
  ON exercises_log (user_id, answered_at DESC);
