import {
  ChevronRight,
  Database,
  Table2,
  Columns,
  Key,
  Link2,
} from "lucide-react";
import { useState } from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
} from "@floating-ui/react";
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

interface ColumnTooltipProps {
  col: Column;
  isVisible: boolean;
  floatingStyles: React.CSSProperties;
  floatingRef: (node: HTMLElement | null) => void;
}

function ColumnTooltip({
  col,
  isVisible,
  floatingStyles,
  floatingRef,
}: ColumnTooltipProps) {
  if (!isVisible) return null;

  return (
    <div
      ref={floatingRef}
      style={floatingStyles}
      className="z-50 bg-bg-elevated border border-border rounded-md p-3 shadow-lg text-xs text-text-primary whitespace-nowrap"
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
            <span className="text-status-warning">
              FK: {col.foreignKeyInfo.referencedTable}.
              {col.foreignKeyInfo.referencedColumn}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

interface ColumnItemProps {
  col: Column;
  tableName: string;
  hoveredColumn: string | null;
  onHoverChange: (columnId: string | null) => void;
  onReferenceChange: (el: HTMLElement | null) => void;
  floatingStyles: React.CSSProperties;
  floatingRef: (node: HTMLElement | null) => void;
}

function ColumnItem({
  col,
  tableName,
  hoveredColumn,
  onHoverChange,
  onReferenceChange,
  floatingStyles,
  floatingRef,
}: ColumnItemProps) {
  const columnId = `${tableName}-${col.name}`;
  const isHovered = hoveredColumn === columnId;

  return (
    <div key={col.name}>
      <div
        ref={(el) => {
          if (isHovered && el) {
            onReferenceChange(el);
          }
        }}
        onMouseEnter={(e) => {
          onHoverChange(columnId);
          onReferenceChange(e.currentTarget);
        }}
        onMouseLeave={() => onHoverChange(null)}
        className="flex items-center gap-2 px-2 py-1 text-xs text-text-secondary hover:bg-bg-elevated rounded transition-colors cursor-help"
        title="Hover for details"
      >
        {col.isPrimaryKey ? (
          <Key size={12} className="text-accent" />
        ) : col.isForeignKey ? (
          <Link2 size={12} className="text-status-warning" />
        ) : (
          <Columns size={12} className="flex-shrink-0" />
        )}
        <span>{col.name}</span>
      </div>

      <ColumnTooltip
        col={col}
        isVisible={isHovered}
        floatingStyles={floatingStyles}
        floatingRef={floatingRef}
      />
    </div>
  );
}

interface TableItemProps {
  table: any;
  expandedTables: Set<string>;
  hoveredColumn: string | null;
  onToggleTable: (tableName: string) => void;
  onTableClick?: (tableName: string) => void;
  onHoverChange: (columnId: string | null) => void;
  onReferenceChange: (el: HTMLElement | null) => void;
  floatingStyles: React.CSSProperties;
  floatingRef: (node: HTMLElement | null) => void;
}

function TableItem({
  table,
  expandedTables,
  hoveredColumn,
  onToggleTable,
  onTableClick,
  onHoverChange,
  onReferenceChange,
  floatingStyles,
  floatingRef,
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
          className={`transition-transform flex-shrink-0 ${
            expandedTables.has(table.name) ? "rotate-90" : ""
          }`}
        />
        <Table2 size={14} className="flex-shrink-0" />
        <span className="truncate">{table.name}</span>
      </button>

      {expandedTables.has(table.name) && (
        <div className="pl-5 space-y-0.5">
          {table.columns.map((col: Column) => (
            <ColumnItem
              key={col.name}
              col={col}
              tableName={table.name}
              hoveredColumn={hoveredColumn}
              onHoverChange={onHoverChange}
              onReferenceChange={onReferenceChange}
              floatingStyles={floatingStyles}
              floatingRef={floatingRef}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function SchemaTree({ schema, onTableClick }: SchemaTreeProps) {
  const [expandedTables, setExpandedTables] = useState<Set<string>>(new Set());
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [referenceEl, setReferenceEl] = useState<HTMLElement | null>(null);

  const { refs, floatingStyles } = useFloating({
    whileElementsMounted: autoUpdate,
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    elements: {
      reference: referenceEl,
    },
  });

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
                hoveredColumn={hoveredColumn}
                onToggleTable={toggleTable}
                onTableClick={onTableClick}
                onHoverChange={setHoveredColumn}
                onReferenceChange={setReferenceEl}
                floatingStyles={floatingStyles}
                floatingRef={refs.setFloating}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
