import React from "react";
import ReactDOM from "react-dom/client";
import Main from "~/app/index";
import "~/main.css";
import "~/i18n";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
