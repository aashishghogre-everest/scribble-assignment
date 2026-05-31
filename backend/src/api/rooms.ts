import { Router } from "express";
import {
  createRoomSchema,
  HttpError,
  joinRoomSchema,
  roomCodeParamsSchema,
  roomViewerQuerySchema,
  startRoomSchema
} from "./schemas.js";
import {
  createRoom,
  getRoom,
  joinRoom,
  toRoomSnapshot,
  startGame
} from "../services/roomStore.js";

export function createRoomsRouter() {
  const router = Router();

  router.post("/", (request, response, next) => {
    try {
      const { playerName } = createRoomSchema.parse(request.body);
      const result = createRoom(playerName);

      response.status(201).json({
        participantId: result.participantId,
        room: toRoomSnapshot(result.room, result.participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/join", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { playerName } = joinRoomSchema.parse(request.body);
      const result = joinRoom(
        code.toUpperCase(),
        playerName as string | undefined
      );

      if (!result) {
        throw new HttpError(404, "Unable to join room");
      }

      if ((result as any).reason === "not-lobby") {
        throw new HttpError(409, "Room is not accepting joins");
      }

      response.json({
        participantId: (result as any).participantId,
        room: toRoomSnapshot(
          (result as any).room,
          (result as any).participantId
        )
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/:code/start", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = startRoomSchema.parse(request.body);

      const result = startGame(code.toUpperCase(), participantId);

      if ((result as any).reason === "not-found") {
        throw new HttpError(404, "Unable to find room");
      }

      if ((result as any).reason === "not-host") {
        throw new HttpError(403, "Only the host can start the game");
      }

      if ((result as any).reason === "not-enough") {
        throw new HttpError(409, "Not enough players to start the game");
      }

      if ((result as any).reason === "already-in-game") {
        throw new HttpError(409, "Game already started");
      }

      response.json({
        room: toRoomSnapshot((result as any).room, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/:code", (request, response, next) => {
    try {
      const { code } = roomCodeParamsSchema.parse(request.params);
      const { participantId } = roomViewerQuerySchema.parse(request.query);
      const room = getRoom(code.toUpperCase());

      if (!room) {
        throw new HttpError(404, "Unable to load room");
      }

      response.json({
        room: toRoomSnapshot(room, participantId)
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
