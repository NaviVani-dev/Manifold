<script setup lang="ts">
import type { SidebarPage } from "~/types/app";
import { useI18n } from "vue-i18n";
import { useAppStore } from "~/store/app";
import { HomeIcon, AppWindowMac, Gamepad2, UsersRound, Bolt } from "lucide-vue-next";

const {t} = useI18n()
const app = useAppStore()
const topPages: SidebarPage[] = [
  { name: t("sidebar.home"), id: "home", icon: HomeIcon },
  { name: t("sidebar.screens"), id: "screens", icon: AppWindowMac },
  { name: t("sidebar.devices"), id: "devices", icon: Gamepad2 },
  { name: t("sidebar.accounts"), id: "accounts", icon: UsersRound }
];
const bottomPages: SidebarPage[] = [{ name: t("sidebar.settings"), id: "settings", icon: Bolt }];
</script>

<template>
  <aside class="h-full min-w-16 max-w-16 bg-base-200 flex flex-col items-center justify-between py-2">
    <nav class="flex flex-col gap-2">
      <div v-for="(page, index) in topPages" :key="index" class="tooltip tooltip-right" :data-tip="page.name">
        <button class="btn btn-square text-xl" :class="app.screen === page.id ? 'btn-primary' : ''" @click="app.screen = page.id">
          <component :is="page.icon" />
        </button>
      </div>
    </nav>
    <nav class="flex flex-col-reverse gap-2">
      <div v-for="(page, index) in bottomPages" :key="index" class="tooltip tooltip-right" :data-tip="page.name">
        <button class="btn btn-square text-xl":class="app.screen === page.id ? 'btn-primary' : ''" @click="app.screen = page.id">
          <component :is="page.icon" />
        </button>
      </div>
    </nav>
  </aside>
</template>
