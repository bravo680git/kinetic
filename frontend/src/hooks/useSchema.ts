import { useState, useCallback } from "react";
import { SchemaResponse } from "../../../shared/types";
import { fetchSchema } from "../lib/api";

export function useSchema() {
  const [schema, setSchema] = useState<SchemaResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connStr, setConnStr] = useState("");

  const connect = useCallback(async (connectionString: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSchema(connectionString);
      setSchema(result);
      setConnStr(connectionString);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errMsg);
      setSchema(null);
      throw err; // Re-throw so caller can handle it
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setSchema(null);
    setConnStr("");
    setError(null);
  }, []);

  return { schema, loading, error, connStr, connect, disconnect };
}
