import { EntityContextType, PostgreSQL } from "dt-sql-parser";
import * as monaco from "monaco-editor";
import { SchemaResponse } from "../../../shared/types";

export function createSqlCompletionProvider(
  getSchema: () => SchemaResponse | null,
): monaco.languages.CompletionItemProvider {
  const parser = new PostgreSQL();

  return {
    triggerCharacters: [".", " ", "(", ","],
    provideCompletionItems(
      model: monaco.editor.ITextModel,
      position: monaco.Position,
    ): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
      const schema = getSchema();
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
          return { suggestions, incomplete: false };
        }

        const result = parser.getSuggestionAtCaretPosition(sql, {
          lineNumber: position.lineNumber,
          column: position.column,
        });

        if (!result) {
          return { suggestions: [], incomplete: false };
        }

        // Extract context from syntax suggestions
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
