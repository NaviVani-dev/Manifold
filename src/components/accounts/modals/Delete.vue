<template>
  <dialog id="accounts_deleteuser" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">{{ $t("accounts.delete.title") }}</h3>
      <p class="text-xs text-base-content/50">
        {{ $t("accounts.delete.description") }}
      </p>
      <div class="flex flex-row items-center gap-2 mt-4 text-sm">
          <input
            v-model="deleteFolder"
            type="checkbox"
            class="toggle toggle-xs toggle-accent"
          />
          <p>{{$t("accounts.delete.delete_folder")}}</p>
      </div>
      <div class="modal-action">
        <button class="btn" @click="closeModal">
          {{$t("ui.cancel")}}
        </button>
        <button class="btn btn-error" @click="deleteUser">
          {{$t("ui.delete")}}
        </button>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { useAppStore } from '~/store/app';
import { useAccountsStore } from '~/store/accounts';
import { invoke } from '@tauri-apps/api/core';
import { ref } from 'vue';

const app = useAppStore()
const accounts = useAccountsStore()
const deleteFolder = ref<boolean>(true)

const deleteUser = async () => {
  try {
    if (!accounts.selectedAccount) {
      new Error("No user detected, how?")
    }
    if (accounts.selectedAccount?.username == app.username) {
      new Error("You can't delete your own user.")
    }
    invoke("delete_user", { username: accounts.selectedAccount?.username, removeHome: deleteFolder.value })
  } catch(e) {
    console.error(e)
  } finally {
    closeModal()
    accounts.refetchAccounts()
  }
}

const closeModal = () => {
  const modal = document.getElementById("accounts_deleteuser") as HTMLDialogElement
  modal.close()
}
</script>