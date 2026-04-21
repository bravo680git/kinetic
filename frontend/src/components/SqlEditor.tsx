import { useSchema } from "@/hooks/useSchema";
import { useQueryTabs } from "@/hooks/useQueryTabs";
import Editor from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { useEffect, useRef } from "react";
import { useSnippets } from "../hooks/useSnippets";
import { createSqlCompletionProvider } from "../lib/monacoProvider";

export function SqlEditor() {
  const { schema } = useSchema();
  const { runQueryInTab } = useQueryTabs();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const schemaRef = useRef(schema);
  const runQueryRef = useRef(runQueryInTab);
  const { snippets } = useSnippets();
  const snippetsRef = useRef(snippets);

  useEffect(() => {
    runQueryRef.current = runQueryInTab;
  }, [runQueryInTab]);

  useEffect(() => {
    schemaRef.current = schema;
  }, [schema]);

  useEffect(() => {
    snippetsRef.current = snippets;
  }, [snippets]);

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
      () => snippetsRef.current,
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
          runQueryRef.current(query);
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
