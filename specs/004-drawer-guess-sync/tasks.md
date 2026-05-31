---
description: "Tasks for Drawer & Guess Sync feature"
---

# Tasks: Drawer & Guess Sync

**Input**: Design documents from `/specs/004-drawer-guess-sync/`

## Phase 1: Backend API & Validation

- [ ] T001 Add Zod schema for guess payload in `backend/src/api/schemas.ts` and tests in `backend/src/api/schemas.test.ts` (trim + max length + non-empty).
- [ ] T002 Implement POST `/rooms/:roomId/guesses` in `backend/src/api/rooms.ts` to validate, score, and persist guesses.
- [ ] T003 Implement GET `/rooms/:roomId/guesses` to return ordered guess history.

## Phase 2: Persistence & Scoring

- [ ] T004 Extend room model (`backend/src/models/game.ts`) to include `guesses: Guess[]` and simple canvas event storage for drawer.
- [ ] T005 Implement scoring logic in `backend/src/services/roomStore.ts` to award +100 for correct guesses and update player scores; add unit tests.

## Phase 3: Frontend Integration

- [ ] T006 Add client-side trimming and validation in `frontend/src/services/api.ts` and `frontend/src/utils/validation.ts`.
- [ ] T007 Implement guess submission UI and error handling in `frontend/src/components/GuessForm.tsx` (or update existing) and tests.
- [ ] T008 Implement polling in `frontend/src/services/polling.ts` to poll `/rooms/:roomId/guesses` and update `roomStore` with latest history.

## Phase 4: Integration Tests & Docs

- [ ] T009 Add integration test simulating a drawer and two guessers: submit guesses (trimmed, mixed case, empty) and assert history, scoring, and rehydration for drawer canvas.
- [ ] T010 Update `specs/004-drawer-guess-sync/quickstart.md` with manual testing steps and recommended polling interval.

## Notes

- Keep changes minimal and well-typed; follow repository testing patterns (Vitest).
