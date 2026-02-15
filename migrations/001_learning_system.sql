BEGIN;

CREATE TABLE IF NOT EXISTS Learning_Sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
  total_exercises INTEGER NOT NULL DEFAULT 0,
  completed_exercises INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  wrong_answers INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ NULL
);

CREATE TABLE IF NOT EXISTS User_Progress (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
  concept_id BIGINT NOT NULL REFERENCES Concepts(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'learning', 'learned')),
  correct_answers INTEGER NOT NULL DEFAULT 0,
  wrong_answers INTEGER NOT NULL DEFAULT 0,
  last_seen_at TIMESTAMPTZ NULL,
  next_review_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, concept_id)
);

CREATE TABLE IF NOT EXISTS Session_Exercises (
  id BIGSERIAL PRIMARY KEY,
  session_id BIGINT NOT NULL REFERENCES Learning_Sessions(id) ON DELETE CASCADE,
  concept_id BIGINT NOT NULL REFERENCES Concepts(id) ON DELETE CASCADE,
  exercise_type VARCHAR(30) NOT NULL,
  order_index INTEGER NOT NULL,
  result VARCHAR(20) NULL CHECK (result IN ('correct', 'wrong')),
  UNIQUE(session_id, order_index),
  UNIQUE(session_id, concept_id, exercise_type)
);

CREATE TABLE IF NOT EXISTS Exercises_Log (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
  concept_id BIGINT NOT NULL REFERENCES Concepts(id) ON DELETE CASCADE,
  exercise_type VARCHAR(30) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  session_id BIGINT NOT NULL REFERENCES Learning_Sessions(id) ON DELETE CASCADE,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_progress_user_status ON User_Progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_progress_review ON User_Progress(user_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_user_started ON Learning_Sessions(user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_exercises_session_order ON Session_Exercises(session_id, order_index);
CREATE INDEX IF NOT EXISTS idx_exercises_log_user_answered ON Exercises_Log(user_id, answered_at DESC);
CREATE INDEX IF NOT EXISTS idx_exercises_log_session ON Exercises_Log(session_id);

COMMIT;
