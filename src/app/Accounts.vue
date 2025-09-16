<script setup lang="ts">
import Header from "~/components/accounts/Header.vue";
import Account from "~/components/accounts/Account.vue";
import LoadingScreen from "~/components/shared/LoadingScreen.vue";
import CreateModal from "~/components/accounts/modals/Create.vue";
import DeleteModal from "~/components/accounts/modals/Delete.vue";
import EditModal from "~/components/accounts/modals/Edit.vue";
import { useAccountsStore } from "~/store/accounts";
import { onMounted } from "vue";

const accounts = useAccountsStore()

onMounted(() => {
  accounts.fetchAccounts()
});
</script>

<template>
  <div class="flex flex-col w-full h-full p-4">
    <Header />
    <div v-if="accounts.accounts" class="flex flex-wrap gap-2">
      <Account v-for="(account,index) in accounts.accounts" :key="index" :data="account" />
    </div>
    <LoadingScreen v-if="!accounts.accounts" />
    <!-- Modals -->
    <div>
      <CreateModal />
      <EditModal />
      <DeleteModal />
    </div>
  </div>
</template>
