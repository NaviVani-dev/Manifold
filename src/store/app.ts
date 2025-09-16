import { invoke } from "@tauri-apps/api/core";
import { defineStore } from "pinia";
import { ref } from "vue";
import type { ManifoldPage } from "~/types/app";

export const useAppStore = defineStore("app", () => {
  const screen = ref<ManifoldPage>("home");
  const username = ref<string>();

  invoke<string>("get_username").then((user) => {
    username.value = user;
  });

  return { screen, username };
});
