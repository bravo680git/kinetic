import { useCallback, useState } from "react";
import { fetchSnippets } from "../lib/api";
import { useSnippetsStore } from "../stores/snippets";

export function useSnippets() {
  const { snippets, setSnippets } = useSnippetsStore();
  const [loading, setLoading] = useState(false);

  const loadSnippets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchSnippets();
      setSnippets(data);
    } catch (err) {
      console.error("Failed to load snippets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { snippets, loading, loadSnippets };
}
