import { create } from "zustand";
import { SavedConnection } from "./connection";

type ConnectionModalState = {
  mode: "add" | "edit";
  connection: SavedConnection | null;
};

type JsonViewerModalState = {
  value: unknown;
  onSave?: (newValue: string) => void;
};

type UIState = {
  isSidebarCollapsed: boolean;
  // Connection Modal
  connectionModal: ConnectionModalState | null;
  // Modals
  settingsModalOpen: boolean;
  snippetsModalOpen: boolean;
  jsonViewerModal: JsonViewerModalState | null;
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
  openJsonViewerModal: (
    value: unknown,
    onSave?: (newValue: string) => void,
  ) => void;
  closeJsonViewerModal: () => void;
  setResultsPanelCollapsed: (collapsed: boolean) => void;
};

export const useUIStore = create<UIState>((set) => ({
  isSidebarCollapsed: false,
  connectionModal: null,
  settingsModalOpen: false,
  snippetsModalOpen: false,
  jsonViewerModal: null,
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
  openJsonViewerModal: (value, onSave) =>
    set({ jsonViewerModal: { value, onSave } }),
  closeJsonViewerModal: () => set({ jsonViewerModal: null }),
  setResultsPanelCollapsed: (collapsed) =>
    set({ isResultsPanelCollapsed: collapsed }),
}));
