import { Sidebar } from "~/components/sidebar";
import { useMainStore } from "~/store/main";
import { Home } from "~/app/home";

function Main() {
  const { screen } = useMainStore();
  return (
    <main className="w-screen h-screen overflow-hidden flex flex-row">
      <Sidebar />
      {screen == "home" && <Home />}
    </main>
  );
}

export default Main;
