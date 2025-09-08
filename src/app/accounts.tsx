import { Icon } from "@iconify-icon/react";
import { invoke } from "@tauri-apps/api/core";
import { useEffect } from "react";
import type { UserData } from "~/types/userTypes";
import { useUserStore } from "~/store/users";
import { useTranslation } from "react-i18next";
import { UserEntry } from "~/components/userAccount";
import { CreateUserModal } from "~/components/createUserModal";

export function Accounts() {
  const { t } = useTranslation();
  const { users, setUsers } = useUserStore();

  function fetchUsers() {
    if (!users) invoke<UserData[]>("list_users").then(setUsers);
  }

  function resetUsers() {
    setUsers(undefined);
    invoke<UserData[]>("list_users").then(setUsers);
  }
  useEffect(() => {
    fetchUsers();
  }, []);
  return (
    <div className="flex flex-col w-full h-full p-4 gap-4">
      <CreateUserModal />
      <div className="flex flex-row items-center justify-between w-full min-h-12 gap-2">
        <div className="flex flex-row items-center justify-start gap-2">
          <p className="text-base-content text-2xl">{t("accounts.title")}</p>
          <div
            className="tooltip tooltip-bottom"
            data-tip={t("accounts.tooltip")}
          >
            <Icon
              icon="material-symbols:info-outline-rounded"
              className="mt-2"
            />
          </div>
        </div>
        <div className="flex flex-row-reverse gap-2 items-center justify-end">
          <button
            className="btn btn-accent btn-sm"
            onClick={() =>
              (
                document.getElementById(
                  "create_user_modal"
                ) as HTMLDialogElement
              )?.showModal()
            }
          >
            <Icon
              className="text-2xl -ml-1.5 -mr-0.5"
              icon="material-symbols:add-rounded"
            />
            {t("accounts.create.new")}
          </button>
          <div
            className="tooltip tooltip-bottom"
            data-tip={t("accounts.reload")}
          >
            <button
              onClick={() => resetUsers()}
              className="btn btn-sm btn-square"
            >
              <Icon icon="iconamoon:restart-bold" />
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {users &&
          users.map((data, index) => (
            <UserEntry data={data} index={index} key={index} />
          ))}
        {!users && (
          <>
            <div className="skeleton w-76 h-50" />
            <div className="skeleton w-76 h-50" />
            <div className="skeleton w-76 h-50" />
            <div className="skeleton w-76 h-50" />
            <div className="skeleton w-76 h-50" />
            <div className="skeleton w-76 h-50" />
          </>
        )}
      </div>
    </div>
  );
}
