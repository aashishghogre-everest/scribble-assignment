export type ParticipantRole = "drawer" | "guesser";
export type RoomStatus = "lobby" | "in-game";

// Participant meta-role (host vs regular player)
export type ParticipantMetaRole = "host" | "player";

export interface Participant {
  id: string;
  // Display name provided by the player (trimmed). Kept alongside `name` for
  // backward-compatibility with existing code/tests.
  displayName: string;
  name: string;
  joinedAt: string;
  role?: ParticipantMetaRole;
  // Order in which the player joined the room (0-based)
  joinOrder?: number;
  // Whether this participant is the host
  isHost?: boolean;
}

export interface Room {
  code: string;
  status: RoomStatus;
  participants: Participant[];
  hostId?: string;
  // deterministic seed used for word selection
  seed?: string;
  // Starter word list used for deterministic selection (copied from seed data)
  starterWordList?: string[];
  // current round index (1-based)
  roundIndex?: number;
  // id of the drawer for the active round
  drawerId?: string;
  // secret word for the active round (server-only)
  secretWord?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomSnapshot {
  code: string;
  status: RoomStatus;
  hostId?: string;
  // id of the drawer for the active round (if any)
  drawerId?: string;
  participants: Participant[];
  availableWords: string[];
  roles: ParticipantRole[];
  // secret word is present only for the drawer viewing their own room snapshot
  secretWord?: string;
}

export interface RoomSessionResponse {
  participantId: string;
  room: RoomSnapshot;
}
