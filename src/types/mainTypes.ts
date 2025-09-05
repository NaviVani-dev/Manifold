import { IconifyIcon } from "@iconify-icon/react/dist/iconify.mjs";

export type AppScreens =
  | "home"
  | "screens"
  | "devices"
  | "accounts"
  | "settings";

export interface ScreensData {
  name: string;
  screen: AppScreens;
  icon: string | IconifyIcon;
}

// zustand interface
export interface MainStore {
  screen: AppScreens;
  setScreen: (screen: AppScreens) => void;
}
