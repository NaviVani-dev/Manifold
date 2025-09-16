import { createApp } from "vue";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import App from "./App.vue";
import "~/main.css";

// locales :p
import en from "~/locale/en.json";
import es from "~/locale/es.json";

const app = createApp(App);
const pinia = createPinia();
const i18n = createI18n({
  locale: "en",
  fallbackLocale: "es",
  messages: {
    en,
    es,
  },
});

app.use(i18n);
app.use(pinia);
app.mount("#app");
