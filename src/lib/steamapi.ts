import { fetch } from "@tauri-apps/plugin-http";
import {
  create,
  mkdir,
  exists,
  BaseDirectory,
  writeTextFile,
  readTextFile,
} from "@tauri-apps/plugin-fs";
import type { SteamItemData, SteamDecorations } from "~/types/accounts";
import { convertFileSrc } from "@tauri-apps/api/core";
import * as path from "@tauri-apps/api/path";

const appCacheDir = await path.appCacheDir();
const cacheFolder = "steam_cache";
const baseDir = { baseDir: BaseDirectory.AppCache };
const steamAPI = "https://api.steampowered.com";
const assetsUrl =
  "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/";

export async function fetchSteamProfile(id: string): Promise<SteamDecorations> {
  if (!id) {
    console.error("No user ID received");
    return {};
  }

  try {
    const faceData = await fetchFace(id);
    const decorationsData = await fetchDecorations(id);

    if (
      Object.keys(decorationsData).length > 0 ||
      Object.keys(faceData).length > 0
    ) {
      return { ...faceData, ...decorationsData };
    }

    const offlineData = await fetchOfflineCache(id);
    return offlineData;
  } catch (error) {
    console.log("Online fetch failed, falling back to cache:", error);
    const offlineData = await fetchOfflineCache(id);
    return offlineData;
  }
}

export async function fetchOfflineCache(id: string): Promise<SteamDecorations> {
  try {
    const userCachePath = `${cacheFolder}/${id}.json`;
    if (!(await exists(userCachePath, baseDir))) {
      return {};
    }

    const facePath = (await exists(`${cacheFolder}/face/${id}.png`, baseDir))
      ? convertFileSrc(await path.join(appCacheDir, `face/${id}.png`))
      : undefined;

    const userJson = JSON.parse(await readTextFile(userCachePath, baseDir));

    return {
      face: facePath,
      anim_face: userJson.anim_face
        ? convertFileSrc(await path.join(appCacheDir, userJson.anim_face))
        : undefined,
      frame: userJson.frame
        ? convertFileSrc(await path.join(appCacheDir, userJson.frame))
        : undefined,
      bg: userJson.bg
        ? convertFileSrc(await path.join(appCacheDir, userJson.bg))
        : undefined,
    };
  } catch (e) {
    console.log(e);
    return {};
  }
}

export async function fetchFace(id: string): Promise<SteamDecorations> {
  try {
    const parser = new DOMParser();
    const profileAPI = `https://steamcommunity.com/profiles/${id}/?xml=1`;
    const result = await fetch(profileAPI);

    if (!result.ok) {
      throw new Error(`HTTP ${result.status}: ${result.statusText}`);
    }

    const face_parsed = parser.parseFromString(
      await result.text(),
      "application/xml"
    );

    const face_url = face_parsed.querySelector("avatarFull")?.textContent;
    const face_file =
      face_url &&
      (await cacheSteamDecoration(face_url, `${id}.png`, "face", false));
    const face =
      (face_file && convertFileSrc(await path.join(appCacheDir, face_file))) ||
      undefined;
    return { face };
  } catch (e) {
    console.log(e);
    return {};
  }
}

export async function fetchDecorations(id: string): Promise<SteamDecorations> {
  try {
    const userCachePath = `${cacheFolder}/${id}.json`;
    const decoAPI = `${steamAPI}/IPlayerService/GetProfileItemsEquipped/v1/?steamid=${id}`;
    const result = await fetch(decoAPI);

    if (!result.ok) {
      throw new Error(`HTTP ${result.status}: ${result.statusText}`);
    }

    const decorations = await result.json();

    if (!decorations.response) {
      throw new Error("Invalid API response structure");
    }

    const af_url: SteamItemData = decorations.response.animated_avatar;
    const fr_url: SteamItemData = decorations.response.avatar_frame;
    const bg_url: SteamItemData = decorations.response.mini_profile_background;

    const anim_face =
      af_url?.communityitemid &&
      (await cacheSteamDecoration(
        af_url.image_small || af_url.image_large,
        `${af_url.communityitemid}.${af_url.image_small ? "gif" : "jpg"}`,
        "anim_face"
      ));

    const frame =
      fr_url?.communityitemid &&
      (await cacheSteamDecoration(
        fr_url.image_small || fr_url.image_large,
        `${fr_url.communityitemid}.png`,
        "frame"
      ));

    const bg =
      bg_url?.communityitemid &&
      (await cacheSteamDecoration(
        bg_url.image_large,
        `${bg_url.communityitemid}.png`,
        "bg"
      ));

    //atleast in my pc, videos wont work unless u get their online url
    // so we just cache the png and, if u have internet, the video will play :)
    const anim_bg =
      (bg_url?.movie_webm && assetsUrl + bg_url?.movie_webm) ||
      (bg_url?.movie_mp4 && assetsUrl + bg_url?.movie_mp4);

    const cacheData = {
      anim_face,
      frame,
      bg,
    };

    const cacheJson = JSON.stringify(cacheData);
    const hasValidData = anim_face || frame || bg;

    if (hasValidData) {
      try {
        if (!(await exists(userCachePath, baseDir))) {
          (await create(userCachePath, baseDir)).close();
        }
        await writeTextFile(userCachePath, cacheJson, baseDir);
      } catch (cacheError) {
        console.log("Failed to write cache file:", cacheError);
      }
    }

    return {
      anim_face:
        anim_face && convertFileSrc(await path.join(appCacheDir, anim_face)),
      frame: frame && convertFileSrc(await path.join(appCacheDir, frame)),
      bg: bg && convertFileSrc(await path.join(appCacheDir, bg)),
      anim_bg,
    };
  } catch (e) {
    console.log(e);
    return {};
  }
}

export async function cacheSteamDecoration(
  url: string | null | undefined,
  file: string,
  decoType: "frame" | "anim_face" | "bg" | "face",
  joinAssetsPath = true
): Promise<string | undefined> {
  try {
    if (!url || !file) {
      console.error(
        "Parameters are missing, received: URL:",
        url,
        " file:",
        file
      );
      return undefined;
    }

    await createSteamCacheFolders();

    const cachePath = `${cacheFolder}/${decoType}/${file}`;
    const fileExists = await exists(cachePath, baseDir);

    // Since pfp are stored with the users id, we need to update them frequently in case they change them
    if (!fileExists || decoType == "face") {
      const URL = joinAssetsPath ? assetsUrl + url : url;
      const imageData = await fetch(URL);

      if (!imageData.ok) {
        throw new Error(`Failed to download image: HTTP ${imageData.status}`);
      }

      const blob = await imageData.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const newFile = await create(cachePath, baseDir);
      await newFile.write(uint8Array);
      await newFile.close();
    }

    return cachePath;
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function createSteamCacheFolders() {
  const folders = [
    cacheFolder,
    `${cacheFolder}/frame`,
    `${cacheFolder}/anim_face`,
    `${cacheFolder}/bg`,
    `${cacheFolder}/face`,
  ];
  for (const folder of folders) {
    if (!(await exists(folder, baseDir))) {
      await mkdir(folder, baseDir);
    }
  }
}
