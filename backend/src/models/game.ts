export type ParticipantRole = "drawer" | "guesser";
export type RoomStatus = "lobby" | "in-game";

// Participant meta-role (host vs regular player)
export type ParticipantMetaRole = "host" | "player";

export interface Participant {
  id: string;
  name: string;
  joinedAt: string;
  role?: ParticipantMetaRole;
}

export interface Room {
  code: string;
  status: RoomStatus;
  participants: Participant[];
  hostId?: string;
  // deterministic seed used for word selection
  seed?: string;
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
