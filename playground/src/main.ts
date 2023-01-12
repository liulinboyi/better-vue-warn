import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import betterVueWarn from 'better-vue-warn'

const app = createApp(App)
app.use(betterVueWarn).mount('#app')
