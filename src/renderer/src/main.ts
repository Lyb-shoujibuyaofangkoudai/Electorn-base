import './assets/style/main.css'
import './assets/icons/iconfont.js'
import { createApp } from 'vue'
import App from './App.vue'
import 'virtual:uno.css'
import { createPinia } from 'pinia'
const pinia = createPinia()

createApp(App).use(pinia).mount('#app')
