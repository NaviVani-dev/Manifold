import { defineStore } from "pinia";
import { ref, Ref } from "vue";
import type { AccountData } from "~/types/accounts";
import { invoke } from "@tauri-apps/api/core";
import { fetchSteamProfile } from "~/lib/steamapi";

export const useAccountsStore = defineStore("accounts", () => {
  const accounts: Ref<AccountData[] | undefined> = ref();
  const selectedAccount: Ref<number | undefined> = ref(); // 4 the user modals to know which user was selected
  const fetchStatus: Ref<"nothing" | "steam" | "done"> = ref("nothing"); // fetching steam can take a while, incase it takes too lonk we just show sm skeletons

  async function fetchAccounts() {
    try {
      const accs = await invoke<AccountData[]>("fetch_accounts");
      if (accs && accs.length > 0) {
        accounts.value = accs;
        fetchStatus.value = "steam";
        for (const userData of accs) {
          if (userData.steam && userData.steam.length > 0) {
            const firstSteamData = userData.steam[0];
            const steamProfile = await fetchSteamProfile(firstSteamData.id);
            Object.assign(firstSteamData, {
              id: firstSteamData.id,
              username: firstSteamData.username,
              ...steamProfile,
            });
          }
        }
        accounts.value = accs;
        fetchStatus.value = "done";
      }
    } catch (e) {
      console.log(e);
    }
  }

  async function refetchAccounts() {
    accounts.value = undefined;
    selectedAccount.value = undefined;
    fetchStatus.value = "nothing";
    fetchAccounts();
  }

  return {
    accounts,
    selectedAccount,
    fetchStatus,
    fetchAccounts,
    refetchAccounts,
  };
});
