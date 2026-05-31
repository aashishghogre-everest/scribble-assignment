# Quickstart: Test Drawer Selection Locally

1. Start backend:

```bash
cd backend
npm run dev
```

2. Start frontend:

```bash
cd frontend
npm run dev
```

3. Manual test flow:

- Open the frontend, create a room as `Alice` (host).
- Join the room with another tab as `Bob`.
- From the host client, click start round and confirm the host sees the secret word while Bob does not.

4. Automated tests:

- Add vitest integration tests that create an in-memory room using `seed/starterData.ts`, start a round, and assert that only the drawer client can fetch `/api/rooms/:id/rounds/:index/secret`.
