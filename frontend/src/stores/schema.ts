import { create } from "zustand";
import { SchemaResponse } from "../../../shared/types";
import { fetchSchema } from "../lib/api";

type SchemaState = {
  schema: SchemaResponse | null;
  loading: boolean;
  error: string | null;
  connect: (connectionString: string) => Promise<void>;
  disconnect: () => void;
};

export const useSchemaStore = create<SchemaState>((set) => ({
  schema: null,
  loading: false,
  error: null,

  connect: async (connectionString: string) => {
    set({ loading: true, error: null });
    try {
      const result = await fetchSchema(connectionString);
      set({ schema: result, loading: false });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Unknown error";
      set({ error: errMsg, schema: null, loading: false });
      throw err;
    }
  },

  disconnect: () => set({ schema: null, error: null }),
}));
