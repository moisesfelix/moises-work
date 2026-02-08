import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import '@fortawesome/fontawesome-free/css/all.css';
import './assets/main.css'
import './assets/themes.css'

const app = createApp(App)

store.dispatch('fetchPortfolioData');
app.use(store)
app.use(router)
app.mount('#app')