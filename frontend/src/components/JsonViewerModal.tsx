import * as Dialog from "@radix-ui/react-dialog";
import { Copy, Edit2, Save, X, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useUIStore } from "../stores/ui";

function tryDecodeAndParse(value: string): {
  formatted?: string;
} {
  const result: {
    formatted?: string;
  } = {};

  try {
    // Try to parse as JSON directly
    const parsed = JSON.parse(value);
    result.formatted = JSON.stringify(parsed, null, 2);
    return result;
  } catch {
    // Not valid JSON, try to decode from base64
  }

  // Try to decode as base64
  if (value.length > 50) {
    try {
      const decoded = atob(value);

      // Try to parse the decoded value as JSON
      try {
        const parsed = JSON.parse(decoded);
        result.formatted = JSON.stringify(parsed, null, 2);
        return result;
      } catch {
        // Decoded but not JSON, just return the decoded string
        result.formatted = decoded;
        return result;
      }
    } catch (e) {
      // Failed to decode, try URL-safe base64
      try {
        const urlSafeDecoded = value.replace(/-/g, "+").replace(/_/g, "/");
        const decoded = atob(urlSafeDecoded);

        try {
          const parsed = JSON.parse(decoded);
          result.formatted = JSON.stringify(parsed, null, 2);
          return result;
        } catch {
          result.formatted = decoded;
          return result;
        }
      } catch {
        // Not valid base64 either
      }
    }
  }

  return result;
}

export function JsonViewerModal() {
  const { jsonViewerModal, closeJsonViewerModal } = useUIStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState("");

  if (!jsonViewerModal) return null;

  const { formatted } = tryDecodeAndParse(String(jsonViewerModal.value));

  const handleStartEdit = () => {
    setEditedValue(formatted || "");
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editedValue.trim()) {
      toast.error("JSON cannot be empty");
      return;
    }

    try {
      // Validate JSON
      JSON.parse(editedValue);

      // Call the onSave callback if provided
      if (jsonViewerModal.onSave) {
        jsonViewerModal.onSave(editedValue);
      }

      setIsEditing(false);
      closeJsonViewerModal();
      toast.success("JSON updated!");
    } catch (err) {
      toast.error(
        "Invalid JSON: " +
          (err instanceof Error ? err.message : "Unknown error"),
      );
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedValue("");
  };

  const handleCopy = () => {
    if (formatted) {
      navigator.clipboard.writeText(formatted);
      toast.success("Copied to clipboard!");
    }
  };

  return (
    <Dialog.Root open={!!jsonViewerModal} onOpenChange={closeJsonViewerModal}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-3xl w-full max-h-[80vh] overflow-hidden bg-bg-base border border-border rounded-lg shadow-lg z-50 flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <Dialog.Title className="text-lg font-semibold text-text-primary">
              JSON Viewer{" "}
              {isEditing && <span className="text-accent ml-2">(Editing)</span>}
            </Dialog.Title>
            <button
              onClick={closeJsonViewerModal}
              className="p-1 hover:bg-bg-secondary rounded transition-colors"
            >
              <XIcon size={20} className="text-text-secondary" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {isEditing ? (
              <textarea
                value={editedValue}
                onChange={(e) => setEditedValue(e.target.value)}
                className="w-full h-full font-mono text-sm text-text-primary bg-bg-elevated px-4 py-3 rounded outline-none focus:ring-2 focus:ring-accent"
                placeholder="Enter JSON here..."
              />
            ) : (
              <>
                {formatted ? (
                  <pre className="text-sm font-mono text-text-primary bg-bg-elevated px-4 py-3 rounded overflow-x-auto whitespace-pre-wrap wrap-break-words">
                    {formatted}
                  </pre>
                ) : (
                  <div className="text-text-secondary">No data to display</div>
                )}
              </>
            )}
          </div>

          <div className="px-6 py-3 border-t border-border bg-bg-secondary flex justify-between gap-3">
            <div className="flex gap-2">
              {!isEditing && formatted && (
                <>
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 rounded bg-accent/20 hover:bg-accent/30 text-accent font-medium transition-colors text-sm flex items-center gap-2"
                  >
                    <Copy size={16} />
                    Copy
                  </button>
                  {jsonViewerModal.onSave && (
                    <button
                      onClick={handleStartEdit}
                      className="px-4 py-2 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-medium transition-colors text-sm flex items-center gap-2"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                  )}
                </>
              )}
              {isEditing && (
                <>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 rounded bg-success/20 hover:bg-success/30 text-success font-medium transition-colors text-sm flex items-center gap-2"
                  >
                    <Save size={16} />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 rounded bg-error/20 hover:bg-error/30 text-error font-medium transition-colors text-sm flex items-center gap-2"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </>
              )}
            </div>
            <Dialog.Close asChild>
              <button className="px-4 py-2 rounded bg-bg-tertiary hover:bg-border text-text-primary font-medium transition-colors text-sm">
                Close
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
