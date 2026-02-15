BEGIN;

CREATE TABLE IF NOT EXISTS languages (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  native_language_id INT REFERENCES languages(id),
  learning_language_id INT REFERENCES languages(id),
  interface_language_id INT REFERENCES languages(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CHECK (
    native_language_id IS NULL
    OR learning_language_id IS NULL
    OR native_language_id <> learning_language_id
  )
);

CREATE TABLE IF NOT EXISTS concepts (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('word', 'phrase')),
  difficulty_level VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS translations (
  id SERIAL PRIMARY KEY,
  concept_id INT NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  language_id INT NOT NULL REFERENCES languages(id),
  text TEXT NOT NULL,
  UNIQUE(concept_id, language_id)
);

CREATE TABLE IF NOT EXISTS media (
  id SERIAL PRIMARY KEY,
  concept_id INT NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('image', 'gif')),
  file_url TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ui_translations (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) NOT NULL,
  language_id INT NOT NULL REFERENCES languages(id),
  text TEXT NOT NULL,
  UNIQUE(key, language_id)
);

INSERT INTO languages (code, name)
VALUES
  ('uk', 'Ukrainian'),
  ('sv', 'Swedish'),
  ('en', 'English')
ON CONFLICT (code) DO NOTHING;

COMMIT;
