/**
 * Kinetic - Single-Binary Web SQL Tool
 * Shared Type Definitions (canonical API contracts)
 *
 * These types are the single source of truth for all Frontend ↔ Backend communication.
 * Backend Go structs in handlers must mirror these shapes exactly (via encoding/json tags).
 */

/**
 * Column metadata from information_schema
 */
export interface ColumnMeta {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  foreignKeyInfo?: {
    referencedTable: string;
    referencedColumn: string;
  };
}

/**
 * Table metadata including all columns
 */
export interface TableMeta {
  name: string;
  columns: ColumnMeta[];
}

/**
 * Schema (namespace) containing tables
 */
export interface SchemaMeta {
  name: string;
  tables: TableMeta[];
}

/**
 * Response from GET /api/schema?connection_string=...
 * Contains complete database structure
 */
export interface SchemaResponse {
  dialect: "postgres";
  schemas?: SchemaMeta[];
}

/**
 * Request body for POST /api/query
 */
export interface QueryRequest {
  connection_string: string;
  sql: string;
}

/**
 * Response from POST /api/query
 * Includes execution metadata and result data
 */
export interface QueryResponse {
  columns: string[];
  rows: Record<string, unknown>[];
  row_count: number;
  truncated: boolean;
  execution_time_ms: number;
}

/**
 * Request body for POST /api/connections/test
 */
export interface TestConnectionRequest {
  connection_string: string;
}

/**
 * Response from POST /api/connections/test
 */
export interface TestConnectionResponse {
  ok: boolean;
  error?: string;
}

/**
 * Request body for POST /api/update
 * Executes an UPDATE query to save edited rows
 */
export interface UpdateRowRequest {
  connection_string: string;
  table: string;
  pk_column: string;
  pk_value: unknown;
  updates: Record<string, unknown>;
}

/**
 * Response from POST /api/update
 */
export interface UpdateRowResponse {
  success: boolean;
  rows_affected: number;
  error?: string;
}

/**
 * Request/Response for GET/POST /api/config
 */
export interface Config {
  general?: {
    sidebar_collapsed?: boolean;
    result_panel_percentage?: number;
  };
  query?: {
    row_limit?: number;
  };
}

/**
 * Snippets configuration
 * Request/Response for GET/POST /api/snippets
 */
export type SnippetsConfig = Record<string, string>;

/**
 * Generic API error envelope
 */
export interface ApiError {
  error: string;
  detail?: string;
}

/**
 * Type guard: check if response is an error
 */
export function isApiError(data: unknown): data is ApiError {
  return typeof data === "object" && data !== null && "error" in data;
}
