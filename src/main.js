import { createApp } from 'vue'
import '@fontsource-variable/noto-sans'
import App from './App.vue'
import router from './router'
import './style.css'

createApp(App).use(router).mount('#app')
