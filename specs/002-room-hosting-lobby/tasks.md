# Tasks: Room Hosting & Lobby

**Input**: Design documents from `/specs/002-room-hosting-lobby/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic feature-level configuration

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend changes that MUST be complete before user stories

- add host assignment on createRoom
- persist participant `role` and `hostId`
- reject joins when room `status !== 'lobby'`
- add `startGame(code: string, participantId: string)` that enforces host-only + min players
- read `ROOM_TTL_MS` and expose a `cleanupInactiveRooms()` function
- backend/src/services/roomStore.test.ts (extend with host, startGame, cleanup tests)

# Tasks: Room Hosting & Lobby

**Input**: Design documents from `/specs/002-room-hosting-lobby/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic feature-level configuration

- [ ] T001 [P] Implement `ROOM_TTL_MS` environment var handling in `backend/src/services/roomStore.ts` (read env and default to 300000)
- [ ] T002 [P] Validate `ROOM_TTL_MS` documentation in `specs/002-room-hosting-lobby/quickstart.md` and `README.md` (ensure docs reflect default and usage)
- [ ] T003 [P] Validate test runner setup (`vitest`) in `backend` and `frontend` (run `npm test` in each and document commands in quickstart)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend changes that MUST be complete before user stories

- [ ] T004 Update `backend/src/models/game.ts` to include `hostId` on `Room` and add optional `role` (`host`|`player`) to `Participant` (implementation)
- [ ] T005 [P] Harden `backend/src/services/roomStore.ts` (implementation):
  - add host assignment on `createRoom`
  - persist participant `role` and `hostId`
  - reject joins when room `status !== 'lobby'`
  - add `startGame(code: string, participantId: string)` that enforces host-only + min players
  - read `ROOM_TTL_MS` and expose a `cleanupInactiveRooms()` function
- [ ] T006 [P] Add a small cleanup runner in `backend/src/services/roomCleanup.ts` and wire it into `backend/src/server.ts` to call `cleanupInactiveRooms()` periodically (implementation)
- [ ] T007 Add Zod schema and route validation for `POST /api/rooms/:code/start` in `backend/src/api/schemas.ts` and implement the route in `backend/src/api/rooms.ts` (implementation)
- [ ] T008 [P] Update `backend/src/api/rooms.ts` to return `409 Conflict` when joining an in-game room and `403 Forbidden` for unauthorized start requests (implementation/validation)
- [ ] T009 [P] Add or update unit tests for foundational behavior:
  - `backend/src/services/roomStore.test.ts` (extend with host, startGame, cleanup tests)
  - `backend/src/api/schemas.test.ts` (request validation)

**Checkpoint**: Backend supports create/join/get/start, enforces host/start rules, and performs TTL cleanup

---

## Phase 3: User Story 1 - Create Room (Priority: P1) 🎯 MVP

**Goal**: Player can create a room and be assigned host role; receives room code and participantId

**Independent Test**: Call `POST /api/rooms` with `playerName` → receives `{ participantId, room }` with `room.code` and `room.hostId === participantId`

- [ ] T010 [P] [US1] Add/verify contract test for `POST /api/rooms` in backend tests (`backend/src/api/rooms.test.ts`) — validate returned `participantId` and `room` shape
- [ ] T011 [US1] [P] Validate frontend `createRoom` integration (`frontend/src/state/roomStore.ts` and `frontend/src/pages/CreateRoomPage.tsx`): ensure it stores `participantId` and room snapshot and navigates to `/lobby`
- [ ] T012 [US1] [P] Validate frontend lobby loading from `roomStore` after create (`frontend/src/pages/CreateRoomPage.tsx`, `frontend/src/state/roomStore.ts`)

**Checkpoint**: Create Room flow works end-to-end locally

---

## Phase 4: User Story 2 - Join Room with Code (Priority: P1)

**Goal**: Player can join a room by code; invalid/empty codes rejected with clear error

**Independent Test**: `POST /api/rooms/:code/join` with valid code adds participant; invalid code returns 404 and UI shows friendly error

- [ ] T013 [P] [US2] Add contract tests for `POST /api/rooms/:code/join` including invalid-code case (`backend/src/api/rooms.test.ts`) — validation
- [ ] T014 [US2] [P] Validate frontend join flow (`frontend/src/pages/JoinRoomPage.tsx`, `frontend/src/state/roomStore.ts`) surfaces friendly errors for 400/404 responses
- [ ] T015 [US2] [P] (Optional) Add client-side validation for code format before network call (`frontend/src/pages/JoinRoomPage.tsx`) — implementation if desired

**Checkpoint**: Join Room flow works and shows useful errors for bad codes

---

## Phase 5: User Story 3 - Lobby Polling & Isolation (Priority: P1)

**Goal**: Lobby view refreshes via polling (~2s + jitter) and room state changes are isolated

**Independent Test**: Two browsers showing same room see a new participant within ~2.5s after join

- [ ] T016 [US3] Implement polling helper `frontend/src/services/polling.ts` that calls `api.fetchRoom(code, participantId)` every 2000ms ± jitter (implementation)
- [ ] T017 [US3] [P] Integrate polling into `frontend/src/pages/LobbyPage.tsx` (start/stop on mount/unmount) and use `roomStore.fetchRoom()` to update UI (implementation)
- [ ] T018 [US3] [P] Add contract test for `GET /api/rooms/:code` showing snapshot and verifying isolation (`backend/src/api/rooms.test.ts`) — validation

**Checkpoint**: Lobby UI updates automatically and only for the given room code

---

## Phase 6: User Story 4 - Host Controls Start Game (Priority: P1)

**Goal**: Only host can start; start disabled when <2 players

**Independent Test**: Host can start when >=2 players; non-host start attempts rejected with 403; start transitions `room.status` to `in-game` and prevents further joins

- [ ] T019 [US4] Add backend test for `startGame` permission and min-player checks (`backend/src/services/roomStore.test.ts`) — validation/test
- [ ] T020 [US4] Implement `POST /api/rooms/:code/start` route in `backend/src/api/rooms.ts` and corresponding service method (depends on T005, T007) (implementation)
- [ ] T021 [US4] Implement Start button enablement logic in `frontend/src/pages/LobbyPage.tsx` (only enabled if `room.participants.length >= 2` AND `room.hostId === participantId`) and wire the click to call API and navigate to `/game` (implementation)
- [ ] T022 [US4] [P] Add frontend test or integration check for Start button behavior (`frontend/src/pages/LobbyPage.test.tsx`) — validation

**Checkpoint**: Start flow enforces host-only semantics and minimal players

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T023 [P] Update docs: `specs/002-room-hosting-lobby/quickstart.md` and `README.md` with polling interval and `ROOM_TTL_MS`
- [ ] T024 [P] Add logging around room lifecycle events in `backend/src/services/roomStore.ts`
- [ ] T025 [P] Add graceful shutdown hook in `backend/src/server.ts` to stop cleanup interval
- [ ] T026 [P] Run full test suite and fix any regressions (backend and frontend)
- [ ] T027 [P] Code cleanup and TypeScript strictness checks (fix any `any` types introduced)

---

## Dependencies & Execution Order

- **Phase 1 (Setup)**: T001-T003 - can run immediately (parallel)
- **Phase 2 (Foundational)**: T004-T009 - BLOCKS all user stories; do not start Phase 3+ until foundational tasks are complete
- **User Stories (Phase 3+)**: Each story's tasks depend on Foundational completion; stories themselves are independent and can proceed in parallel
- **Polish**: T023-T027 — final pass after core features are complete

## Parallel Opportunities

- Any task marked `[P]` can be worked on in parallel by different developers
- Tests (backend and frontend) can be written in parallel with implementation tasks flagged `[P]`

## Independent Test Criteria (per story)

- US1: `POST /api/rooms` returns `participantId` and `room` with `hostId === participantId`; frontend Create flow stores participantId and navigates to lobby
- US2: `POST /api/rooms/:code/join` with invalid code returns 404; valid join returns `participantId` and updated `room` snapshot
- US3: `GET /api/rooms/:code` snapshot reflects participants; clients polling at 2s see joins within 2.5s
- US4: `POST /api/rooms/:code/start` returns 200 only when invoked by host and `room.participants.length >= 2`; otherwise returns 403 or 409 as appropriate

## Suggested MVP Scope

- Focus on US1 (Create Room), US2 (Join Room), and US3 (Lobby polling) as the minimum shippable subset. US4 (Start controls) is critical but can be implemented immediately after foundational tasks.

---

## Task Counts

- Total tasks: 27
- Tasks per story: US1=3, US2=3, US3=3, US4=4
