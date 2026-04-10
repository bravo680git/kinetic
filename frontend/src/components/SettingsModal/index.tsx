import { Check, Database, Settings as SettingsIcon, XIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
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

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-3xl -translate-x-1/2 
          -translate-y-1/2 border border-border rounded-lg bg-bg-elevated shadow-lg flex flex-col h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <Dialog.Title className="text-lg font-semibold text-text-primary">
              Settings
            </Dialog.Title>
            <Dialog.Close className="size-9 flex items-center justify-center hover:bg-bg-base rounded transition-colors">
              <XIcon size={16} />
            </Dialog.Close>
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
                  <div className="mb-4 p-3 bg-error/10 border border-error rounded text-error text-sm">
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
