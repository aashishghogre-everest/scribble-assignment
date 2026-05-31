import { randomUUID, createHash } from "node:crypto";
import type { Participant, Room, RoomSnapshot } from "../models/game.js";
import { STARTER_ROLES, STARTER_WORDS } from "../seed/starterData.js";

const rooms = new Map<string, Room>();

function now() {
  return new Date().toISOString();
}

const ROOM_TTL_MS = Number(process.env.ROOM_TTL_MS ?? "300000");

export function getRoomTtlMs() {
  return Number.isNaN(ROOM_TTL_MS) ? 300000 : ROOM_TTL_MS;
}

function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let index = 0; index < 4; index += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}

function generateUniqueCode() {
  let code = generateCode();

  while (rooms.has(code)) {
    code = generateCode();
  }

  return code;
}

function displayName(name?: string) {
  if (name === undefined) return "Player";
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : "Player";
}

function createParticipant(name?: string, role?: string): Participant {
  return {
    id: randomUUID(),
    name: displayName(name),
    joinedAt: now(),
    role: role as any
  };
}

function cloneRoom(room: Room) {
  return structuredClone(room);
}

export function listWords() {
  return [...STARTER_WORDS];
}

export function createRoom(playerName?: string) {
  const participant = createParticipant(playerName, "host");
  const room: Room = {
    code: generateUniqueCode(),
    status: "lobby",
    participants: [participant],
    hostId: participant.id,
    seed: randomUUID(),
    createdAt: now(),
    updatedAt: now()
  };

  rooms.set(room.code, room);

  console.info(
    `[roomStore] createRoom code=${room.code} hostId=${participant.id} name=${participant.name}`
  );

  return {
    room: cloneRoom(room),
    participantId: participant.id
  };
}

export function joinRoom(code: string, playerName?: string) {
  const room = rooms.get(code);

  if (!room) {
    return null;
  }

  if (room.status !== "lobby") {
    return { reason: "not-lobby" } as const;
  }

  const participant = createParticipant(playerName, "player");
  room.participants.push(participant);
  room.updatedAt = now();
  rooms.set(room.code, room);

  console.info(
    `[roomStore] joinRoom code=${room.code} participantId=${participant.id} name=${participant.name}`
  );

  return {
    room: cloneRoom(room),
    participantId: participant.id
  } as const;
}

export function getRoom(code: string) {
  const room = rooms.get(code);
  return room ? cloneRoom(room) : null;
}

export function saveRoom(room: Room) {
  room.updatedAt = now();
  rooms.set(room.code, cloneRoom(room));
  console.debug(`[roomStore] saveRoom code=${room.code}`);
  return getRoom(room.code);
}

export function toRoomSnapshot(
  room: Room,
  viewerParticipantId?: string
): RoomSnapshot {
  const snapshot: RoomSnapshot = {
    code: room.code,
    status: room.status,
    hostId: room.hostId,
    participants: room.participants.map((participant) => ({ ...participant })),
    availableWords: listWords(),
    roles: [...STARTER_ROLES]
  };

  // Only include the secret word when the viewer is the drawer
  if (
    viewerParticipantId &&
    room.drawerId &&
    viewerParticipantId === room.drawerId
  ) {
    snapshot.secretWord = room.secretWord;
  }

  return snapshot;
}

function selectWord(seed: string | undefined, roundIndex: number) {
  const words = STARTER_WORDS;
  if (!seed) return words[0];
  const hash = createHash("sha256").update(`${seed}:${roundIndex}`).digest();
  const idx = hash.readUInt32BE(0) % words.length;
  return words[idx];
}

export function startGame(code: string, participantId: string) {
  const room = rooms.get(code);

  if (!room) {
    return { reason: "not-found" } as const;
  }

  if (room.hostId !== participantId) {
    return { reason: "not-host" } as const;
  }

  if (room.participants.length < 2) {
    return { reason: "not-enough" } as const;
  }

  if (room.status === "in-game") {
    return { reason: "already-in-game" } as const;
  }

  // initialize the first round
  room.status = "in-game";
  room.roundIndex = 1;

  // choose drawer: prefer host if present, otherwise first participant by join order
  let drawerId = room.hostId;
  if (!drawerId || !room.participants.some((p) => p.id === drawerId)) {
    drawerId = room.participants[0]?.id;
  }

  room.drawerId = drawerId;
  room.secretWord = selectWord(room.seed, room.roundIndex);
  room.updatedAt = now();
  rooms.set(room.code, room);

  console.info(
    `[roomStore] startGame code=${room.code} startedBy=${participantId}`
  );

  return { room: cloneRoom(room) } as const;
}

export function cleanupInactiveRooms() {
  const ttl = getRoomTtlMs();
  const nowTs = Date.now();
  const removed: string[] = [];

  for (const [code, room] of rooms.entries()) {
    const updated = new Date(room.updatedAt).getTime();
    if (Number.isNaN(updated)) continue;
    if (nowTs - updated > ttl) {
      rooms.delete(code);
      removed.push(code);
      console.info(`[roomStore] cleanupInactiveRooms removed=${code}`);
    }
  }

  return removed;
}
