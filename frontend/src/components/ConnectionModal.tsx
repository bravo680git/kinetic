import * as Dialog from "@radix-ui/react-dialog";
import { AlertCircle, CheckCircle, XIcon, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { testConnection as testConnectionApi } from "../lib/api";
import {
  deleteConnection,
  saveConnection,
  type SavedConnection,
} from "../lib/connections";
import { useUIStore } from "../stores/ui";
import { useConnectionStore } from "@/stores/connection";
import { useSchemaStore } from "@/stores/schema";

export function ConnectionModal() {
  const { connectionModal, closeConnectionModal } = useUIStore();
  const { triggerRefresh, setConnStr: storeSetConnStr } = useConnectionStore();
  const isOpen = connectionModal !== null;
  const mode = connectionModal?.mode || "add";
  const connection = connectionModal?.connection || null;
  const [displayName, setDisplayName] = useState("");
  const [connStr, setConnStr] = useState("");
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    error?: string;
  } | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (isOpen && mode === "edit" && connection) {
      setDisplayName(connection.name);
      setConnStr(connection.connectionString);
      setTestResult(null);
    } else if (isOpen && mode === "add") {
      setDisplayName("");
      setConnStr("");
      setTestResult(null);
    }
  }, [isOpen, mode, connection]);

  const handleTestConnection = async () => {
    if (!connStr) {
      setTestResult({ ok: false, error: "Connection string is required" });
      return;
    }
    setTesting(true);
    try {
      const result = await testConnectionApi({ connection_string: connStr });
      setTestResult(result);
    } catch (err) {
      setTestResult({
        ok: false,
        error: err instanceof Error ? err.message : "Test failed",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {};

  const handleConnect = async () => {
    if (!connStr) {
      return;
    }
    if (mode === "edit" && connection) {
      deleteConnection(connection.id);
    }
    saveConnection(displayName, connStr);
    if (mode === "add") {
      const { connect } = useSchemaStore.getState();
      try {
        await connect(connStr);
        storeSetConnStr(connStr);
        triggerRefresh();
        toast.success(`Connected to ${displayName || "database"}`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to connect");
        return;
      }
    } else if (mode === "edit") {
      triggerRefresh();
    }
    setDisplayName("");
    setConnStr("");
    setTestResult(null);
    closeConnectionModal();
  };

  if (!isOpen) return null;

  const isEditMode = mode === "edit";
  const title = isEditMode ? "Edit Connection" : "Add New Connection";
  const buttonText = isEditMode ? "Save Changes" : "Connect";
  const isValid =
    displayName.trim() && connStr.trim() && (isEditMode || testResult?.ok);

  return (
    <Dialog.Root open={isOpen} onOpenChange={closeConnectionModal}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-150 -translate-x-1/2 -translate-y-1/2 border border-border rounded-lg bg-bg-elevated p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-lg font-semibold text-text-primary">
              {title}
            </Dialog.Title>
            <Dialog.Close className="size-9 flex items-center justify-center shrink-0 hover:bg-bg-base rounded transition-colors">
              <XIcon size={16} />
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Display Name {!isEditMode && "(optional)"}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g., Production DB"
                className="w-full px-3 py-2 bg-bg-input border border-border text-text-primary rounded-md focus:border-border-focus focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Connection String
              </label>
              <input
                type="text"
                value={connStr}
                onChange={(e) => setConnStr(e.target.value)}
                placeholder="postgresql://user:password@host:5432/dbname"
                className="w-full px-3 py-2 bg-bg-input border border-border text-text-primary rounded-md focus:border-border-focus focus:outline-none transition-colors"
              />
            </div>

            {testResult && (
              <div
                className={`flex items-start gap-2 p-3 rounded-md ${
                  testResult.ok
                    ? "bg-success/10 border border-success/20"
                    : "bg-error/10 border border-error/20"
                }`}
              >
                {testResult.ok ? (
                  <>
                    <CheckCircle
                      size={18}
                      className="text-success shrink-0 mt-0.5"
                    />
                    <div className="text-sm text-success">Connected</div>
                  </>
                ) : (
                  <>
                    <AlertCircle
                      size={18}
                      className="text-error shrink-0 mt-0.5"
                    />
                    <div className="text-sm text-error">
                      {testResult.error || "Connection failed"}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            {!isEditMode && (
              <button
                onClick={handleTestConnection}
                disabled={testing || !connStr}
                className="flex items-center gap-2 px-3 py-2 border border-border text-text-primary rounded-md hover:bg-bg-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap size={16} />
                {testing ? "Testing..." : "Test Connection"}
              </button>
            )}
            <button
              onClick={closeConnectionModal}
              className="flex-1 px-3 py-2 border border-border text-text-primary rounded-md hover:bg-bg-base transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConnect}
              disabled={!isValid}
              className="flex-1 px-3 py-2 bg-accent text-white rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {buttonText}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
