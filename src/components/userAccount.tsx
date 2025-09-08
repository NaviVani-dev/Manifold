import { Icon } from "@iconify-icon/react";
import { useEffect } from "react";
import { getUserDeco } from "~/lib/api";
import type { UserData } from "~/types/userTypes";
import { useUserStore } from "~/store/users";
import { useTranslation } from "react-i18next";
import { DeleteUserModal } from "~/components/deleteUserModal";

// this only shows the 1st steam user (if he exists)
// why bother showing every user if the intended use is 1 seam user per linux acc :p
export function UserEntry({ data, index }: { data: UserData; index: number }) {
  const { t } = useTranslation();
  const { updateUser } = useUserStore();
  useEffect(() => {
    async function getData() {
      if (data && data.steam_accs.length > 0 && !data.steam_accs[0].deco) {
        const decoData = await getUserDeco(data.steam_accs[0].id);
        if (decoData) {
          const updatedAccs = [...data.steam_accs];
          updatedAccs[0] = {
            ...updatedAccs[0],
            deco: decoData,
          };
          updateUser(index, { steam_accs: updatedAccs });
        }
      }
    }
    getData();
  }, [data]);
  const steamDeco = data.steam_accs[0]?.deco;
  const assetsUrl =
    "https://cdn.fastly.steamstatic.com/steamcommunity/public/images/";

  const profileBgVideo =
    steamDeco?.mini_profile_background?.movie_webm ||
    steamDeco?.mini_profile_background?.movie_mp4;

  //while the video profile loads or if ur profile is not animated
  const profileBgPicture = steamDeco?.mini_profile_background?.image_large;

  const profilePicture =
    (steamDeco?.animated_avatar?.image_small &&
      assetsUrl + steamDeco?.animated_avatar?.image_small) ||
    (steamDeco?.animated_avatar?.image_large &&
      assetsUrl + steamDeco?.animated_avatar?.image_large) ||
    steamDeco?.profile_picture ||
    data.pfp;

  const profileFrame =
    steamDeco?.avatar_frame?.image_small ||
    steamDeco?.avatar_frame?.image_large;
  return (
    <div className="w-76 h-50 bg-base-200 rounded-md flex flex-col gap-2 relative">
      <DeleteUserModal data={data} />
      {!profileBgPicture && !profileBgVideo && profilePicture && (
        <div className="absolute inset-0 w-full h-full opacity-30 blur-md pointer-events-none overflow-hidden rounded-md">
          <img className="w-full h-full object-cover" src={profilePicture} />
        </div>
      )}
      {steamDeco && profileBgPicture && (
        <img
          src={assetsUrl + profileBgPicture}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-md"
        />
      )}
      {steamDeco && profileBgVideo && (
        <div className="absolute inset-0 w-full h-full rounded-md overflow-hidden">
          <video autoPlay loop muted className="w-full h-full object-cover">
            <source
              src={assetsUrl + steamDeco?.mini_profile_background?.movie_webm}
              type="video/webm"
            />
            <source
              src={assetsUrl + steamDeco?.mini_profile_background?.movie_mp4}
              type="video/mp4"
            />
          </video>
        </div>
      )}
      <div className="w-24 h-24 text-6xl flex items-center justify-center relative top-4 left-4 z-[1] border-b-4 border-accent">
        {profilePicture && (
          <img src={profilePicture} className="object-cover" />
        )}
        {profileFrame && (
          <img
            src={assetsUrl + profileFrame}
            className="object-cover absolute inset-0 scale-[1.23] pointer-events-none"
          />
        )}
        {!profilePicture && (
          <div className="w-24 h-24 bg-base-300 flex items-center justify-center">
            <Icon icon="uil:user" />
          </div>
        )}
      </div>
      <UserOptions data={data} />
      <div className="relative bottom-0 p-4 pt-8 left-0 w-full h-1/2 flex flex-col justify-start bg-gradient-to-b from-[rgba(24,26,30,0.85)] from-[5%] to-[rgba(24,26,30,0.65)] to-[95%]">
        <div className="text-xl flex flex-row items-center justify-start gap-1">
          <Icon className="text-sm mt-0.5" icon="uil:user" />
          <p>{data.username}</p>
        </div>
        <div className="text-sm flex flex-row items-center justify-start gap-1">
          <Icon className="text-sm mt-0.5" icon="mdi:steam" />
          {data.steam_accs.length > 0 && <p>{data.steam_accs[0].username}</p>}
          {data.steam_accs.length == 0 && (
            <div className="tooltip" data-tip={t("accounts.no_steam_acc_tip")}>
              <p className="text-base-content/50">
                {t("accounts.no_steam_acc")}
              </p>
            </div>
          )}
          {data.steam_accs.length > 1 && (
            <div className="tooltip" data-tip={t("accounts.multiple_accs")}>
              <p className="text-sm mt-0.5 text-neutral-content/50">
                +{data.steam_accs.length - 1}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserOptions({ data }: { data: UserData }) {
  function deleteUser() {
    (
      document.getElementById("delete_user_modal") as HTMLDialogElement
    )?.showModal();
  }
  return (
    <div className="dropdown dropdown-end absolute top-4 right-4">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-square btn-sm text-lg btn-neutral"
      >
        <Icon icon="mage:dots" />
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-200 rounded-box z-1 w-52 p-2 shadow-sm"
      >
        <li>
          <a>
            <Icon icon="tabler:pencil" />
            Edit
          </a>
        </li>
        <li>
          <a onClick={deleteUser}>
            <Icon icon="tabler:trash" />
            Delete
          </a>
        </li>
      </ul>
    </div>
  );
}
