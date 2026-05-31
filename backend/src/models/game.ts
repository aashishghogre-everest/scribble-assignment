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
}

export interface RoomSessionResponse {
  participantId: string;
  room: RoomSnapshot;
}
