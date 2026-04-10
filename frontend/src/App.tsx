import { useSettings } from "@/hooks/useSettings";
import * as Tooltip from "@radix-ui/react-tooltip";
import debounce from "lodash.debounce";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Group,
  Panel,
  PanelImperativeHandle,
  Separator,
} from "react-resizable-panels";
import { ToastContainer, toast } from "react-toastify";
import { ConnectionModal } from "./components/ConnectionModal";
import { ConnectionsList } from "./components/ConnectionsList";
import { QueryResultTabs } from "./components/QueryResultTabs";
import { SchemaTree } from "./components/SchemaTree";
import { SettingsModal } from "./components/SettingsModal";
import { SqlEditor } from "./components/SqlEditor";
import { TopBar } from "./components/TopBar";
import { useQueryTabs } from "./hooks/useQueryTabs";
import { useSchema } from "./hooks/useSchema";
import { getLastConnection, type SavedConnection } from "./lib/connections";

function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingConn, setEditingConn] = useState<SavedConnection | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [connStr, setConnStr] = useState("");
  const [selectedConn, setSelectedConn] = useState<SavedConnection | null>(
    null,
  );
  const [refreshConnections, setRefreshConnections] = useState(0);
  const { config, updateConfig, loadConfig, loading } = useSettings();
  const [isResultsPanelCollapsed, setIsResultsPanelCollapsed] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    config.general?.sidebar_collapsed,
  );
  const resultsPanelRef = useRef<PanelImperativeHandle>(null);
  const { schema, connect } = useSchema();
  const {
    tabs,
    activeTab,
    runQueryInTab,
    closeTab,
    closeAllTabs,
    setActive,
    rerunActiveTab,
  } = useQueryTabs();
  const resultPanelSize = config.general?.result_panel_percentage || 50;

  const connectionStatus = schema ? "connected" : "disconnected";

  const handleNewConnection = () => {
    setModalMode("add");
    setEditingConn(null);
    setModalOpen(true);
  };

  const handleEditConnection = (conn: SavedConnection) => {
    setModalMode("edit");
    setEditingConn(conn);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingConn(null);
  };

  const handleConnectionSave = () => {
    setRefreshConnections((prev) => prev + 1);
    handleModalClose();
  };

  const handleConnect = async (connectionString: string) => {
    setConnStr(connectionString);

    try {
      // Find the connection
      const conn = getLastConnection();
      // Don't select until connect succeeds

      await connect(connectionString);

      // Only set selected connection if connect was successful
      if (conn && conn.connectionString === connectionString) {
        setSelectedConn(conn);
      }
      toast.success(`Connected to ${conn?.name || "database"}`);
      setRefreshConnections((prev) => prev + 1);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to connect");
    }
  };

  const handleRunQuery = async (query: string) => {
    if (!schema || !connStr || !query.trim()) {
      return;
    }
    await runQueryInTab(connStr, query);
  };

  const handleResultPanelCollapse = (collapsed: boolean) => {
    setIsResultsPanelCollapsed(collapsed);
    if (collapsed) {
      resultsPanelRef.current?.collapse();
    } else {
      resultsPanelRef.current?.expand();
    }
  };

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    updateConfig({
      general: { sidebar_collapsed: collapsed },
    });
  };

  const updatePanelSize = useCallback(
    debounce((layout: any) => {
      const percentage = (Object.values(layout)?.[1] as number) ?? 0;

      if (percentage <= 0) return;
      updateConfig({
        general: { result_panel_percentage: Math.round(percentage) },
      });
    }, 300),
    [updateConfig],
  );

  useEffect(() => {
    const lastConn = getLastConnection();
    if (lastConn && !schema) {
      setSelectedConn(lastConn);
      setConnStr(lastConn.connectionString);
      connect(lastConn.connectionString);
    }
  }, []);

  useEffect(() => {
    loadConfig((config) => {
      const { sidebar_collapsed } = config.general ?? {};
      setIsSidebarCollapsed(sidebar_collapsed);
    });
  }, [loadConfig]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-bg-base text-text-primary">
        <Loader2 size={48} className="animate-spin" />
      </div>
    );
  }

  return (
    <Tooltip.Provider>
      <div className="w-screen h-screen flex flex-col bg-bg-base text-text-primary">
        <TopBar
          connectionStatus={connectionStatus}
          onSettingsClick={() => setSettingsModalOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={handleSidebarCollapse}
        />

        <div className="flex flex-1 min-h-0">
          <div
            className={`${
              isSidebarCollapsed ? "w-0" : "w-60"
            } shrink-0 border-r border-border overflow-hidden flex flex-col transition-all duration-300 ease-in-out`}
          >
            <ConnectionsList
              selectedConnId={selectedConn?.id || null}
              onSelectConnection={setSelectedConn}
              onConnect={handleConnect}
              onNewConnection={handleNewConnection}
              onEditConnection={handleEditConnection}
              refreshKey={refreshConnections}
            />
            <div className="flex-1 overflow-hidden">
              {schema && <SchemaTree schema={schema} />}
            </div>
          </div>

          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <Group orientation="vertical" onLayoutChanged={updatePanelSize}>
              <Panel
                minSize={20}
                defaultSize={100 - resultPanelSize}
                className="flex flex-col min-h-0 overflow-hidden"
              >
                {schema && <SqlEditor onRun={handleRunQuery} schema={schema} />}
              </Panel>
              <Separator className="h-1 bg-border hover:bg-accent transition-colors" />
              <Panel
                panelRef={resultsPanelRef}
                defaultSize={resultPanelSize}
                minSize={10}
                collapsible
                className="flex flex-col min-h-0 overflow-hidden"
              >
                <QueryResultTabs
                  tabs={tabs}
                  activeTab={activeTab}
                  onSelectTab={setActive}
                  onCloseTab={closeTab}
                  onCloseAll={closeAllTabs}
                  isCollapsed={isResultsPanelCollapsed}
                  setIsCollapsed={handleResultPanelCollapse}
                  connectionString={connStr}
                  schema={schema}
                  onRefreshQuery={() => rerunActiveTab(connStr)}
                />
              </Panel>
            </Group>
          </div>
        </div>

        <ConnectionModal
          isOpen={modalOpen}
          onClose={handleModalClose}
          onConnect={handleConnect}
          onSave={handleConnectionSave}
          mode={modalMode}
          connection={editingConn}
        />

        <SettingsModal
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
        />

        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </Tooltip.Provider>
  );
}

export default App;
