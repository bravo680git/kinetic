import {
  ChevronRight,
  Database,
  Table2,
  Columns,
  Key,
  Link2,
} from "lucide-react";
import { useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { SchemaResponse } from "../../../shared/types";

interface SchemaTreeProps {
  schema: SchemaResponse | null;
  onTableClick?: (tableName: string) => void;
}

interface Column {
  name: string;
  type: string;
  nullable?: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  foreignKeyInfo?: {
    referencedTable: string;
    referencedColumn: string;
  };
}

function ColumnItem({ col, tableName }: { col: Column; tableName: string }) {
  return (
    <Tooltip.Root delayDuration={200}>
      <Tooltip.Trigger asChild>
        <div className="flex items-center gap-2 px-2 py-1 text-xs text-text-secondary hover:bg-bg-elevated rounded transition-colors cursor-help">
          {col.isPrimaryKey ? (
            <Key size={12} className="text-accent" />
          ) : col.isForeignKey ? (
            <Link2 size={12} className="text-warning" />
          ) : (
            <Columns size={12} className="shrink-0" />
          )}
          <span>{col.name}</span>
        </div>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="z-50 bg-bg-elevated border border-border rounded-md p-3 shadow-lg text-xs text-text-primary whitespace-nowrap"
          sideOffset={5}
        >
          <div className="font-semibold mb-2">{col.name}</div>
          <div className="space-y-1">
            <div>
              <span className="text-text-secondary">Type: </span>
              <span className="text-accent">{col.type}</span>
            </div>
            <div>
              {col.nullable ? (
                <span>nullable</span>
              ) : (
                <span className="text-red-500">required</span>
              )}
            </div>
            {col.isPrimaryKey && (
              <div>
                <span className="text-accent">Primary Key</span>
              </div>
            )}
            {col.isForeignKey && col.foreignKeyInfo && (
              <div>
                <span className="text-warning">
                  FK: {col.foreignKeyInfo.referencedTable}.
                  {col.foreignKeyInfo.referencedColumn}
                </span>
              </div>
            )}
          </div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

interface TableItemProps {
  table: any;
  expandedTables: Set<string>;
  onToggleTable: (tableName: string) => void;
  onTableClick?: (tableName: string) => void;
}

function TableItem({
  table,
  expandedTables,
  onToggleTable,
  onTableClick,
}: TableItemProps) {
  return (
    <div key={table.name}>
      <button
        onClick={() => {
          onToggleTable(table.name);
          if (onTableClick) {
            onTableClick(table.name);
          }
        }}
        className="w-full flex items-center gap-1 px-2 py-1 hover:bg-bg-elevated rounded text-text-primary text-sm hover:text-text-primary transition-colors group"
      >
        <ChevronRight
          size={14}
          className={`transition-transform shrink-0 ${
            expandedTables.has(table.name) ? "rotate-90" : ""
          }`}
        />
        <Table2 size={14} className="shrink-0" />
        <span className="truncate">{table.name}</span>
      </button>

      {expandedTables.has(table.name) && (
        <div className="pl-5 space-y-0.5">
          {table.columns.map((col: Column) => (
            <ColumnItem key={col.name} col={col} tableName={table.name} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SchemaTree({ schema, onTableClick }: SchemaTreeProps) {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());

  const toggleTable = (tableName: string) => {
    const updated = new Set(expandedTables);
    if (updated.has(tableName)) {
      updated.delete(tableName);
    } else {
      updated.add(tableName);
    }
    setExpandedTables(updated);
  };

  if (!schema) {
    return (
      <div className="bg-bg-surface p-4 flex items-center justify-center text-text-secondary text-sm h-full">
        No schema loaded
      </div>
    );
  }

  return (
    <div className="bg-bg-surface p-4 overflow-y-auto h-full">
      {schema.schemas.map((schemaMeta) => (
        <div key={schemaMeta.name} className="mb-4">
          <div className="flex items-center gap-2 text-text-primary font-semibold mb-2">
            <Database size={16} />
            <span>{schemaMeta.name}</span>
          </div>

          <div className="pl-4 space-y-1">
            {schemaMeta.tables.map((table) => (
              <TableItem
                key={table.name}
                table={table}
                expandedTables={expandedTables}
                onToggleTable={toggleTable}
                onTableClick={onTableClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
