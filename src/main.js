import { createApp } from 'vue'
import '@fontsource-variable/noto-sans'
import '@fontsource-variable/noto-serif'
import App from './App.vue'
import router from './router'
import { loadPublishedContent } from './stores/cmsContent'
import './style.css'

loadPublishedContent()
createApp(App).use(router).mount('#app')
