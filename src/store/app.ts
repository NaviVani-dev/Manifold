import { invoke } from "@tauri-apps/api/core";
import { defineStore } from "pinia";
import { ref } from "vue";
import type { ManifoldPage, ApplicationData } from "~/types/app";

export const useAppStore = defineStore("app", () => {
  const screen = ref<ManifoldPage>("home");
  const username = ref<string>();
  const applications = ref<ApplicationData[]>();
  const selectedApplication = ref<ApplicationData>();

  try {
    invoke<string>("get_username").then((user) => {
      username.value = user;
    });
    invoke<ApplicationData[]>("get_apps_folder").then((apps) => {
      applications.value = apps;
    });
  } catch (e) {
    console.error(e);
  }

  return { screen, username, applications, selectedApplication };
});
