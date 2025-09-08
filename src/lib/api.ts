import { fetch } from "@tauri-apps/plugin-http";
import type {
  SteamApiResponse,
  SteamProfileCustomization,
} from "~/types/userTypes";

const steamAPI = "https://api.steampowered.com/";

export async function getUserDeco(steamID: string) {
  if (!steamID) {
    console.error("No user ID received");
    return null;
  }

  try {
    const apiUrl =
      steamAPI +
      "IPlayerService/GetProfileItemsEquipped/v1/?steamid=" +
      steamID;
    const result = await fetch(apiUrl);
    const decorations: SteamApiResponse = await result.json();

    // in case there is no animated picture, we get their normal pfp url as a "backup"
    const parser = new DOMParser();
    const pfpResponse = await fetch(
      `https://steamcommunity.com/profiles/${steamID}/?xml=1`
    );
    const parsedShit = parser.parseFromString(
      await pfpResponse.text(),
      "application/xml"
    );
    const pfp = parsedShit.querySelector("avatarFull")?.textContent;

    if (!decorations.response) {
      throw new Error("No response was found");
    } else {
      const decorationsData: SteamProfileCustomization = {
        ...decorations.response,
        profile_picture: pfp || undefined,
      };
      return decorationsData;
    }
  } catch (err) {
    console.error("Error fetching Steam API:", err);
    return null;
  }
}
