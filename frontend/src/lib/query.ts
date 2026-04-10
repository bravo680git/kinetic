/**
 * Extract table name from a SELECT query
 * Handles common patterns like:
 * - SELECT * FROM table_name
 * - SELECT * FROM schema.table_name
 * - SELECT ... FROM table_name WHERE ...
 */
export function extractTableNameFromQuery(query: string): string | undefined {
  const fromMatch = query.match(/\bFROM\s+([^\s,;()]+)/i);
  if (fromMatch && fromMatch[1]) {
    // Remove schema prefix if present (e.g., "schema.table" -> "table")
    const tableName = fromMatch[1].split(".").pop();
    return tableName || undefined;
  }
  return undefined;
}
