import { useSchemaStore } from "@/stores/schema";
import { useCallback, useState } from "react";
import { fetchSchema } from "../lib/api";

export const useSchema = () => {
  const schema = useSchemaStore((state) => state.schema);
  const setSchema = useSchemaStore((state) => state.setSchema);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const connect = useCallback(
    async (connectionString: string) => {
      try {
        const result = await fetchSchema(connectionString);
        setSchema(result);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Unknown error";
        setError(errMsg);
        setSchema(null);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setSchema],
  );

  const disconnect = useCallback(() => {
    setSchema(null);
    setError(undefined);
  }, [setSchema]);

  const getSchema = useCallback(() => {
    return useSchemaStore.getState().schema;
  }, []);

  return { schema, connect, disconnect, loading, error, getSchema };
};
