<template>
  <div class="dropdown dropdown-end absolute top-4 right-4">
    <div :tabindex="0" role="button" class="btn btn-square btn-sm bg-base-300/25 border-none hover:bg-base-300/50 focus:bg-base-300/50">
      <EllipsisVertical :size="14"/>
    </div>
    <div :tabindex="0" class="dropdown-content menu bg-base-200 rounded-box z-1 w-52 p-2 mt-1 shadow-sm gap-0.5">
      <button
        v-for="(option, index) in options"
        :key="index"
        @click="option.click"
        :disabled="option.disabled"
        :class="cn('btn btn-ghost w-full justify-start font-normal hover:bg-base-300', option.class)"
      >
        <component :is="option.icon" :size="14" />
        {{ option.title }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AccountComponent, AccountOption } from '~/types/accounts';
import {EllipsisVertical, Folder, ExternalLink, Pencil, WandSparkles, Trash } from "lucide-vue-next"
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '~/store/app';
import { useAccountsStore } from '~/store/accounts';
import { useI18n } from "vue-i18n";
import { cn } from '~/lib/utils';

const {t} = useI18n()
const app = useAppStore()
const accounts = useAccountsStore()
const d = defineProps<AccountComponent>()

const isTheActualUser = app.username == d.data.username
const options : AccountOption[] = [
  { title: t("accounts.open_folder"), icon: Folder, click: openUserFolder },
  { title: t("accounts.exec_as"), icon: ExternalLink, disabled: isTheActualUser, click: ()=>console.log("") },
  { title: t("accounts.edit_name"), icon: Pencil, disabled: isTheActualUser, click: editUsername },
  { title: t("accounts.fix_perms"), icon: WandSparkles, disabled: isTheActualUser, click: ()=>console.log("") },
  { title: t("accounts.delete_user"), icon: Trash, disabled: isTheActualUser, click: deleteUser, class: "text-error hover:text-base-content hover:bg-error disabled:text-base-content/20" }
]

function openUserFolder() {
  try {
    if (d.data?.home) {
      invoke("open_system_folder", { folder: d.data.home })
    }
  } catch(e) {
    console.error(e)
  }
}

function editUsername() {
  accounts.selectedAccount = d.data
  const modal = document.getElementById("accounts_edituser") as HTMLDialogElement
  modal.showModal()
}

function deleteUser() {
  accounts.selectedAccount = d.data
  const modal = document.getElementById("accounts_deleteuser") as HTMLDialogElement
  modal.showModal()
}
</script>