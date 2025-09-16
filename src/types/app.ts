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
