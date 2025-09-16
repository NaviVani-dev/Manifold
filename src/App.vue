<script setup lang="ts">
  import Sidebar from "~/components/shared/Sidebar.vue"
  import Home from "~/app/Home.vue"
  import Screens from "~/app/Screens.vue";
  import Devices from "~/app/Devices.vue";
  import Accounts from "~/app/Accounts.vue";
  import Settings from "~/app/Settings.vue";

  import { useAppStore } from "~/store/app";
  const app = useAppStore()
</script>

<template>
  <main class="w-screen h-screen flex flex-row overflow-hidden">
    <Sidebar />
    <Home v-show="app.screen == 'home'" />
    <Screens v-show="app.screen == 'screens'" />
    <Devices v-show="app.screen == 'devices'" />
    <Accounts v-show="app.screen == 'accounts'" />
    <Settings v-show="app.screen == 'settings'" />
  </main>
</template>