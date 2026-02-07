import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import './assets/main.css'

const app = createApp(App)

store.dispatch('fetchPortfolioData');
app.use(store)
app.use(router)
app.mount('#app')