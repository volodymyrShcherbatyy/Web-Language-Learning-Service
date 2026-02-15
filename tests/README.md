# QA Automation Test Suite

## Coverage map

- `tests/auth`: registration, login, JWT validation checks.
- `tests/profile`: onboarding/profile language selection and protected-route checks.
- `tests/lesson`: lesson start/next/answer/session completion + performance smoke check.
- `tests/summary`: summary accuracy and mistake aggregation.
- `tests/admin`: role authorization and admin CRUD API validation.
- `tests/localization`: localization loading/fallback behavior.
- `tests/integration`: progress tracking and lesson flow integration with mocked DB.
- `tests/api`: Postman collection for black-box API regression.

## Run

```bash
npm test
```

This runs backend Jest + frontend Jest suites.
