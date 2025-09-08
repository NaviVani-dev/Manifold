import { Sidebar } from "~/components/sidebar";
import { useMainStore } from "~/store/main";
import { Home } from "~/app/home";
import { Screens } from "~/app/screens";
import { Devices } from "~/app/devices";
import { Accounts } from "~/app/accounts";
import { Settings } from "~/app/settings";

function Main() {
  const { screen } = useMainStore();
  return (
    <main className="w-screen h-screen overflow-hidden flex flex-row">
      <Sidebar />
      {screen == "home" && <Home />}
      {screen == "screens" && <Screens />}
      {screen == "devices" && <Devices />}
      {screen == "accounts" && <Accounts />}
      {screen == "settings" && <Settings />}
    </main>
  );
}

export default Main;
