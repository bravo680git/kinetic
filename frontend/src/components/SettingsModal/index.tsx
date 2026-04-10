import { Check, Database, Settings as SettingsIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { GeneralTab } from "./GeneralTab";
import { QueryTab } from "./QueryTab";
import { SettingsModalProps, SettingsTab, TabConfig } from "./types";
import { useSettings } from "../../hooks/useSettings";

const TABS: TabConfig[] = [
  {
    id: "general",
    label: "General",
    icon: <SettingsIcon size={18} />,
    content: <GeneralTab />,
  },
  {
    id: "query",
    label: "Query",
    icon: <Database size={18} />,
    content: <QueryTab />,
  },
];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { loading, error, loadConfig, saveConfig, config } = useSettings();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [saving, setSaving] = useState(false);
  const activeContent = useMemo(() => {
    const tab = TABS.find((t) => t.id === activeTab);
    return tab?.content;
  }, [activeTab]);

  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen, loadConfig]);

  const handleSave = async () => {
    setSaving(true);
    const success = await saveConfig(config);
    setSaving(false);
    if (success) {
      toast.success("Settings saved successfully");
      onClose();
    } else {
      toast.error("Failed to save settings");
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Settings"
      style={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          zIndex: 50,
        },
        content: {
          width: "48rem",
          height: "32rem",
          margin: "auto",
          padding: "0",
          borderRadius: "0.5rem",
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-bg-elevated)",
          color: "var(--color-text-primary)",
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary">Settings</h2>
        <button
          onClick={onClose}
          className="size-9 flex items-center justify-center hover:bg-bg-base rounded transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar Tabs */}
        <div className="w-40 border-r border-border bg-bg-base overflow-y-auto">
          <nav className="space-y-1 p-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:bg-bg-elevated"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-status-error/10 border border-status-error rounded text-status-error text-sm">
                {error}
              </div>
            )}
            {activeContent}
          </div>

          {/* Footer */}
          <div className="shrink-0 border-t border-border px-6 py-4 flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-bg-elevated border border-border text-text-primary hover:bg-bg-base transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="px-4 py-2 rounded bg-bg-base text-white hover:bg-primary/90 active:bg-primary/80 transition-all disabled:opacity-50 font-medium flex items-center gap-2 shadow-lg"
            >
              {saving ? (
                <>
                  <span className="inline-block animate-spin">⏳</span>
                  Saving...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
