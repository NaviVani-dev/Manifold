<template>
  <dialog id="accounts_edituser" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-2">{{$t("accounts.edit.title")}}</h3>

      <label class="input validator w-full">
        <UserRound class="opacity-50" :size="16" />
        <input v-model="newUsername" type="text" required pattern="[a-zA-Z0-9_-]+" class="grow" :placeholder="$t('accounts.create.username')" />
      </label>
      <p class="validator-hint mt-1 mb-1">{{ $t("accounts.create.username_error") }}</p>

      <div class="modal-action mt-0">
        <button class="btn" @click="closeModal">
          {{$t("ui.cancel")}}
        </button>
        <button class="btn btn-accent" @click="editUsername">
          {{$t("ui.edit")}}
        </button>
      </div>

    </div>
  </dialog>
</template>

<script setup lang="ts">
import { UserRound } from 'lucide-vue-next';
import { useAccountsStore } from '~/store/accounts';
import { invoke } from '@tauri-apps/api/core';
import { ref } from 'vue';

const accounts = useAccountsStore()
const newUsername = ref<string>("")

function validUsername() {
  return /^[a-zA-Z0-9_-]+$/.test(newUsername.value)
}

const closeModal = () => {
  const modal = document.getElementById("accounts_edituser") as HTMLDialogElement
  modal.close()
  newUsername.value = ""
}

const editUsername = async () => {
  const acc = accounts.selectedAccount && accounts.accounts?.[accounts.selectedAccount]
  if (!validUsername()) {
    new Error("Username is not valid")
    return;
  }
  if (!acc) {
    new Error("Couldn't figure out which user to edit")
    return
  }
  try {
    await invoke<string>("edit_user", { newUsername: newUsername.value, oldUsername: acc.username });
  } catch (err) {
    console.error(err);
  } finally {
    closeModal();
    accounts.refetchAccounts()
  }
}
</script>