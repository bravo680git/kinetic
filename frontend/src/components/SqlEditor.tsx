import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useEffect, useRef, useState } from "react";
import { SchemaResponse } from "../../../shared/types";
import { createSqlCompletionProvider } from "../lib/monacoProvider";

interface SqlEditorProps {
  onRun: (query: string) => void;
  schema: SchemaResponse | null;
}

export function SqlEditor({ onRun, schema }: SqlEditorProps) {
  const [value, setValue] = useState("");
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const schemaRef = useRef<SchemaResponse | null>(schema);
  const onRunRef = useRef(onRun);

  useEffect(() => {
    onRunRef.current = onRun;
  }, [onRun]);

  useEffect(() => {
    schemaRef.current = schema;
  }, [schema]);

  const handleMount = (
    editor: monaco.editor.IStandaloneCodeEditor,
    monacoEditor: typeof import("monaco-editor"),
  ) => {
    editorRef.current = editor;

    monacoEditor.languages.register({ id: "sql" });

    // Register SQL language configuration
    monacoEditor.languages.setMonarchTokensProvider("sql", {
      tokenizer: {
        root: [
          [
            /\b(?:SELECT|FROM|WHERE|AND|OR|NOT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP|ORDER|BY|HAVING|LIMIT|OFFSET|AS|DISTINCT|IN|EXISTS|BETWEEN|LIKE|CASE|WHEN|THEN|ELSE|END|WITH|UNION|ALL|INTERSECT|EXCEPT|PRIMARY|KEY|FOREIGN|CONSTRAINT|CHECK|DEFAULT|NULL|TRUE|FALSE|SUM|COUNT|AVG|MIN|MAX)\b/i,
            "keyword",
          ],
          [/"[^"]*"/, "string"],
          [/'[^']*'/, "string"],
          [/\d+/, "number"],
          [/-{2,}.*$/, "comment"],
          [/\/\*/, "comment", "@comment"],
        ],
        comment: [
          [/[^*/]+/, "comment"],
          [/\*\//, "comment", "@pop"],
          [/./, "comment"],
        ],
      },
    });

    // Register completion provider
    const completionProvider = createSqlCompletionProvider(
      () => schemaRef.current,
    );
    monacoEditor.languages.registerCompletionItemProvider(
      "sql",
      completionProvider,
    );

    // Register keyboard shortcut for running query (Cmd+Enter or Ctrl+Enter)
    editor.addCommand(
      monacoEditor.KeyMod.CtrlCmd | monacoEditor.KeyCode.Enter,
      () => {
        const selection = editor.getSelection();
        let query = "";

        if (selection && !selection.isEmpty()) {
          // If text is selected, run the selection
          query = editor.getModel()?.getValueInRange(selection) || "";
        } else {
          // If no selection, run the current line
          const lineNumber = editor.getPosition()?.lineNumber || 1;
          const lineContent =
            editor.getModel()?.getLineContent(lineNumber) || "";
          query = lineContent.trim();
        }

        if (query) {
          onRunRef.current(query);
        }
      },
    );
  };

  return (
    <div className="flex flex-col bg-bg-base overflow-hidden h-full">
      <Editor
        height="100%"
        language="sql"
        theme="vs-dark"
        value={value}
        onChange={(val) => setValue(val || "")}
        onMount={handleMount}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: "var(--font-mono)",
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: "on",
          lineNumbers: "on",
          glyphMargin: false,
          folding: true,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 3,
          // Enable suggestions and autocomplete
          suggest: {
            showKeywords: true,
            showSnippets: true,
            showClasses: true,
            showFields: true,
            showFunctions: true,
          },
          quickSuggestions: {
            other: true,
            comments: false,
            strings: false,
          },
          quickSuggestionsDelay: 50,
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnCommitCharacter: true,
          acceptSuggestionOnEnter: "smart",
          snippetSuggestions: "inline",
          parameterHints: { enabled: true },
        }}
      />
    </div>
  );
}
