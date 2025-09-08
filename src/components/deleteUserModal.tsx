import { Icon } from "@iconify-icon/react";
import { invoke } from "@tauri-apps/api/core";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useUserStore } from "~/store/users";
import type { UserData } from "~/types/userTypes";

export function DeleteUserModal({ data }: { data: UserData }) {
  const [deleteFolder, setDeleteFolder] = useState<boolean>(true);
  const { t } = useTranslation();
  const { setUsers } = useUserStore();

  async function closeModal() {
    (
      document.getElementById("delete_user_modal") as HTMLDialogElement
    )?.close();
  }

  function resetUsersList() {
    setUsers(undefined);
    invoke<UserData[]>("list_users").then(setUsers);
  }

  async function deleteUser() {
    closeModal();
    resetUsersList();
  }

  return (
    <dialog id="delete_user_modal" className="modal">
      <div className="modal-box w-82">
        <h3 className="font-bold text-lg">{t("accounts.delete.title")}</h3>
        <p className="text-xs text-base-content/50">
          {t("accounts.delete.description")}
        </p>

        <div className="flex flex-row items-center gap-2 mt-4 text-sm">
          <p>{t("accounts.delete.delete_folder")}</p>
          <input
            type="checkbox"
            defaultChecked
            className="toggle toggle-xs toggle-accent"
            onChange={(e) => setDeleteFolder(e.target.checked)}
          />
        </div>
        <div className="modal-action">
          <button className="btn" onClick={closeModal}>
            {t("ui.cancel")}
          </button>
          <button className="btn btn-error" onClick={deleteUser}>
            {t("ui.delete")}
          </button>
        </div>
      </div>
    </dialog>
  );
}
