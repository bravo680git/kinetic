import { useConnectionStore } from "@/stores/connection";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { AlertCircle, Check, Key, Loader, X } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  ColumnMeta,
  QueryResponse,
  UpdateRowRequest,
} from "../../../shared/types";
import { updateRow } from "../lib/api";

interface ResultGridProps {
  queryResult: QueryResponse | null;
  loading: boolean;
  error: string | null;
  tableName?: string;
  columnsMeta?: Record<string, ColumnMeta> | null;
  onSaveSuccess?: () => void;
}

interface EditCellData {
  rowIndex: number;
  colName: string;
  newValue: string;
}

interface EditedRow {
  rowIndex: number;
  pkColumn: string;
  pkValue: unknown;
  changes: Record<string, unknown>;
}

interface EditableCellProps {
  value: unknown;
  rowIndex: number;
  colName: string;
  isEditing: boolean;
  hasEdit: boolean;
  editValue: string;
  onCellClick: (e: React.MouseEvent, rowIndex: number, colName: string) => void;
  onCellChange: (rowIndex: number, colName: string, value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const EditableCell = memo(function EditableCell({
  value,
  rowIndex,
  colName,
  isEditing,
  hasEdit,
  editValue,
  onCellClick,
  onCellChange,
  onKeyDown,
}: EditableCellProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => onCellChange(rowIndex, colName, e.target.value)}
        onKeyDown={onKeyDown}
        className="w-full px-2 py-1 text-xs font-mono rounded border-2 border-accent bg-bg-base text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-0 transition-all"
      />
    );
  }

  const displayValue = hasEdit ? editValue : value;

  return (
    <span
      onMouseDown={(e) => onCellClick(e, rowIndex, colName)}
      className={`text-xs font-mono cursor-cell px-1 py-0.5 rounded transition-colors block ${
        hasEdit
          ? "bg-accent/20 text-accent font-semibold"
          : "hover:bg-accent/10"
      }`}
    >
      {displayValue === null ? (
        <span className="text-text-secondary italic">null</span>
      ) : displayValue === "null" ? (
        <span className="text-text-secondary italic">null</span>
      ) : (
        String(displayValue)
      )}
    </span>
  );
});

interface EditToolbarProps {
  editingData: Map<string, EditCellData>;
  pkColumn: string;
  isSaving: boolean;
  columnsMeta?: Record<string, ColumnMeta> | null;
  queryResult: QueryResponse;
  editingError: string | null;
  onPkColumnChange: (value: string) => void;
  onApply: () => void;
  onCancel: () => void;
  tableName?: string;
}

const EditToolbar = memo(function EditToolbar({
  editingData,
  pkColumn,
  isSaving,
  columnsMeta,
  queryResult,
  editingError,
  onPkColumnChange,
  onApply,
  onCancel,
  tableName,
}: EditToolbarProps) {
  if (editingData.size === 0) {
    return (
      <div className="flex items-center justify-between px-4 py-2 text-xs text-text-secondary gap-4">
        <span>
          {queryResult.row_count} rows · {queryResult.execution_time_ms}ms
        </span>
        <div className="flex items-center gap-3">
          {queryResult.truncated && (
            <span className="px-2 py-1 bg-warning/20 text-warning rounded text-xs font-medium">
              Truncated (limit: {queryResult.row_count})
            </span>
          )}
          {!tableName && (
            <span className="text-text-secondary text-xs">
              💡 Double-click any cell to edit
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 text-xs text-text-secondary gap-4">
      <span>
        {queryResult.row_count} rows · {queryResult.execution_time_ms}ms
      </span>
      <div className="flex items-center gap-3">
        {!pkColumn && columnsMeta && (
          <select
            value={pkColumn}
            onChange={(e) => onPkColumnChange(e.target.value)}
            className="px-2 py-1 rounded border border-border bg-bg-base text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <option value="">
              {Object.values(columnsMeta).some((c) => c.isPrimaryKey)
                ? "Select Primary Key"
                : "No PK found"}
            </option>
            {Object.entries(columnsMeta)
              .filter(([_, col]) => col.isPrimaryKey)
              .map(([name]) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            {Object.entries(columnsMeta)
              .filter(([_, col]) => !col.isPrimaryKey)
              .map(([name]) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
          </select>
        )}
        {!pkColumn && !columnsMeta && (
          <select
            value={pkColumn}
            onChange={(e) => onPkColumnChange(e.target.value)}
            className="px-2 py-1 rounded border border-border bg-bg-base text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/50"
          >
            <option value="">Select Primary Key</option>
            {queryResult.columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        )}
        {pkColumn && (
          <span className="text-text-secondary text-xs flex items-center gap-1.5">
            <Key size={12} className="text-accent" />
            <span className="font-mono text-accent">{pkColumn}</span>
          </span>
        )}
        <span className="text-accent font-medium">
          {editingData.size} change(s)
        </span>
        <button
          onClick={onApply}
          disabled={isSaving || !pkColumn}
          className="px-3 py-1 rounded bg-success/20 hover:bg-success/30 text-success font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check size={14} />
          {isSaving ? "Saving..." : "Apply"}
        </button>
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="px-3 py-1 rounded bg-error/20 hover:bg-error/30 text-error font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X size={14} />
          Cancel
        </button>
      </div>
    </div>
  );
});

export function ResultGrid({
  queryResult,
  loading,
  error,
  tableName,
  columnsMeta,
  onSaveSuccess,
}: ResultGridProps) {
  const connectionString = useConnectionStore((state) => state.connStr);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [editingData, setEditingData] = useState<Map<string, EditCellData>>(
    new Map(),
  );
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    colName: string;
  } | null>(null);
  const [pkColumn, setPkColumn] = useState<string>("");
  const [editingError, setEditingError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Helper to generate cell key
  const getCellKey = (rowIndex: number, colName: string) =>
    `${rowIndex}_${colName}`;

  // Auto-detect primary key from columnsMeta
  useEffect(() => {
    if (!columnsMeta || pkColumn) return;
    const pkCols = Object.entries(columnsMeta)
      .filter(([_, col]) => col.isPrimaryKey)
      .map(([name]) => name);
    if (pkCols.length === 1) {
      setPkColumn(pkCols[0]);
    }
  }, [columnsMeta, pkColumn]);

  const getEditValue = (rowIndex: number, colName: string) => {
    const key = getCellKey(rowIndex, colName);
    const edit = editingData.get(key);
    if (edit) return edit.newValue;
    const originalValue = queryResult?.rows[rowIndex]?.[colName];
    return originalValue === null ? "null" : String(originalValue ?? "");
  };

  const handleCellChange = useCallback(
    (rowIndex: number, colName: string, value: string) => {
      const key = getCellKey(rowIndex, colName);
      setEditingData((prev) => {
        const updated = new Map(prev);
        updated.set(key, { rowIndex, colName, newValue: value });
        return updated;
      });
    },
    [],
  );

  const handleCellClick = useCallback(
    (e: React.MouseEvent, rowIndex: number, colName: string) => {
      if (e.detail === 2) {
        // Double click
        e.preventDefault();
        setEditingCell({ rowIndex, colName });
      }
    },
    [],
  );

  const handleInputKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Escape") {
      setEditingCell(null);
    }
  }, []);

  const handleApplyChanges = useCallback(async () => {
    if (!queryResult || !tableName) {
      setEditingError("Could not detect table information");
      return;
    }

    if (!pkColumn) {
      setEditingError("Please select a primary key column");
      return;
    }

    if (editingData.size === 0) {
      return;
    }

    setIsSaving(true);
    setEditingError(null);

    try {
      // Group edits by row
      const rowsToUpdate: Map<number, EditedRow> = new Map();

      editingData.forEach(({ rowIndex, colName, newValue }) => {
        const row = rowsToUpdate.get(rowIndex);
        const pkValue = queryResult.rows[rowIndex]?.[pkColumn];

        if (!row) {
          rowsToUpdate.set(rowIndex, {
            rowIndex,
            pkColumn,
            pkValue,
            changes: { [colName]: parseValue(newValue) },
          });
        } else {
          row.changes[colName] = parseValue(newValue);
        }
      });

      // Execute all updates
      const updatePromises = Array.from(rowsToUpdate.values()).map((row) => {
        const req: UpdateRowRequest = {
          connection_string: connectionString,
          table: tableName,
          pk_column: pkColumn,
          pk_value: row.pkValue,
          updates: row.changes,
        };
        return updateRow(req);
      });

      const results = await Promise.all(updatePromises);
      const failed = results.some((r) => !r.success);

      if (failed) {
        const errorMsg =
          results.find((r) => !r.success)?.error || "Update failed";
        setEditingError(errorMsg);
        return;
      }

      // Clear editing state and refetch
      setEditingData(new Map());
      setEditingCell(null);
      toast.success("Changes saved successfully!");
      onSaveSuccess?.();
    } catch (err) {
      setEditingError(
        err instanceof Error ? err.message : "Failed to save changes",
      );
    } finally {
      setIsSaving(false);
    }
  }, [
    queryResult,
    tableName,
    pkColumn,
    editingData,
    connectionString,
    onSaveSuccess,
  ]);

  const parseValue = (value: string): unknown => {
    if (value.toLowerCase() === "null") return null;
    if (value === "true") return true;
    if (value === "false") return false;
    if (!isNaN(Number(value)) && value !== "") return Number(value);
    return value;
  };

  const handlePkColumnChange = useCallback((value: string) => {
    setPkColumn(value);
  }, []);

  const handleCancel = useCallback(() => {
    setEditingData(new Map());
    setEditingCell(null);
    setPkColumn("");
    setEditingError(null);
  }, []);

  const columns = useMemo<ColumnDef<Record<string, unknown>>[]>(
    () =>
      (queryResult?.columns ?? []).map((col) => ({
        accessorKey: col,
        header: col,
        cell: (info) => {
          const value = info.getValue();
          const rowIndex = info.row.index;
          const cellKey = getCellKey(rowIndex, col);
          const isEditing =
            editingCell?.rowIndex === rowIndex && editingCell?.colName === col;
          const hasEdit = editingData.has(cellKey);

          return (
            <EditableCell
              value={value}
              rowIndex={rowIndex}
              colName={col}
              isEditing={isEditing}
              hasEdit={hasEdit}
              editValue={getEditValue(rowIndex, col)}
              onCellClick={handleCellClick}
              onCellChange={handleCellChange}
              onKeyDown={handleInputKeyDown}
            />
          );
        },
      })),
    [
      queryResult?.columns,
      editingCell,
      editingData,
      handleCellClick,
      handleCellChange,
      handleInputKeyDown,
    ],
  );

  const data = useMemo(() => queryResult?.rows ?? [], [queryResult?.rows]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 32,
    overscan: 10,
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-base min-h-0">
        <div className="flex flex-col items-center gap-2">
          <Loader size={24} className="animate-spin text-accent" />
          <span className="text-text-secondary">Executing query...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-base min-h-0 p-4">
        <div className="flex items-start gap-3 px-4 py-3 bg-error/10 border border-error/20 rounded-md max-w-md">
          <AlertCircle size={20} className="text-error shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-error font-semibold">Query Error</p>
            <p className="text-xs text-error/90 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!queryResult) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bg-base min-h-0">
        <span className="text-text-secondary text-sm">
          Run a query to see results
        </span>
      </div>
    );
  }

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  return (
    <div className="flex flex-col bg-bg-base flex-1 min-h-0 overflow-hidden h-full">
      <div ref={tableContainerRef} className="flex-1 overflow-y-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-bg-surface border-b border-border">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-2 text-left text-text-primary font-semibold text-xs"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {paddingTop > 0 && (
              <tr>
                <td style={{ height: `${paddingTop}px` }} />
              </tr>
            )}
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];
              const isEven = virtualRow.index % 2 === 0;
              return (
                <tr
                  key={row.id}
                  className={isEven ? "bg-bg-surface" : "bg-bg-elevated"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-2 border-b border-border"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
            {paddingBottom > 0 && (
              <tr>
                <td style={{ height: `${paddingBottom}px` }} />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="sticky bottom-0 flex flex-col border-t border-border bg-bg-surface z-10 shrink-0">
        {editingError && (
          <div className="px-4 py-2 bg-error/10 border-b border-error/20 text-xs text-error">
            {editingError}
          </div>
        )}
        <EditToolbar
          editingData={editingData}
          pkColumn={pkColumn}
          isSaving={isSaving}
          columnsMeta={columnsMeta}
          queryResult={queryResult}
          editingError={editingError}
          onPkColumnChange={handlePkColumnChange}
          onApply={handleApplyChanges}
          onCancel={handleCancel}
          tableName={tableName}
        />
      </div>
    </div>
  );
}
