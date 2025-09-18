<template>
  <dialog id="accounts_openas" class="modal">
    <div class="modal-box w-11/12 h-160 max-w-3xl max-h-160 pb-4 overflow-hidden">
      <h3 class="font-bold text-lg">{{ $t("accounts.open_app_as.title", {user: accounts.accounts && accounts.selectedAccount &&accounts.accounts[accounts.selectedAccount].username}) }}</h3>
      <p class="text-xs text-base-content/50">{{ $t("accounts.open_app_as.tip") }}</p>

      <div class="flex flex-row w-full h-9/12 mt-4 overflow-hidden">
        <div class="flex flex-col w-1/2 h-full bg-base-200 rounded-md overflow-y-scroll overflow-x-hidden p-4 gap-1">
          <label class="input w-full mb-2 sticky top-0">
            <Search :size="16" class="text-base-content/50"/>
            <input v-model="search" type="text" :placeholder="$t('accounts.open_app_as.search_tip')" />
            <button v-show="search !== ''" @click="search = ''" class="btn btn-xs btn-square btn-ghost">
              <X :size="14" />
            </button>
          </label>
          <div v-if="appList.length == 0" class="w-full h-full flex flex-col items-center justify-center gap-2 opacity-50">
            <Ban :size="80" />
            <p>{{ $t('accounts.open_app_as.search_not_found') }}</p>
          </div>
          <button
            v-for="(a,i) in appList"
            :key="i"
            @click="selectApp(a)"
            :class="selectedApp?.name === a.name && selectedApp?.comment === a.comment && 'btn-accent'"
            class="btn w-full h-14 flex flex-row justify-start p-4 gap-2 text-start font-normal"
          >
            <img v-if="a.icon && a.icon.startsWith('data:image/svg+xml')" class="w-8 h-8" :src="a.icon" />
            <img v-if="a.icon && !a.icon.startsWith('data:image/svg+xml')" class="w-8 h-8" :src="convertFileSrc(a.icon)" />
            <div v-if="!a.icon" class="w-8 h-8 rounded-md flex items-center justify-center bg-base-300">
              <AppWindowMac :size="16" />
            </div>
            <div class="flex flex-col items-start justify-center">
              <p>{{ a.name }}</p>
              <p class="text-base-content/50 text-xs line-clamp-1">{{ a.comment }}</p>
            </div>
          </button>
        </div>

        <div class="flex flex-col w-1/2 h-full items-center justify-between gap-2 overflow-y-scroll overflow-x-hidden" v-if="selectedApp">
          <div class="flex flex-col w-full h-full items-center justify-center gap-2">
            <img
              v-if="selectedApp.icon"
              :src="selectedApp.icon.startsWith('data:image/svg+xml')
              ? selectedApp.icon
              : convertFileSrc(selectedApp.icon)"
              class="w-24 h-24"
            />
            <div v-if="!selectedApp.icon" class="w-24 h-24 rounded-md flex items-center justify-center bg-base-300">
              <AppWindowMac :size="46" />
            </div>
            <p class="text-xl text-center font-semibold">{{ selectedApp.name }}</p>
            <p v-if="selectedApp.comment" class="text-sm text-center text-base-content/50">{{ selectedApp.comment }}</p>
          </div>
          <div class="flex flex-col w-full h-full px-4 justify-end">
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ $t("accounts.open_app_as.env_var") }}</legend>
              <input v-model="envVars" type="text" class="input" />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ $t("accounts.open_app_as.command") }}</legend>
              <input v-model="command" type="text" class="input" />
            </fieldset>
            <fieldset class="fieldset">
              <legend class="fieldset-legend">{{ $t("accounts.open_app_as.params") }}</legend>
              <input v-model="args" type="text" class="input" />
            </fieldset>
          </div>
        </div>
      </div>
      <div class="modal-action sticky bottom-0">
        <button class="btn" @click="closeModal()">
          {{$t("ui.cancel")}}
        </button>
        <button class="btn btn-accent" :disabled="command == ''" @click="openApp()">
          {{$t("ui.open")}}
        </button>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { useAppStore } from '~/store/app';
import { Search, Ban, X } from 'lucide-vue-next';
import { useAccountsStore } from '~/store/accounts';
import { convertFileSrc } from '@tauri-apps/api/core';
import { AppWindowMac } from 'lucide-vue-next'
import { invoke } from '@tauri-apps/api/core';
import type { ApplicationData } from '~/types/app';
import { useI18n } from 'vue-i18n';
import { ref, computed } from "vue"

const {t} = useI18n()
const app = useAppStore()
const accounts = useAccountsStore()

const customButton:ApplicationData = {
  name: t("accounts.open_app_as.exec_command"),
  comment: t("accounts.open_app_as.exec_command_tip"),
}
const search = ref<string>("")
const envVars = ref<string>("")
const command = ref<string>("")
const args = ref<string>("")
const selectedApp = ref<ApplicationData>(customButton)

const appList = computed(()=>{
  if (!app.applications) return []
  if (search.value == "") return [customButton, ...app.applications]
  return app.applications.filter(a =>
    a.name.toLowerCase().includes(search.value.toLowerCase()))
})

const selectApp = (application: ApplicationData) => {
  selectedApp.value = application
  envVars.value = application.environment_variables || ""
  command.value = application.executable || ""
  args.value = application.arguments || ""
}

const closeModal = () => {
  const modal = document.getElementById("accounts_openas") as HTMLDialogElement
  modal.close()
  search.value = ""
  selectedApp.value = customButton
}

const openApp = () => {
  try{
    if (!accounts.selectedAccount) {
      new Error("Couldn't detect the user")
      return
    }
    const fullCommand = `${envVars.value} ${command.value} ${args.value}`
    const user = accounts.accounts![accounts.selectedAccount].uid.toString()
    invoke("execute_application", {command:fullCommand, user})
  } catch(e) {
      console.log(e)
  } finally {
      closeModal()
  }
}
</script>