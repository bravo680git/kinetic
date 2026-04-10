import { AlertCircle, Check, ChevronRight, Plug, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  deleteConnection,
  getSavedConnections,
  type SavedConnection,
} from "../lib/connections";
import { ConnectionMenu } from "./ConnectionMenu";

interface ConnectionsListProps {
  selectedConnId: string | null;
  onSelectConnection: (conn: SavedConnection) => void;
  onConnect: (connStr: string) => void;
  onNewConnection: () => void;
  onEditConnection: (conn: SavedConnection) => void;
  isConnected: boolean;
  connectedConnStr: string;
  refreshKey?: number;
}

export function ConnectionsList({
  selectedConnId,
  onSelectConnection,
  onConnect,
  onNewConnection,
  onEditConnection,
  isConnected,
  connectedConnStr,
  refreshKey,
}: ConnectionsListProps) {
  const [expanded, setExpanded] = useState(true);
  const [connections, setConnections] = useState(getSavedConnections());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setConnections(getSavedConnections());
  }, [refreshKey]);

  const handleDelete = (id: string) => {
    deleteConnection(id);
    setDeleteConfirm(null);
    setConnections(getSavedConnections());
  };

  const handleConnect = (conn: SavedConnection) => {
    onSelectConnection(conn);
    onConnect(conn.connectionString);
  };

  return (
    <>
      <div className="border-b border-border bg-bg-surface">
        <div className="w-full flex items-center gap-3 px-4 py-3">
          <ChevronRight
            size={20}
            className={`transition shrink-0 hover:bg-bg-elevated p-1 rounded ${
              expanded ? "rotate-90" : ""
            }`}
            onClick={() => setExpanded(!expanded)}
          />

          <button className="flex gap-2 items-center hover:bg-bg-elevated py-1 px-3 rounded">
            <span className="text-sm font-semibold text-text-primary">
              Connections
            </span>
            <Plus size={16} className="text-accent shrink-0" />
          </button>
        </div>

        {expanded && (
          <div className="px-2 py-2 space-y-1 bg-bg-base max-h-64 overflow-y-auto">
            {connections.length === 0 ? (
              <div className="text-xs text-text-secondary text-center py-6 px-2">
                <Plug size={20} className="mx-auto mb-2 opacity-50" />
                <div>No saved connections</div>
                <div className="mt-1">Click + to add one</div>
              </div>
            ) : (
              connections.map((conn) => (
                <div
                  key={conn.id}
                  className="flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors group min-w-0"
                >
                  <button
                    className={`flex-1 flex items-center gap-2 text-left rounded transition-colors min-w-0 ${
                      selectedConnId === conn.id
                        ? "bg-accent/15 px-2 py-1 -mx-2"
                        : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-text-primary">
                        {conn.name}
                      </div>
                      <div className="text-xs text-text-secondary truncate">
                        {conn.connectionString.split("//")[1]?.split("@")[1] ||
                          "Connection"}
                      </div>
                    </div>
                  </button>
                  {isConnected &&
                    connectedConnStr === conn.connectionString && (
                      <Check size={14} className="text-accent flex-shrink-0" />
                    )}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <ConnectionMenu
                      connection={conn}
                      onConnect={() => handleConnect(conn)}
                      onEdit={() => onEditConnection(conn)}
                      onDelete={() => setDeleteConfirm(conn.id)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-bg-elevated rounded-lg shadow-lg w-full max-w-sm p-6 border border-border">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle
                size={24}
                className="text-status-error flex-shrink-0 mt-0.5"
              />
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  Delete Connection?
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-3 py-2 border border-border text-text-primary rounded-md hover:bg-bg-base transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-3 py-2 bg-status-error text-white rounded-md hover:bg-status-error/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
