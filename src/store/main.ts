import { create } from "zustand";
import { MainStore } from "~/types/mainTypes";

export const useMainStore = create<MainStore>()((set) => ({
  screen: "home",
  setScreen: (screen) => set({ screen }),
}));
