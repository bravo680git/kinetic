import React from "react";

export type SettingsTab = "query" | "general";

export interface TabConfig {
  id: SettingsTab;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}
