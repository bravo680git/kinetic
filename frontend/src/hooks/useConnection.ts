import { useConnectionStore, SavedConnection } from "@/stores/connection";
import { useCallback } from "react";

export const useConnection = () => {
  const connections = useConnectionStore((state) => state.connections);
  const selectedConnection = useConnectionStore(
    (state) => state.selectedConnection,
  );
  const refreshKey = useConnectionStore((state) => state.refreshKey);
  const setConnections = useConnectionStore((state) => state.setConnections);
  const setSelectedConnection = useConnectionStore(
    (state) => state.setSelectedConnection,
  );
  const setRefreshKey = useConnectionStore((state) => state.setRefreshKey);

  const saveConnection = useCallback(
    (name: string, connectionString: string): SavedConnection => {
      const newConnection: SavedConnection = {
        id: Date.now().toString(),
        name:
          name ||
          connectionString.split("//")[1]?.split("@")[0] ||
          "Connection",
        connectionString,
        createdAt: Date.now(),
      };
      setConnections([...connections, newConnection]);
      return newConnection;
    },
    [connections, setConnections],
  );

  const deleteConnection = useCallback(
    (id: string) => {
      setConnections(connections.filter((conn) => conn.id !== id));
    },
    [connections, setConnections],
  );

  const selectConnection = useCallback(
    (selectedConnection: SavedConnection | null) => {
      setSelectedConnection(selectedConnection);
    },
    [setSelectedConnection],
  );

  const triggerRefresh = useCallback(() => {
    setRefreshKey(refreshKey + 1);
  }, [refreshKey, setRefreshKey]);

  return {
    connections,
    selectedConnection,
    refreshKey,
    saveConnection,
    deleteConnection,
    selectConnection,
    triggerRefresh,
  };
};
