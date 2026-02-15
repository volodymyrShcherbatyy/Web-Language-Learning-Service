# Web Language Learning Service

Backend service implementing a learning system layer with SQL-backed progress tracking and session orchestration.

## Stack
- Node.js + Express
- PostgreSQL SQL queries via `pg`
- JWT + bcrypt compatibility

## Run
```bash
npm install
npm start
```

## Required environment variables
- `PORT` (optional, default `3000`)
- `DATABASE_URL`
- `JWT_SECRET`

## Learning API
- `POST /api/learning/sessions` — creates a learning session from current user progress
- `GET /api/learning/sessions/:sessionId` — reads session details and queued exercises
- `POST /api/learning/sessions/:sessionId/answers` — submits answer result and updates progress/session counters

## Migration
Apply SQL migration:
- `db/migrations/20260215_learning_system.sql`
