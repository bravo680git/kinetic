export interface SavedConnection {
  id: string;
  name: string;
  connectionString: string;
  createdAt: number;
}

const STORAGE_KEY = "kinetic_connections";

export function getSavedConnections(): SavedConnection[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveConnection(
  name: string,
  connectionString: string,
): SavedConnection {
  const connections = getSavedConnections();
  const newConnection: SavedConnection = {
    id: Date.now().toString(),
    name:
      name || connectionString.split("//")[1]?.split("@")[0] || "Connection",
    connectionString,
    createdAt: Date.now(),
  };
  connections.push(newConnection);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
  return newConnection;
}

export function deleteConnection(id: string): void {
  const connections = getSavedConnections();
  const filtered = connections.filter((conn) => conn.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getLastConnection(): SavedConnection | null {
  const connections = getSavedConnections();
  return connections.length > 0 ? connections[connections.length - 1] : null;
}
