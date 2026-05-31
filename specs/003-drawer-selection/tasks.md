---
description: "Tasks for Drawer Selection & Word Visibility feature"
---

# Tasks: Drawer Selection & Word Visibility

**Input**: Design documents from `/specs/003-drawer-selection/`

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 [P] Ensure feature docs exist and reference paths in specs/003-drawer-selection/
- [ ] T002 [P] Update frontend input trimming/validation util in frontend/src/utils/validation.ts and tests in frontend/src/utils/validation.test.ts
- [ ] T003 [P] Add/verify server-side Zod schema for player `displayName` trimming and non-empty validation in backend/src/api/schemas.ts and tests in backend/src/api/schemas.test.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

- [ ] T004 Update `Player` and `Room` types to include `displayName` (trimmed), `joinOrder`, `isHost`, `seed`, and `starterWordList` in backend/src/models/game.ts
- [ ] T005 [P] Implement deterministic word selector util in backend/src/services/wordSelector.ts and unit tests in backend/src/services/wordSelector.test.ts (seed + round index)
- [ ] T006 Implement room-level checks and prevention of round start when `starterWordList` is empty in backend/src/services/roomStore.ts and tests in backend/src/services/roomStore.test.ts
- [ ] T007 Implement `startRound` server endpoint and access controls in backend/src/api/rooms.ts so drawer assignment (host or first-join) and secret-word retrieval (drawer-only) are enforced; add/extend integration tests in backend/src/api/rooms.test.ts

---

## Phase 3: User Story 1 - Start Round Drawer Assignment (Priority: P1) 🎯 MVP

**Goal**: Assign the drawer to the host (or first-joined player if host missing) and ensure only the drawer sees the secret word.

**Independent Test**: Create a room with N players, start the first round, and assert the drawer identity is set and only the drawer receives the secret word.

- [ ] T008 [US1] Update backend logic to set `Round.drawerPlayerId` when `startRound` is invoked in backend/src/services/roomStore.ts and persist `startedAt` in backend/src/models/game.ts
- [ ] T009 [US1] Add integration test that simulates: host starts round → host client receives secret word; non-drawers do not, in backend/src/api/rooms.test.ts
- [ ] T010 [US1] Update frontend `GamePage` to display `Drawer: <name>` to all players and display the secret word only on the drawer's client in frontend/src/pages/GamePage.tsx

---

## Phase 4: User Story 2 - Player Name Validation (Priority: P1)

**Goal**: Enforce trimming and non-empty display names on client and server; show inline validation message when rejected.

**Independent Test**: Attempt to join with names: "Alice", " ", " Bob " — whitespace-only rejected, others trimmed and accepted.

- [ ] T011 [US2] Update `JoinRoomPage` and `CreateRoomPage` to trim input and show validation message in frontend/src/pages/JoinRoomPage.tsx and frontend/src/pages/CreateRoomPage.tsx
- [ ] T012 [US2] Add frontend unit tests for trimmed acceptance and whitespace rejection in frontend/src/pages/LobbyPage.test.tsx or a new test file frontend/src/pages/validation.test.tsx

---

## Phase 5: User Story 3 - Deterministic Secret Word Selection (Priority: P2)

**Goal**: Provide deterministic secret-word selection using room `seed` and round index.

**Independent Test**: For a given seed and round index, selection returns expected word.

- [ ] T013 [US3] Add unit test asserting deterministic selection for a known seed/round in backend/src/services/wordSelector.test.ts

---

## Phase N: Polish & Cross-Cutting Concerns

- [ ] T014 [P] Surface server-side error to frontend when starter word list is empty; show user-friendly message in frontend/src/pages/LobbyPage.tsx
- [ ] T015 [P] Update documentation: add quickstart and testing notes in specs/003-drawer-selection/quickstart.md and update README.md if needed
- [ ] T016 [P] Code cleanup and add comments where algorithms (deterministic selection) are non-obvious in backend/src/services/wordSelector.ts

---

## Dependencies & Execution Order

- Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3+ (User Stories) → Polish
- Tests: add unit tests (wordSelector, schemas) before implementation where feasible

## Parallel Opportunities

- `T002`, `T003`, `T005`, and `T014` marked `[P]` can be worked on in parallel safely
- After Foundational phase completes, US1/US2/US3 tasks can be worked on in parallel

## Implementation Strategy

- MVP: Complete Phase 1 + Phase 2 + Phase 3 (User Story 1) to have a runnable first-round experience

---

## Checklist Notes

- All tasks follow the required checklist format `- [ ] T### [P?] [US?] Description` and include file paths.
