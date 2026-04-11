import { create } from "zustand";
import { SavedConnection } from "../lib/connections";

type ConnectionModalState = {
  mode: "add" | "edit";
  connection: SavedConnection | null;
};

type UIState = {
  isSidebarCollapsed: boolean;
  // Connection Modal
  connectionModal: ConnectionModalState | null;
  // Modals
  settingsModalOpen: boolean;
  snippetsModalOpen: boolean;
  // Panels
  isResultsPanelCollapsed: boolean;
  // Actions
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  openConnectionModal: (
    mode: "add" | "edit",
    connection?: SavedConnection | null,
  ) => void;
  closeConnectionModal: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  openSnippetsModal: () => void;
  closeSnippetsModal: () => void;
  setResultsPanelCollapsed: (collapsed: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  isSidebarCollapsed: false,
  connectionModal: null,
  settingsModalOpen: false,
  snippetsModalOpen: false,
  isResultsPanelCollapsed: false,

  setIsSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

  openConnectionModal: (mode, connection = null) =>
    set({
      connectionModal: {
        mode,
        connection: connection || null,
      },
    }),
  closeConnectionModal: () =>
    set({
      connectionModal: null,
    }),
  openSettingsModal: () => set({ settingsModalOpen: true }),
  closeSettingsModal: () => set({ settingsModalOpen: false }),
  openSnippetsModal: () => set({ snippetsModalOpen: true }),
  closeSnippetsModal: () => set({ snippetsModalOpen: false }),
  setResultsPanelCollapsed: (collapsed) =>
    set({ isResultsPanelCollapsed: collapsed }),
}));
