import { useSettingStore } from "@/stores/setting";
import { useCallback, useState } from "react";
import { Config } from "../../../shared/types";
import { fetchConfig, updateConfig as updateConfigApi } from "../lib/api";

export function useSettings() {
  const { config, setConfig } = useSettingStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(
    async (callback?: (config: Config) => void) => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchConfig();
        setConfig(data);
        callback?.(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load config");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const saveConfig = useCallback(async (newConfig: Config) => {
    setError(null);
    try {
      const data = await updateConfigApi(newConfig);
      setConfig(data);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save config");
      return false;
    } finally {
    }
  }, []);

  const updateConfig = useCallback((data: Partial<Config>) => {
    const config = useSettingStore.getState().config;
    if (!config) return;
    const newConfig = { ...config };
    Object.entries(data).forEach(([key, value]) => {
      const mainKey = key as keyof Config;
      if (value === undefined) return;
      Object.entries(value).forEach(([subKey, subValue]) => {
        if (subValue === undefined) return;
        newConfig[mainKey] = {
          ...newConfig[mainKey],
          [subKey]: subValue,
        };
      });
    });
    setConfig(newConfig);
    saveConfig(newConfig);
  }, []);

  return {
    config,
    setConfig,
    loading,
    error,
    loadConfig,
    saveConfig,
    updateConfig,
  };
}
