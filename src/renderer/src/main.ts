import './assets/style/main.css'
import './assets/icons/iconfont.js'
import { createApp } from 'vue'
import App from './App.vue'
import 'virtual:uno.css'
import { createPinia } from 'pinia'
import router from './router'
import loggerPlugin from './plugins/logger'


const pinia = createPinia()
createApp(App)
  .use(pinia)
  .use(router)
  .use(loggerPlugin as any)
  .mount('#app')
