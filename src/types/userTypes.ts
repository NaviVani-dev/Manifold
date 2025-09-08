export interface UserData {
  username: string;
  uid?: number;
  folder?: string;
  pfp?: string;
  created_at?: number;
  steam_accs: SteamConfigData[];
}

export interface SteamConfigData {
  id: string;
  username: string;
  deco?: SteamProfileCustomization;
}

export interface SteamApiResponse {
  response: SteamProfileCustomization;
}

export interface SteamProfileCustomization {
  profile_background?: SteamItemData;
  mini_profile_background?: SteamItemData;
  avatar_frame?: SteamItemData;
  animated_avatar?: SteamItemData;
  profile_picture?: string;
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

// zustand state
export interface UsersStore {
  users?: UserData[];
  setUsers: (users: UserData[] | undefined) => void;
  updateUser: (index: number, newData: Partial<UserData>) => void;
}
