import "./assets/style/main.css";
import "./assets/icons/iconfont.js";
import { createApp } from "vue";
import App from "./App.vue";
import "virtual:uno.css";
import { createPinia } from "pinia";
import router from "./router";
import loggerPlugin from "./plugins/logger";
import naive from "naive-ui";

const app = createApp(App);
const pinia = createPinia();

app.use(naive);
app.use(pinia);
app.use(router);
app.use(loggerPlugin as any);
app.mount("#app");
