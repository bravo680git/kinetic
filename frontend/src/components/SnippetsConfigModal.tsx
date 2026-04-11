import { useSnippets } from "@/hooks/useSnippets";
import Editor from "@monaco-editor/react";
import * as Dialog from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import * as monaco from "monaco-editor";
import { useEffect, useRef, useState } from "react";
import { SnippetsConfig } from "../../../shared/types";
import { resetSnippets, updateSnippets } from "../lib/api";
import { useUIStore } from "../stores/ui";

export function SnippetsConfigModal() {
  const { snippetsModalOpen, closeSnippetsModal } = useUIStore();
  const { snippets, loadSnippets } = useSnippets();
  const [jsonValue, setJsonValue] = useState<string>("{}");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (snippetsModalOpen) {
      setJsonValue(JSON.stringify(snippets, null, 2));
    }
  }, [snippetsModalOpen, snippets]);

  const validateJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (typeof parsed !== "object" || parsed === null) {
        setNotification({ type: "error", message: "JSON must be an object" });
        return false;
      }
      // Check all values are strings
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof key !== "string" || typeof value !== "string") {
          setNotification({
            type: "error",
            message: "All keys and values must be strings",
          });
          return false;
        }
      }
      return true;
    } catch (err) {
      setNotification({
        type: "error",
        message: `Invalid JSON: ${err instanceof Error ? err.message : "Unknown error"}`,
      });
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateJSON(jsonValue)) {
      return;
    }

    try {
      setIsLoading(true);
      setNotification(null);
      const newSnippets = JSON.parse(jsonValue) as SnippetsConfig;
      await updateSnippets(newSnippets);
      loadSnippets();
      setNotification({
        type: "success",
        message: "Snippets saved successfully!",
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to save snippets",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset to default snippets?")) {
      return;
    }

    try {
      setIsLoading(true);
      setNotification(null);
      const defaultSnippets = await resetSnippets();
      loadSnippets();
      setJsonValue(JSON.stringify(defaultSnippets, null, 2));
      setNotification({
        type: "success",
        message: "Snippets reset to defaults!",
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      setNotification({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to reset snippets",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditorMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monacoEditor: typeof import("monaco-editor"),
  ) => {
    editorRef.current = editor;
    monacoEditor.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemaValidation: "warning",
      allowComments: false,
      trailingCommas: "error",
    });
  };

  return (
    <Dialog.Root open={snippetsModalOpen} onOpenChange={closeSnippetsModal}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-4xl max-h-[90vh] -translate-x-1/2 -translate-y-1/2 border border-border rounded-lg bg-bg-surface p-0 shadow-lg flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
            <Dialog.Title className="text-lg font-semibold text-text-primary">
              Configure SQL Snippets
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 hover:bg-bg-elevated rounded-md transition-colors">
                <XIcon size={20} className="text-text-secondary" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Editor
              height={600}
              defaultLanguage="json"
              value={jsonValue}
              onChange={(value) => {
                setJsonValue(value || "{}");
                setNotification(null);
              }}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                folding: true,
                lineNumbers: "on",
                wordWrap: "on",
              }}
            />
          </div>

          {/* Status Messages */}
          {notification && (
            <div
              className={`px-4 py-2 border-t text-sm shrink-0 ${
                notification.type === "error"
                  ? "bg-error/15 border-error/30 text-error"
                  : "bg-success/15 border-success/30 text-success"
              }`}
            >
              {notification.message}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-border shrink-0">
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="px-4 py-2 bg-bg-elevated hover:bg-bg-elevated/80 text-text-primary rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Set Default
            </button>
            <div className="flex gap-2">
              <Dialog.Close asChild>
                <button
                  disabled={isLoading}
                  className="px-4 py-2 bg-bg-elevated hover:bg-bg-elevated/80 text-text-primary rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
