import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SavedConnection {
  id: string;
  name: string;
  connectionString: string;
  createdAt: number;
}

type ConnectionState = {
  connections: SavedConnection[];
  selectedConnection: SavedConnection | null;
  refreshKey: number;
  setConnections: (connections: SavedConnection[]) => void;
  setSelectedConnection: (selectedConnection: SavedConnection | null) => void;
  setRefreshKey: (refreshKey: number) => void;
};

export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set) => ({
      connections: [],
      selectedConnection: null,
      refreshKey: 0,

      setConnections: (connections) => set({ connections }),
      setSelectedConnection: (selectedConnection) =>
        set({ selectedConnection }),
      setRefreshKey: (refreshKey) => set({ refreshKey }),
    }),
    {
      name: "kinetic_connections",
      partialize: (state) => ({
        connections: state.connections,
        selectedConnection: state.selectedConnection,
      }),
    },
  ),
);
