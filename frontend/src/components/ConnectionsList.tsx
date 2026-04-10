import clsx from "clsx";
import { ChevronRight, Plug, PlugIcon, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useConfirmModal } from "../hooks/useConfirmModal";
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
  refreshKey?: number;
}

export function ConnectionsList({
  selectedConnId,
  onSelectConnection,
  onConnect,
  onNewConnection,
  onEditConnection,
  refreshKey,
}: ConnectionsListProps) {
  const [expanded, setExpanded] = useState(true);
  const [connections, setConnections] = useState(getSavedConnections());
  const { modal: deleteModal, contextHolder } = useConfirmModal();

  useEffect(() => {
    setConnections(getSavedConnections());
  }, [refreshKey]);

  const handleDeleteConnection = (id: string) => {
    deleteModal.confirm({
      title: "Delete Connection?",
      description: "This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "error",
      onConfirm: () => {
        deleteConnection(id);
        setConnections(getSavedConnections());
      },
    });
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

          <div className="flex gap-2 items-center">
            <PlugIcon size={16} className="text-accent" />
            <span className="text-sm font-semibold text-text-primary">
              Connections
            </span>
          </div>
          <button
            onClick={onNewConnection}
            className="ml-auto p-1.5 hover:bg-bg-elevated rounded transition-colors"
          >
            <Plus
              onClick={onNewConnection}
              size={16}
              className="text-accent shrink-0"
            />
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
                  className="flex items-center gap-2 py-2 rounded text-sm transition-colors group min-w-0"
                >
                  <div
                    className={clsx(
                      "flex-1 px-2 py-1 w-full flex items-center gap-2 relative text-left rounded transition-colors min-w-0",
                      {
                        "bg-accent/15": selectedConnId === conn.id,
                      },
                    )}
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
                    <ConnectionMenu
                      connection={conn}
                      onConnect={() => handleConnect(conn)}
                      onEdit={() => onEditConnection(conn)}
                      onDelete={() => handleDeleteConnection(conn.id)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {contextHolder}
    </>
  );
}
