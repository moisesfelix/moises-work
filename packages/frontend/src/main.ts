import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

import '@fortawesome/fontawesome-free/css/all.css';
import './assets/main.css'
import './assets/themes.css'
import './assets/admin/styles.css' // Admin styles
// import './assets/admin/main.css' // Admin main styles (check for conflicts)

let app: any;

const auth = getAuth();
onAuthStateChanged(auth, (user) => {
  if (user) {
    store.commit('auth/setUser', user);
  } else {
    store.commit('auth/clearUser');
  }

  if (!app) {
    app = createApp(App)
    store.dispatch('portfolios/fetchPortfolioData');
    app.use(store)
    app.use(router)
    app.mount('#app')
  }
});