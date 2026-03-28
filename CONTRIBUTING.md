# Contributing

## Workflow

1. Create a feature branch.
2. Keep changes scoped and testable.
3. Run backend tests with `python -m pytest tests -q`.
4. Run frontend checks with `npx tsc --noEmit` and `npm run build`.
5. Open a pull request with a clear summary and verification notes.

## Standards

- Use SQLAlchemy models and services instead of raw SQL in app code.
- Use Pydantic schemas for API payloads.
- Keep frontend changes typed and API-driven.
- Preserve manual queue, auth, and campaign flow integrity.
