import type { LucideIcon } from "lucide-vue-next";

export interface AccountComponent {
  data: AccountData;
}

export interface AccountData {
  uid: number;
  username: string;
  home: string;
  face: string; // we convert it to base64
  steam: SteamAccountData[];
}

export interface SteamAccountData {
  id: string;
  username: string;
  face?: string;
  anim_face?: string;
  frame?: string;
  bg?: string;
  anim_bg?: string;
}

export interface SteamDecorations {
  face?: string;
  anim_face?: string;
  frame?: string;
  bg?: string;
  anim_bg?: string;
}

export interface SteamItemData {
  communityitemid: string;
  name: string;
  item_title: string;
  item_description: string;
  appid: number;
  item_type: number;
  item_class: number;
  equipped_flags?: number;
  image_small?: string;
  image_large?: string;
  movie_mp4?: string;
  movie_mp4_small?: string;
  movie_webm?: string;
  movie_webm_small?: string;
}

export interface AccountOption {
  title: string;
  icon: LucideIcon;
  disabled?: boolean;
  class?: string;
  click: () => void;
}
