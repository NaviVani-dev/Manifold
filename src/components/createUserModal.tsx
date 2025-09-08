import { Icon } from "@iconify-icon/react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useUserStore } from "~/store/users";
import type { UserData } from "~/types/userTypes";

export function CreateUserModal() {
  const [username, setUsername] = useState<string>("");
  const [folder, setFolder] = useState<string>("");
  const { t } = useTranslation();
  const { setUsers } = useUserStore();

  useEffect(() => {
    async function init() {
      const user = await invoke<string>("get_username");
      setFolder(`/home/${user}/.manifold/users`);
    }
    init();
  }, []);

  async function closeModal() {
    (
      document.getElementById("create_user_modal") as HTMLDialogElement
    )?.close();
    const user = await invoke<string>("get_username");
    setFolder(`/home/${user}/.manifold/users`);
    setUsername("");
  }

  async function selectUserFolder() {
    const selected = await open({
      directory: true,
      multiple: false,
    });
    if (typeof selected === "string") {
      setFolder(selected);
    }
  }

  function validateUsername(value: string) {
    return /^[a-zA-Z0-9_-]*$/.test(value);
  }

  function resetUsersList() {
    setUsers(undefined);
    invoke<UserData[]>("list_users").then(setUsers);
  }

  async function createUser() {
    if (!username || !folder) {
      alert("Username and folder are required");
      return;
    }
    try {
      const folderCheck = folder.endsWith("/") ? folder.slice(0, -1) : folder;
      await invoke<string>("create_user", {
        payload: {
          username,
          folder: folderCheck + "/" + username,
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      resetUsersList();
      closeModal();
    }
  }

  return (
    <dialog id="create_user_modal" className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{t("accounts.create.new")}</h3>
        <p className="text-xs text-base-content/50">
          {t("accounts.create.no_passwd")}
        </p>

        <div className="flex flex-col gap-4 mt-4">
          <label className="input w-full">
            <Icon icon="uil:user" className="opacity-50" />
            <input
              type="text"
              className="grow"
              placeholder={t("accounts.create.username")}
              value={username}
              onChange={(e) => {
                if (validateUsername(e.target.value)) {
                  setUsername(e.target.value);
                }
              }}
            />
          </label>

          <div className="join">
            <label className="input w-full join-item">
              <Icon icon="ic:outline-folder" className="opacity-50" />
              <input
                type="text"
                className="grow"
                placeholder={t("accounts.create.folder")}
                value={folder}
                onChange={(e) => setFolder(e.target.value)}
              />
            </label>
            <button
              onClick={selectUserFolder}
              className="btn btn-neutral join-item"
            >
              {t("ui.select")}
            </button>
          </div>
          <p className="text-xs text-base-content/50">
            {t("accounts.create.folder_tip", {
              folder:
                (folder.endsWith("/") ? folder.slice(0, -1) : folder) +
                "/" +
                (username ? username : "..."),
            })}
          </p>
        </div>

        <div className="modal-action">
          <button className="btn" onClick={closeModal}>
            {t("ui.cancel")}
          </button>
          <button
            disabled={!username || !folder}
            className="btn btn-accent"
            onClick={createUser}
          >
            {t("ui.create")}
          </button>
        </div>
      </div>
    </dialog>
  );
}
