import { Icon } from "@iconify-icon/react";
import { useTranslation } from "react-i18next";
import { ScreensData } from "~/types/mainTypes";
import { useMainStore } from "~/store/main";

export function Sidebar() {
  const { screen, setScreen } = useMainStore();
  const { t } = useTranslation();
  const screensTop: ScreensData[] = [
    {
      name: t("sidebar.home"),
      screen: "home",
      icon: "bx:home",
    },
    {
      name: t("sidebar.screens"),
      screen: "screens",
      icon: "mi:window",
    },
    {
      name: t("sidebar.devices"),
      screen: "devices",
      icon: "lucide:gamepad",
    },
    {
      name: t("sidebar.accounts"),
      screen: "accounts",
      icon: "uil:user",
    },
  ];

  const screensBottom: ScreensData[] = [
    {
      name: t("sidebar.settings"),
      screen: "settings",
      icon: "solar:settings-outline",
    },
  ];
  return (
    <div className="h-full w-16 bg-base-200 flex flex-col items-center justify-between py-2 border-neutral border-r-2">
      <div className="flex flex-col gap-2">
        {screensTop.map((data) => (
          <div className="tooltip tooltip-right" data-tip={data.name}>
            <button
              onClick={() => setScreen(data.screen)}
              className={`btn btn-square text-2xl ${
                screen == data.screen && "btn-accent"
              }`}
            >
              <Icon className="" icon={data.icon} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex flex-col-reverse gap-2">
        {screensBottom.map((data) => (
          <div className="tooltip tooltip-right" data-tip={data.name}>
            <button
              onClick={() => setScreen(data.screen)}
              className={`btn btn-square text-2xl ${
                screen == data.screen && "btn-accent"
              }`}
            >
              <Icon className="" icon={data.icon} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
