# Implementation Plan: Drawer Selection & Word Visibility

**Branch**: `003-drawer-selection` | **Date**: 2026-05-31 | **Spec**: specs/003-drawer-selection/spec.md

**Input**: Feature specification from `/specs/003-drawer-selection/spec.md`

## Summary

Assign the drawer for the first round to the host (or the first joined player if the host is absent), enforce trimmed/non-empty `displayName` on client and server, and provide a deterministic secret-word selection algorithm based on the room `seed` and round index. Server-side access controls must ensure only the drawer receives the secret word.

## Technical Context

**Language/Version**: TypeScript (Node.js + frontend TypeScript/React), repo uses ES modules and tsconfig.json.

**Primary Dependencies**: Node.js, Express, Zod, React, Vite, vitest.

**Storage**: In-memory runtime state only (per constitution). No external DBs.

**Testing**: `vitest` for unit and integration tests; tests must be added before or alongside implementation (Test-First).

**Target Platform**: Local development / Node.js server + browser frontend.

**Project Type**: Web application with separate `backend/` and `frontend/` packages.

**Performance Goals**: Low-latency round-start operations; no specific RPS target required for this feature.

**Constraints**: Follow repository constitution: TypeScript-first, Zod for validation, HTTP polling only (no WebSockets), in-memory state only, tests required via `vitest`.

**Scale/Scope**: Small feature scoped to game room lifecycle and round start logic; affects backend room/round models and frontend `GamePage` display.

## Deterministic Word Selection (Algorithm)

To ensure reproducible secret-word selection for tests and debugging, implement a deterministic selector with the following specification:

- Input: `seed` (string), `roundIndex` (non-negative integer), `starterWordList` (array of strings)
- Algorithm: compute HMAC-SHA256 using `seed` as the key and the ASCII decimal representation of `roundIndex` as the message. Interpret the resulting 32-byte digest as a big-endian unsigned integer `N`. Select index `i = N mod starterWordList.length` and return `starterWordList[i]` as the `secretWord`.
- Implementation notes: use Node's built-in `crypto` module for server code:

```ts
import { createHmac } from "crypto";

function selectDeterministicWord(
  seed: string,
  roundIndex: number,
  list: string[]
) {
  const h = createHmac("sha256", seed).update(String(roundIndex)).digest();
  // Interpret as big-endian unsigned integer (use BigInt) and mod by list.length
  const N = BigInt("0x" + h.toString("hex"));
  const idx = Number(N % BigInt(list.length));
  return list[idx];
}
```

- Test vectors: include unit tests that assert known outputs for fixed `seed`, `roundIndex`, and `starterWordList` values. Example test case should include a short starter list (3–10 items) with a deterministic expected result to catch implementation regressions.

Rationale: HMAC-SHA256 with the room seed as key avoids endianness or platform-specific RNG differences and provides stable, auditable selection. Using `roundIndex` as the message ensures different rounds select different offsets for the same seed.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Gates determined by repository constitution (examples):

- TypeScript-first: code and tests MUST be TypeScript with strict typing
- Zod validation: backend request/response schemas MUST use Zod
- Test-First: vitest tests required for new features and fixes
- No WebSockets: realtime push protocols are prohibited
- In-Memory Only: no external databases or persistent stores
- CI gates: tests and lint must pass before merge

Assessment: PASS — Proposed changes adhere to the constitution. Implementation will:

- Keep all data in-memory (`backend/src/models/game.ts`, `backend/src/services/roomStore.ts`).
- Use Zod for server-side request/schema validation (`backend/src/api/schemas.ts`).
- Add `vitest` unit and integration tests alongside implementation (tests referenced in tasks).
- Use HTTP endpoints and polling; no WebSockets will be added.

If any future decision requires a constitution exception, document the reason in this plan and obtain approval.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
