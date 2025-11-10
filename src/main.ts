import './assets/01-reset.css'
import './assets/02-before-theme.css'

import './assets/03-theme-default.css'
// import './assets/03-theme-paper-light.css'
// import './assets/03-theme-ocean.css'
// import './assets/03-theme-dracula.css'
// import './assets/03-theme-nord-frost.css'
// import './assets/03-theme-github-dark.css'
// import './assets/03-theme-sakura-night.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router.ts'

const app = createApp(App)

app.use(router)

app.mount('#app')
