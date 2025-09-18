<template>
  <dialog id="accounts_createuser" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">{{ $t("accounts.create.title") }}</h3>
      <p class="text-xs text-base-content/50">
        {{ $t("accounts.create.no_passwd") }}
      </p>
      <div class="flex flex-col mt-4">
        <label class="input validator w-full">
          <UserRound class="opacity-50" :size="16" />
          <input v-model="username" type="text" required pattern="[a-zA-Z0-9_-]+" class="grow" :placeholder="$t('accounts.create.username')" />
        </label>
        <p class="validator-hint mt-1 mb-1">{{ $t("accounts.create.username_error") }}</p>

        <div class="join">
          <label class="input validator w-full join-item">
            <Folder class="opacity-50" :size="16" />
            <input v-model="folder" type="text" required class="grow" :placeholder="$t('accounts.create.folder')" />
          </label>
          <button class="btn btn-neutral join-item" @click="selectFolder()">
            {{$t("ui.select")}}
          </button>
        </div>
        <p class="text-xs text-base-content/50">
          {{ $t("accounts.create.folder_tip", {folder: folder + "/" + (username || "...")}) }}
        </p>
      </div>

      <div class="modal-action">
          <button class="btn" @click="closeModal()">
            {{$t("ui.cancel")}}
          </button>
          <button class="btn btn-accent" :disabled="!validUsername() || folder == ''" @click="createUser()">
            {{$t("ui.create")}}
          </button>
        </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { UserRound, Folder } from 'lucide-vue-next';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import { appLocalDataDir } from '@tauri-apps/api/path';
import { useAccountsStore } from '~/store/accounts';
import * as path from "@tauri-apps/api/path";
import {onMounted, ref} from "vue"

const accounts = useAccountsStore()
const username = ref<string>("")
const folder = ref<string>("")

const defaultFolder = async () => {
  const appLocalData = await appLocalDataDir();
  const defaultFolder = await path.join(appLocalData, "accounts");
  folder.value = defaultFolder;
}

onMounted(()=> {
  defaultFolder()
})

function validUsername() {
  return /^[a-zA-Z0-9_-]+$/.test(username.value)
}

const selectFolder = async () => {
  const f = await open({
    directory: true,
    multiple: false,
    defaultPath: folder.value
  })
  if (typeof f == "string") folder.value = f
}

const closeModal = () => {
  const modal = document.getElementById("accounts_createuser") as HTMLDialogElement
  modal.close()
  username.value = ""
  defaultFolder()
}

const createUser = async () => {
  if (!validUsername() || !folder) {
    return;
  }
  try {
    const folderCheck = (folder.value.endsWith("/") ? folder.value.slice(0, -1) : folder.value)+ "/" + username.value
    await invoke<string>("create_user", {
        username: username.value,
        folder: folderCheck,
      },
    );
  } catch (err) {
    console.error(err);
  } finally {
    closeModal();
    accounts.refetchAccounts()
  }
}
</script>