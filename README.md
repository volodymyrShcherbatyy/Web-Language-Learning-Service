# Web Language Learning Service (Learning System Layer)

## Folder Structure

```text
migrations/
  001_learning_system.sql
src/
  app.js
  config/
    db.js
  controllers/
    lessonController.js
  middleware/
    auth.js
  routes/
    lessonRoutes.js
  services/
    exerciseEngineService.js
    learningFlowService.js
    lessonService.js
    progressUpdaterService.js
    sessionBuilderService.js
```

## Setup
# Web Language Learning Service (Backend MVP)

## Project Structure

```
/project
├── /config
├── /controllers
├── /middlewares
├── /models
├── /routes
├── /services
├── /utils
└── app.js
```

## SQL Schema

Schema file: `sql/schema.sql`

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables:
   ```bash
   PORT=3000
   DATABASE_URL=postgres://user:password@localhost:5432/db_name
   JWT_SECRET=replace_me
   DB_SSL=false
   ```
3. Run SQL migration:
   ```bash
   psql "$DATABASE_URL" -f migrations/001_learning_system.sql
   ```
4. Start API:
2. Create env file:
   ```bash
   cp .env.example .env
   ```
3. Create database and apply schema:
   ```bash
   psql -U postgres -d language_learning -f sql/schema.sql
   ```
4. Start server:
   ```bash
   npm start
   ```

## Lesson Endpoints

All routes require `Authorization: Bearer <jwt>`.

- `POST /api/lesson/start`
- `GET /api/lesson/next?session_id=<id>&native_lang=en&target_lang=es`
- `POST /api/lesson/answer`
- `GET /api/lesson/summary?session_id=<id>`
## API Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `GET /profile`
- `PUT /profile/languages`
- `GET /concepts`
- `GET /concepts/:id`
- `POST /admin/concepts`
- `POST /admin/translations`
- `POST /admin/media`
- `GET /localization?lang=XX`

All responses:

- Success: `{ "success": true, "data": ... }`
- Error: `{ "success": false, "error": "message" }`
