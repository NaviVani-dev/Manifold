<template>
  <header class="flex flex-row items-center justify-between w-full min-h-12">
      <div class="flex flex-row items-center justify-start gap-2">
        <h3 class="text-base-content text-2xl">{{ $t("accounts.title") }}</h3>
        <div class="tooltip tooltip-bottom" :data-tip="$t('accounts.tooltip')">
          <Info :size="16" />
        </div>
      </div>
      <div class="flex flex-row-reverse items-center justify-end gap-2">
        <button class="btn btn-accent btn-sm" @click="createModal()">
          <Plus class="-ml-1.5 -mr-0.5 w-5" />
          {{$t("accounts.new_acc")}}
        </button>
        <div class="tooltip tooltip-bottom" :data-tip="$t('accounts.reload')">
          <button class="btn btn-sm btn-square" @click="accounts.refetchAccounts()">
            <RotateCcw :size="14"/>
          </button>
        </div>
      </div>
    </header>
</template>

<script setup lang="ts">
import { useAccountsStore } from "~/store/accounts";
import {Info, Plus, RotateCcw} from "lucide-vue-next"

const accounts = useAccountsStore()
const createModal = () => {const modal = document.getElementById("accounts_createuser") as HTMLDialogElement; modal.showModal()}
</script>