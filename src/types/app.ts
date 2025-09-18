import type { LucideIcon } from "lucide-vue-next";

export type ManifoldPage =
  | "home"
  | "screens"
  | "devices"
  | "accounts"
  | "settings";

export interface SidebarPage {
  name: string;
  id: ManifoldPage;
  icon: LucideIcon;
}

export interface ApplicationData {
  name: string;
  description?: string;
  comment?: string;
  icon?: string;
  environment_variables?: string;
  executable?: string;
  arguments?: string;
}
