import { create } from "zustand";
import { SavedConnection } from "../lib/connections";

type ConnectionState = {
  connStr: string;
  selectedConn: SavedConnection | null;
  refreshKey: number;
  setConnStr: (connStr: string) => void;
  setSelectedConn: (conn: SavedConnection | null) => void;
  triggerRefresh: () => void;
};

export const useConnectionStore = create<ConnectionState>((set) => ({
  connStr: "",
  selectedConn: null,
  refreshKey: 0,
  setConnStr: (connStr) => set({ connStr }),
  setSelectedConn: (conn) => set({ selectedConn: conn }),
  triggerRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),
}));
