import './assets/style/main.css'
import './assets/icons/iconfont.js'
import { createApp } from 'vue'
import App from './App.vue'
import 'virtual:uno.css'
import { createPinia } from 'pinia'
import { Core } from '../../manager'
import { LoggerRenderer } from '../../manager/plugins/logger/LoggerRenderer'
import router from './router'

// function initPluginSys() {
//   const core = new Core();
//   core.use(new LoggerRenderer())
//   core.run()
// }
const pinia = createPinia()
createApp(App).use(pinia).use(router).mount('#app')
