import { useQueryTabsStore, QueryTab } from "@/stores/queryTabs";
import { useConnectionStore } from "@/stores/connection";
import { useSchemaStore } from "@/stores/schema";
import { useCallback } from "react";
import { executeQuery } from "../lib/api";

export const useQueryTabs = () => {
  const tabs = useQueryTabsStore((state) => state.tabs);
  const activeTabId = useQueryTabsStore((state) => state.activeTabId);
  const setTabs = useQueryTabsStore((state) => state.setTabs);
  const setActiveTabId = useQueryTabsStore((state) => state.setActiveTabId);
  const updateTab = useQueryTabsStore((state) => state.updateTab);

  const { selectedConnection } = useConnectionStore.getState();
  const { schema } = useSchemaStore.getState();

  const runQueryInTab = useCallback(
    async (query: string) => {
      const { selectedConnection } = useConnectionStore.getState();
      const { schema } = useSchemaStore.getState();
      if (!schema || !selectedConnection || !query.trim()) return;
      const connectionString = selectedConnection.connectionString;

      const id = Date.now().toString();
      const title = query.substring(0, 50).split("\n")[0] || "Query";
      const newTab: QueryTab = {
        id,
        title,
        query,
        result: null,
        loading: true,
        error: null,
        createdAt: new Date(),
      };
      setTabs([...tabs, newTab]);
      setActiveTabId(id);

      try {
        const response = await executeQuery({
          connection_string: connectionString,
          sql: query,
        });
        updateTab(id, {
          result: response,
          error: null,
          loading: false,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        updateTab(id, {
          error: errorMsg,
          result: null,
          loading: false,
        });
      }
    },
    [tabs, setTabs, setActiveTabId, updateTab],
  );

  const rerunActiveTab = useCallback(async () => {
    const { selectedConnection } = useConnectionStore.getState();
    if (!activeTabId || !selectedConnection) return;
    const connectionString = selectedConnection.connectionString;

    const tab = tabs.find((t) => t.id === activeTabId);
    if (!tab) return;

    updateTab(activeTabId, { loading: true });

    try {
      const response = await executeQuery({
        connection_string: connectionString,
        sql: tab.query,
      });
      updateTab(activeTabId, {
        result: response,
        error: null,
        loading: false,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      updateTab(activeTabId, {
        error: errorMsg,
        result: null,
        loading: false,
      });
    }
  }, [activeTabId, tabs, updateTab]);

  const closeTab = useCallback(
    (tabId: string) => {
      const filtered = tabs.filter((t) => t.id !== tabId);
      const newActiveId =
        activeTabId === tabId
          ? filtered.length > 0
            ? filtered[filtered.length - 1].id
            : null
          : activeTabId;
      setTabs(filtered);
      setActiveTabId(newActiveId);
    },
    [tabs, activeTabId, setTabs, setActiveTabId],
  );

  const closeAllTabs = useCallback(() => {
    setTabs([]);
    setActiveTabId(null);
  }, [setTabs, setActiveTabId]);

  const setActive = useCallback(
    (tabId: string) => {
      setActiveTabId(tabId);
    },
    [setActiveTabId],
  );

  return {
    tabs,
    activeTabId,
    runQueryInTab,
    rerunActiveTab,
    closeTab,
    closeAllTabs,
    setActive,
  };
};
