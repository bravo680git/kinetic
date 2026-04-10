import clsx from "clsx";
import { PanelLeft, PanelRight, Settings } from "lucide-react";

interface TopBarProps {
  connectionStatus: "connected" | "disconnected" | "error";
  onSettingsClick?: () => void;
  isSidebarCollapsed?: boolean;
  setIsSidebarCollapsed?: (collapsed: boolean) => void;
}

export function TopBar({
  connectionStatus,
  onSettingsClick,
  isSidebarCollapsed,
  setIsSidebarCollapsed,
}: TopBarProps) {
  const statusColors = {
    connected: "bg-success",
    disconnected: "bg-gray-500",
    error: "bg-error",
  };

  return (
    <div className="flex items-center justify-between pl-2 pr-4 py-3 bg-bg-surface border-b border-border">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsSidebarCollapsed?.(!isSidebarCollapsed)}
          className={clsx(
            "p-1 hover:bg-bg-elevated rounded-md transition-colors text-text-secondary z-10",
          )}
          title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isSidebarCollapsed ? (
            <PanelRight size={16} />
          ) : (
            <PanelLeft size={16} />
          )}
        </button>
        <span className="text-lg font-mono font-semibold text-text-primary">
          KINETIC
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${statusColors[connectionStatus]}`}
          />
          <span className="text-sm text-text-secondary capitalize">
            {connectionStatus}
          </span>
        </div>

        <button
          onClick={onSettingsClick}
          className="p-2 hover:bg-bg-elevated rounded-md transition-colors"
        >
          <Settings size={18} className="text-text-secondary" />
        </button>
      </div>
    </div>
  );
}
