import { EntityContextType, PostgreSQL } from "dt-sql-parser";
import * as monaco from "monaco-editor";
import { SchemaResponse, SnippetsConfig } from "../../../shared/types";

function getCategoryFromKey(key: string): string {
  if (key.startsWith("SELECT")) return "SELECT";
  if (key.startsWith("CREATE_TABLE")) return "CREATE TABLE";
  if (key.startsWith("CREATE_")) return "CREATE";
  if (key.startsWith("INSERT")) return "INSERT";
  if (key.startsWith("UPDATE")) return "UPDATE";
  if (key.startsWith("DELETE")) return "DELETE";
  if (key.startsWith("ALTER")) return "ALTER";
  if (key.startsWith("DROP")) return "DROP";
  if (key.startsWith("TRUNCATE")) return "TRUNCATE";
  if (key.startsWith("TRANSACTION")) return "TRANSACTION";
  if (key.startsWith("VIEW") || key.startsWith("CREATE_VIEW")) return "VIEW";
  if (key.startsWith("STORED_PROCEDURE") || key.startsWith("CREATE_STORED"))
    return "STORED PROCEDURE";
  if (key.startsWith("TRIGGER") || key.startsWith("CREATE_TRIGGER"))
    return "TRIGGER";
  if (key.startsWith("FUNCTION")) return "FUNCTION";
  if (key.startsWith("BACKUP") || key.startsWith("RESTORE"))
    return "BACKUP/RESTORE";
  return "OTHER";
}

function buildSnippetSuggestions(
  snippets: SnippetsConfig,
): Omit<monaco.languages.CompletionItem, "range">[] {
  return Object.entries(snippets).map(([key, value]) => {
    const category = getCategoryFromKey(key);
    return {
      label: key,
      kind: monaco.languages.CompletionItemKind.Snippet,
      detail: category,
      insertText: value,
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      documentation: {
        value: `**${category}**\n\n\`\`\`sql\n${value}\n\`\`\``,
      },
      sortText: `0_${key}`, // Show snippets first (0 prefix sorts before 1 and 2)
    };
  });
}

export function createSqlCompletionProvider(
  getSchema: () => SchemaResponse | null,
  getSnippets: () => SnippetsConfig,
): monaco.languages.CompletionItemProvider {
  const parser = new PostgreSQL();

  return {
    triggerCharacters: [".", " ", "(", ","],
    provideCompletionItems(
      model: monaco.editor.ITextModel,
      position: monaco.Position,
    ): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
      const schema = getSchema();
      const snippets = getSnippets();

      // Prepare snippets for autocomplete
      const snippetSuggestions = buildSnippetSuggestions(snippets);

      if (!schema) {
        return { suggestions: [], incomplete: false };
      }

      // Build schema lookup
      const tables = new Set<string>();
      const columns: Record<string, { name: string; type: string }[]> = {};

      if (schema.schemas) {
        for (const schemaMeta of schema.schemas) {
          for (const table of schemaMeta.tables) {
            tables.add(table.name);
            columns[table.name] = table.columns.map((c) => ({
              name: c.name,
              type: c.type,
            }));
          }
        }
      }

      // Get SQL content
      const sql = model.getValue();

      // Compute the word range to replace (handles partial words already typed)
      const wordInfo = model.getWordUntilPosition(position);
      const replaceRange = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: wordInfo.startColumn,
        endColumn: position.column,
      };

      // Detect dot-trigger: check if the character just before the cursor is '.'
      const lineBeforeCursor = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });
      const dotTriggered = lineBeforeCursor.endsWith(".");
      const dotQualifier = dotTriggered
        ? ((lineBeforeCursor.slice(0, -1).match(/(\w+)$/) ?? [])[1] ?? null)
        : null;

      // Get suggestions từ dt-sql-parser
      const suggestions: monaco.languages.CompletionItem[] = [];

      try {
        // Build alias map and mentioned tables from entity extraction
        // aliasMap: lowercase(alias or tableName) -> real tableName
        const aliasMap = new Map<string, string>();
        const mentionedTables = new Set<string>();
        try {
          const entities = parser.getAllEntities(sql, {
            lineNumber: position.lineNumber,
            column: position.column,
          });
          if (entities) {
            for (const entity of entities) {
              if (
                entity.entityContextType === EntityContextType.TABLE &&
                tables.has(entity.text)
              ) {
                mentionedTables.add(entity.text);
                aliasMap.set(entity.text.toLowerCase(), entity.text);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const aliasText: string | undefined = (entity as any)["_alias"]
                  ?.text;
                if (aliasText) {
                  aliasMap.set(aliasText.toLowerCase(), entity.text);
                }
              }
            }
          }
        } catch {
          // entity extraction failed — proceed with empty maps
        }

        // ============ Dot-trigger: table/alias.column ============
        if (dotTriggered && dotQualifier) {
          const resolvedTable = aliasMap.get(dotQualifier.toLowerCase());
          if (resolvedTable) {
            const tableColumns = columns[resolvedTable];
            if (tableColumns) {
              for (const col of tableColumns) {
                suggestions.push({
                  label: col.name,
                  kind: monaco.languages.CompletionItemKind.Field,
                  detail: `${col.type} (${resolvedTable})`,
                  insertText: col.name + " ",
                  range: replaceRange,
                  sortText: `1_${col.name}`,
                });
              }
            }
          }
          // Add snippets even when dot-triggered
          for (const snippet of snippetSuggestions) {
            suggestions.push({
              ...snippet,
              range: replaceRange,
            });
          }
          return { suggestions, incomplete: false };
        }

        const result = parser.getSuggestionAtCaretPosition(sql, {
          lineNumber: position.lineNumber,
          column: position.column,
        });

        if (!result) {
          return { suggestions: [], incomplete: false };
        }
        const contextTypes = new Set<string>();

        if (result.syntax) {
          for (const syntaxItem of result.syntax) {
            const contextType = (
              syntaxItem.syntaxContextType as string
            ).toLowerCase();
            contextTypes.add(contextType);
          }
        }

        // ============ WHERE/COLUMN context ============
        if (contextTypes.has("column")) {
          for (const tableName of mentionedTables) {
            const tableColumns = columns[tableName];
            if (tableColumns) {
              for (const col of tableColumns) {
                suggestions.push({
                  label: col.name,
                  kind: monaco.languages.CompletionItemKind.Field,
                  detail: `${col.type} (${tableName})`,
                  insertText: col.name + " ",
                  range: replaceRange,
                  sortText: `1_${col.name}`,
                });
              }
            }
          }
        }

        // ============ TABLE/FROM context ============
        if (contextTypes.has("table")) {
          for (const tableName of tables) {
            suggestions.push({
              label: tableName,
              kind: monaco.languages.CompletionItemKind.Class,
              detail: "table",
              insertText: tableName + " ",
              range: replaceRange,
              sortText: `1_${tableName}`,
            });
          }
        }

        // ============ Add keywords from parser ============
        if (result.keywords) {
          for (const keyword of result.keywords) {
            suggestions.push({
              label: keyword,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: keyword + " ",
              range: replaceRange,
              sortText: `2_${keyword}`,
            });
          }
        }

        // ============ Add SQL snippets ============
        // Always add snippets to suggestions
        for (const snippet of snippetSuggestions) {
          suggestions.push({
            ...snippet,
            range: replaceRange,
          });
        }

        return {
          suggestions,
          incomplete: false,
        };
      } catch (error) {
        // Parser error - return empty
        return { suggestions: [], incomplete: false };
      }
    },
  };
}
