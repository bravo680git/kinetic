import { create } from "zustand";
import { SchemaResponse } from "../../../shared/types";

type SchemaState = {
  schema: SchemaResponse | null;
  setSchema: (schema: SchemaResponse | null) => void;
};

export const useSchemaStore = create<SchemaState>((set) => ({
  schema: null,
  setSchema: (schema) => set({ schema }),
}));
