import { create } from "zustand";
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
  setTabs: (tabs: QueryTab[]) => void;
  setActiveTabId: (tabId: string | null) => void;
  updateTab: (tabId: string, updates: Partial<QueryTab>) => void;
};

export const useQueryTabsStore = create<QueryTabsState>((set) => ({
  tabs: [],
  activeTabId: null,

  setTabs: (tabs) => set({ tabs }),
  setActiveTabId: (activeTabId) => set({ activeTabId }),
  updateTab: (tabId, updates) =>
    set((state) => ({
      tabs: state.tabs.map((tab) =>
        tab.id === tabId ? { ...tab, ...updates } : tab,
      ),
    })),
}));
