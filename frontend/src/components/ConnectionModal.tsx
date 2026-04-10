import { AlertCircle, CheckCircle, XIcon, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import Modal from "react-modal";
import { testConnection as testConnectionApi } from "../lib/api";
import {
  deleteConnection,
  saveConnection,
  type SavedConnection,
} from "../lib/connections";

interface ConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect?: (connStr: string) => void;
  mode?: "add" | "edit";
  connection?: SavedConnection | null;
  onSave?: () => void;
}

export function ConnectionModal({
  isOpen,
  onClose,
  onConnect,
  mode = "add",
  connection,
  onSave,
}: ConnectionModalProps) {
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

  const handleConnect = async () => {
    if (!connStr) {
      return;
    }
    if (mode === "edit" && connection) {
      deleteConnection(connection.id);
    }
    saveConnection(displayName, connStr);
    if (mode === "add" && onConnect) {
      onConnect(connStr);
    } else if (mode === "edit" && onSave) {
      onSave();
    }
    setDisplayName("");
    setConnStr("");
    setTestResult(null);
    onClose();
  };

  if (!isOpen) return null;

  const isEditMode = mode === "edit";
  const title = isEditMode ? "Edit Connection" : "Add New Connection";
  const buttonText = isEditMode ? "Save Changes" : "Connect";
  const isValid =
    displayName.trim() && connStr.trim() && (isEditMode || testResult?.ok);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={title}
      style={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          zIndex: 50,
        },
        content: {
          width: "600px",
          margin: "auto",
          padding: "1.5rem",
          borderRadius: "0.5rem",
          border: "1px solid var(--color-border)",
          backgroundColor: "var(--color-bg-elevated)",
          color: "var(--color-text-primary)",
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          transform: "translate(-50%, -50%)",
        },
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
        <button
          onClick={onClose}
          className="size-9 flex items-center justify-center shrink-0 hover:bg-bg-base rounded transition-colors"
        >
          <XIcon size={16} />
        </button>
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
                ? "bg-status-success/10 border border-status-success/20"
                : "bg-status-error/10 border border-status-error/20"
            }`}
          >
            {testResult.ok ? (
              <>
                <CheckCircle
                  size={18}
                  className="text-status-success flex-shrink-0 mt-0.5"
                />
                <div className="text-sm text-status-success">Connected</div>
              </>
            ) : (
              <>
                <AlertCircle
                  size={18}
                  className="text-status-error flex-shrink-0 mt-0.5"
                />
                <div className="text-sm text-status-error">
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
          onClick={onClose}
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
    </Modal>
  );
}
