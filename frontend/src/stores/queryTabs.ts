import { create } from "zustand";
import { executeQuery } from "../lib/api";
import { useConnectionStore } from "./connection";
import { useSchemaStore } from "./schema";
import { QueryResponse } from "../../../shared/types";

export type QueryTab = {
  id: string;
  title: string;
  query: string;
  result: QueryResponse | null;
  loading: boolean;
  error: string | null;
  createdAt: Date;
  tableName?: string;
};

type QueryTabsState = {
  tabs: QueryTab[];
  activeTabId: string | null;
  runQueryInTab: (query: string) => Promise<void>;
  rerunActiveTab: () => Promise<void>;
  closeTab: (tabId: string) => void;
  closeAllTabs: () => void;
  setActive: (tabId: string) => void;
};

export const useQueryTabsStore = create<QueryTabsState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  runQueryInTab: async (query: string) => {
    const { connStr } = useConnectionStore.getState();
    const { schema } = useSchemaStore.getState();
    if (!schema || !connStr || !query.trim()) return;

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
    set((state) => ({ tabs: [...state.tabs, newTab], activeTabId: id }));

    try {
      const response = await executeQuery({
        connection_string: connStr,
        sql: query,
      });
      set((state) => ({
        tabs: state.tabs.map((tab) =>
          tab.id === id
            ? { ...tab, result: response, error: null, loading: false }
            : tab,
        ),
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      set((state) => ({
        tabs: state.tabs.map((tab) =>
          tab.id === id
            ? { ...tab, error: errorMsg, result: null, loading: false }
            : tab,
        ),
      }));
    }
  },

  rerunActiveTab: async () => {
    const { activeTabId, tabs } = get();
    const { connStr } = useConnectionStore.getState();
    if (!activeTabId || !connStr) return;

    const tab = tabs.find((t) => t.id === activeTabId);
    if (!tab) return;

    set((state) => ({
      tabs: state.tabs.map((t) =>
        t.id === activeTabId ? { ...t, loading: true } : t,
      ),
    }));

    try {
      const response = await executeQuery({
        connection_string: connStr,
        sql: tab.query,
      });
      set((state) => ({
        tabs: state.tabs.map((t) =>
          t.id === activeTabId
            ? { ...t, result: response, error: null, loading: false }
            : t,
        ),
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      set((state) => ({
        tabs: state.tabs.map((t) =>
          t.id === activeTabId
            ? { ...t, error: errorMsg, result: null, loading: false }
            : t,
        ),
      }));
    }
  },

  closeTab: (tabId: string) => {
    set((state) => {
      const filtered = state.tabs.filter((t) => t.id !== tabId);
      const newActiveId =
        state.activeTabId === tabId
          ? filtered.length > 0
            ? filtered[filtered.length - 1].id
            : null
          : state.activeTabId;
      return { tabs: filtered, activeTabId: newActiveId };
    });
  },

  closeAllTabs: () => set({ tabs: [], activeTabId: null }),

  setActive: (tabId: string) => set({ activeTabId: tabId }),
}));
