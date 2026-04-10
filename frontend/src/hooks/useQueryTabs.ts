import { useState, useCallback } from "react";
import { QueryResponse } from "../../../shared/types";
import { executeQuery } from "../lib/api";
import type { QueryTab } from "../types/tabs";

export function useQueryTabs() {
  const [tabs, setTabs] = useState<QueryTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const createTab = useCallback((query: string): string => {
    const id = Date.now().toString();
    const title = query.substring(0, 50).split("\n")[0] || "Query";
    const newTab: QueryTab = {
      id,
      title,
      query,
      result: null,
      loading: false,
      error: null,
      createdAt: new Date(),
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(id);
    return id;
  }, []);

  const updateTabLoading = useCallback((tabId: string, loading: boolean) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === tabId ? { ...tab, loading } : tab)),
    );
  }, []);

  const updateTabResult = useCallback(
    (tabId: string, result: QueryResponse, error: string | null) => {
      setTabs((prev) =>
        prev.map((tab) =>
          tab.id === tabId ? { ...tab, result, error, loading: false } : tab,
        ),
      );
    },
    [],
  );

  const updateTabError = useCallback((tabId: string, error: string) => {
    setTabs((prev) =>
      prev.map((tab) =>
        tab.id === tabId
          ? { ...tab, error, result: null, loading: false }
          : tab,
      ),
    );
  }, []);

  const runQueryInTab = useCallback(
    async (connectionString: string, query: string) => {
      if (!connectionString || !query.trim()) {
        return;
      }

      const tabId = createTab(query);
      updateTabLoading(tabId, true);

      try {
        const response = await executeQuery({
          connection_string: connectionString,
          sql: query,
        });
        updateTabResult(tabId, response, null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        updateTabError(tabId, errorMsg);
      }
    },
    [createTab, updateTabLoading, updateTabResult, updateTabError],
  );

  const rerunActiveTab = useCallback(
    async (connectionString: string) => {
      if (!activeTabId) {
        return;
      }

      const tab = tabs.find((t) => t.id === activeTabId);
      if (!tab) {
        return;
      }

      updateTabLoading(activeTabId, true);

      try {
        const response = await executeQuery({
          connection_string: connectionString,
          sql: tab.query,
        });
        updateTabResult(activeTabId, response, null);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        updateTabError(activeTabId, errorMsg);
      }
    },
    [activeTabId, tabs, updateTabLoading, updateTabResult, updateTabError],
  );

  const closeTab = useCallback(
    (tabId: string) => {
      setTabs((prev) => {
        const filtered = prev.filter((tab) => tab.id !== tabId);
        if (activeTabId === tabId) {
          setActiveTabId(
            filtered.length > 0 ? filtered[filtered.length - 1].id : null,
          );
        }
        return filtered;
      });
    },
    [activeTabId],
  );

  const closeAllTabs = useCallback(() => {
    setTabs([]);
    setActiveTabId(null);
  }, []);

  const setActive = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const activeTab = tabs.find((tab) => tab.id === activeTabId) || null;

  return {
    tabs,
    activeTab,
    activeTabId,
    createTab,
    closeTab,
    closeAllTabs,
    setActive,
    runQueryInTab,
    rerunActiveTab,
  };
}
