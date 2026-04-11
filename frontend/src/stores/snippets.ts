import { create } from "zustand";
import { SnippetsConfig } from "../../../shared/types";

type SnippetsState = {
  snippets: SnippetsConfig;
  setSnippets: (snippets: SnippetsConfig) => void;
};

export const useSnippetsStore = create<SnippetsState>((set) => ({
  snippets: {},
  setSnippets: (snippets) => set({ snippets }),
}));
