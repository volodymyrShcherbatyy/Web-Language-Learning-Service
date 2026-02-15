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
