import { useSchema } from "@/hooks/useSchema";
import { useQueryTabs } from "@/hooks/useQueryTabs";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import type { ColumnMeta, SchemaResponse } from "../../../shared/types";
import { extractTableNameFromQuery } from "../lib/query";
import { useUIStore } from "../stores/ui";
import { ResultGrid } from "./ResultGrid";

function getColumnsMeta(
  schema: SchemaResponse | null | undefined,
  tableName: string | undefined,
): Record<string, ColumnMeta> | null {
  if (!schema || !schema.schemas || !tableName) return null;
  for (const schemaMeta of schema.schemas) {
    for (const table of schemaMeta.tables) {
      if (table.name === tableName) {
        return table.columns.reduce(
          (acc, col) => {
            acc[col.name] = col;
            return acc;
          },
          {} as Record<string, ColumnMeta>,
        );
      }
    }
  }
  return null;
}

export function QueryResultTabs() {
  const {
    tabs,
    activeTabId,
    setActive,
    closeTab,
    closeAllTabs,
    rerunActiveTab,
  } = useQueryTabs();
  const { schema } = useSchema();
  const activeTab = tabs.find((t) => t.id === activeTabId) || null;

  const { isResultsPanelCollapsed, setResultsPanelCollapsed } = useUIStore();

  const handleResultPanelCollapse = (collapsed: boolean) => {
    setResultsPanelCollapsed(collapsed);
  };

  if (tabs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-bg-base">
        <span className="text-text-secondary text-sm">
          Run a query to see results
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-0 overflow-hidden bg-bg-base h-full">
      {isResultsPanelCollapsed && (
        <button
          className="p-1 hover:bg-bg-base rounded transition-colors fixed bottom-1 z-20"
          onClick={() => handleResultPanelCollapse(false)}
          title="Expand results"
        >
          <ChevronUp size={20} className="text-text-secondary" />
        </button>
      )}
      <div className="flex items-center bg-bg-secondary border-b border-border px-2 py-0 h-10 shrink-0 gap-2">
        {!isResultsPanelCollapsed && (
          <button
            className="p-1 hover:bg-bg-surface rounded transition-colors"
            onClick={() => handleResultPanelCollapse(true)}
            title="Collapse results"
          >
            <ChevronDown size={16} className="text-text-secondary" />
          </button>
        )}

        <div className="flex items-center gap-2 overflow-x-auto flex-1 min-w-0">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-t-md cursor-pointer whitespace-nowrap transition-colors ${
                activeTab?.id === tab.id
                  ? "bg-bg-base border-b-2 border-accent text-text-primary"
                  : "bg-bg-tertiary text-text-secondary hover:bg-bg-base"
              }`}
              onClick={() => setActive(tab.id)}
            >
              <span className="text-xs font-mono truncate max-w-xs">
                {tab.title}
              </span>
              {tab.loading && (
                <div className="w-3 h-3 rounded-full border-2 border-accent border-t-transparent animate-spin shrink-0" />
              )}
              <button
                className="p-1 hover:bg-bg-secondary rounded transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {tabs.length > 0 && (
          <button
            className="px-2 py-1 text-xs text-text-secondary hover:text-text-primary rounded transition-colors hover:bg-bg-base shrink-0"
            onClick={closeAllTabs}
          >
            Close All
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0">
        {activeTab ? (
          <ResultGrid
            queryResult={activeTab.result}
            loading={activeTab.loading}
            error={activeTab.error}
            tableName={extractTableNameFromQuery(activeTab.query)}
            columnsMeta={getColumnsMeta(
              schema,
              extractTableNameFromQuery(activeTab.query),
            )}
            onSaveSuccess={rerunActiveTab}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-bg-base">
            <span className="text-text-secondary text-sm">No active tab</span>
          </div>
        )}
      </div>
    </div>
  );
}
