<template>
  <div class="w-76 h-50 bg-base-200 rounded-md flex flex-col gap-2 relative">
    <div v-if="accounts.fetchStatus === 'steam'" class="w-full h-full absolute inset-0 overflow-hidden rounded-md skeleton bg-base-200" />
    <div v-if="accounts.fetchStatus === 'done'" class="w-full h-full absolute inset-0 overflow-hidden rounded-md">
      <img
        v-if="d.data.steam[0]?.face || d.data.face"
        :src="d.data.steam[0]?.face || d.data.face"
        class="w-full h-full object-cover blur-md opacity-30 absolute inset-0 pointer-events-none"
      />
      <img
        v-if="d.data.steam[0]?.bg"
        :src="d.data.steam[0]?.bg"
        class="w-full h-full object-cover absolute inset-0"
      />
      <video
        autoplay muted loop
        v-if="d.data.steam[0]?.anim_bg"
        :src="d.data.steam[0]?.anim_bg"
        class="w-full h-full object-cover absolute inset-0"
      />
    </div>
    <div v-if="accounts.fetchStatus === 'steam'" class="absolute left-4 top-4 w-26 h-26 z-[1] skeleton rounded-none bg-base-200" />
    <div v-if="accounts.fetchStatus === 'done'" class="absolute left-4 top-4 w-26 h-26 z-[1] border-b-2 border-accent">
      <div v-if="!d.data.steam[0]?.anim_face" class="w-full h-full bg-base-300 flex items-center justify-center border-b-2 border-accent">
        <UserRound :size="62"/>
      </div>
      <img
        v-if="d.data.steam[0]?.anim_face || d.data.steam[0]?.face || d.data.face"
        :src="d.data.steam[0]?.anim_face || d.data.steam[0]?.face || d.data.face"
        class="w-full h-full absolute inset-0"
      />
      <img
        v-if="d.data.steam[0]?.frame"
        :src="d.data.steam[0]?.frame"
        class="w-full h-full scale-[1.23] pointer-events-none absolute inset-0"
      />
    </div>
    <div class="absolute bottom-0 w-full h-1/2 p-4 pt-10 flex flex-col justify-start bg-gradient-to-b from-[rgba(24,26,30,0.85)] from-[5%] to-[rgba(24,26,30,0.65)] to-[95%]">
      <div class="flex flex-row items-center gap-1">
        <UserRound :size="12" class="mt-1" />
        <p class="text-xl">{{ d.data.username }}</p>
      </div>
      <div class="flex flex-row items-center gap-1">
        <Steam :size="12" />
        <p v-if="d.data.steam[0]?.username" class="text-sm">{{ d.data.steam[0]?.username }}</p>
        <div v-if="d.data.steam.length > 1" class="tooltip" :data-tip="$t('accounts.multiple_accs')">
          <p class="text-xs text-base-content/50 mt-0.5">+{{ d.data.steam.length - 1 }}</p>
        </div>
        <div v-if="!d.data.steam[0]?.username" class="tooltip" :data-tip="$t('accounts.no_steam_acc_tip')">
          <p class="text-sm">{{ $t('accounts.no_steam_acc') }}</p>
        </div>
      </div>
    </div>
    <AccountOptions :data="d.data" />
  </div>
</template>

<script setup lang="ts">
import type { AccountComponent } from '~/types/accounts';
import { useAccountsStore } from '~/store/accounts';
import { UserRound } from "lucide-vue-next"
import AccountOptions from '~/components/accounts/AccountOptions.vue';
import Steam from '~/components/shared/icons/Steam.vue';

const d = defineProps<AccountComponent>()
const accounts = useAccountsStore()
</script>