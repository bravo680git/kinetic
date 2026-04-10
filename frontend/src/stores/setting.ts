import { create } from "zustand";
import { Config } from "../../../shared/types";

type SettingState = {
  config: Config;
  setConfig: (newConfig: Config) => void;
};

export const useSettingStore = create<SettingState>((set) => ({
  config: {},
  setConfig: (newConfig) => set({ config: newConfig }),
}));
