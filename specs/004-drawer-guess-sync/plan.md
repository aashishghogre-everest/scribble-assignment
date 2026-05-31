# Plan: Drawer & Guess Sync

## Goal

Implement guess submission, validation, scoring, and polling-based synchronization so guess history is consistent across players and drawer canvas state persists for the drawer.

## High-level Steps

1. API: Add POST `/rooms/:roomId/guesses` and GET `/rooms/:roomId/guesses` endpoints (backend).
2. Validation: Add Zod schemas for guess payloads (trim + length checks) and tests.
3. Scoring: Implement scoring logic (100 for correct, 0 otherwise) and persist to player scores.
4. Persistence: Extend room state to store guess history and canvas actions for the drawer.
5. Frontend: Add submit-guess flow, client-side trimming, and error handling; poll `GET /rooms/:roomId/guesses` to sync history.
6. Tests: Unit tests for validation and scoring; integration tests to assert history sync and scoring behavior.
7. Docs: Update quickstart and spec notes.

## Milestones

- M1: API + validation + unit tests
- M2: Scoring + persistence + integration test
- M3: Frontend submission + polling + visual verification
- M4: Documentation and cleanup

## Risks

- Polling frequency must balance timeliness vs server load; document recommended interval (e.g., 1s–3s during active round).
- Large guess histories may require pagination or trimmed transport; prefer small per-round histories.
