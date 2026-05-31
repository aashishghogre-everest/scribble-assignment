import {
  createElement,
  createContext,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
  type PropsWithChildren
} from "react";
import { createPoller } from "../services/polling";
import {
  api,
  type RoomSessionResponse,
  type RoomSnapshot
} from "../services/api";

export interface RoomState {
  room: RoomSnapshot | null;
  participantId: string | null;
  error: string | null;
  isLoading: boolean;
  guesses: unknown[];
}

type Listener = () => void;

export class RoomStore {
  private state: RoomState = {
    room: null,
    participantId: null,
    error: null,
    isLoading: false,
    guesses: []
  };

  private listeners = new Set<Listener>();

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => this.state;

  private setState(nextState: Partial<RoomState>) {
    this.state = {
      ...this.state,
      ...nextState
    };
    this.listeners.forEach((listener) => listener());
  }

  private async withLoading<T>(operation: () => Promise<T>) {
    this.setState({
      isLoading: true,
      error: null
    });

    try {
      return await operation();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected request failure";
      this.setState({ error: message });
      throw error;
    } finally {
      this.setState({ isLoading: false });
    }
  }

  setRoomSession(response: RoomSessionResponse) {
    this.setState({
      participantId: response.participantId,
      room: response.room,
      error: null
    });
  }

  setRoomSnapshot(room: RoomSnapshot) {
    this.setState({
      room,
      error: null
    });
  }

  async createRoom(playerName: string) {
    const response = await this.withLoading(() => api.createRoom(playerName));
    this.setRoomSession(response);
    return response;
  }

  async joinRoom(code: string, playerName: string) {
    const response = await this.withLoading(() =>
      api.joinRoom(code, playerName)
    );
    this.setRoomSession(response);
    return response;
  }

  async fetchRoom() {
    if (!this.state.room) {
      return null;
    }

    const response = await api.fetchRoom(
      this.state.room.code,
      this.state.participantId ?? undefined
    );
    this.setRoomSnapshot(response.room);
    return response.room;
  }

  async fetchGuesses() {
    if (!this.state.room) return [];
    const { guesses } = await api.fetchGuesses(this.state.room.code);
    this.setState({ guesses: guesses ?? [] });
    return guesses ?? [];
  }

  startGuessPolling(intervalMs = 2000) {
    if (this._poller) return;
    this._poller = createPoller(() => this.fetchGuesses(), intervalMs, 400);
    this._poller.start();
  }

  stopGuessPolling() {
    if (this._poller) {
      this._poller.stop();
      this._poller = undefined;
    }
  }

  private _poller: ReturnType<typeof createPoller> | undefined;

  private _snapshotPoller: ReturnType<typeof createPoller> | undefined;

  startSnapshotPolling(intervalMs = 2000) {
    if (this._snapshotPoller) return;
    this._snapshotPoller = createPoller(
      async () => {
        if (!this.state.room) return;
        try {
          await this.fetchRoom();
        } catch (e) {
          // swallow - poller is best-effort
        }
      },
      intervalMs,
      400
    );
    this._snapshotPoller.start();
  }

  stopSnapshotPolling() {
    if (this._snapshotPoller) {
      this._snapshotPoller.stop();
      this._snapshotPoller = undefined;
    }
  }

  async startRoom() {
    if (!this.state.room || !this.state.participantId) {
      throw new Error("Missing room or participantId");
    }

    const response = await this.withLoading(() =>
      api.startRoom(this.state.room!.code, this.state.participantId!)
    );
    this.setRoomSnapshot(response.room);
    return response.room;
  }
}

const RoomStoreContext = createContext<RoomStore | null>(null);

export function RoomStoreProvider({ children }: PropsWithChildren) {
  const storeRef = useRef<RoomStore | null>(null);

  if (!storeRef.current) {
    storeRef.current = new RoomStore();
  }

  useEffect(() => undefined, []);

  return createElement(
    RoomStoreContext.Provider,
    { value: storeRef.current },
    children
  );
}

export function useRoomStore() {
  const store = useContext(RoomStoreContext);

  if (!store) {
    throw new Error("RoomStoreProvider is missing");
  }

  return store;
}

export function useRoomState() {
  const store = useRoomStore();
  return useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  );
}
