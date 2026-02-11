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
onAuthStateChanged(auth, async (user) => {
  if (user) {
    store.commit('auth/setUser', user);
    // Initialize/Load user portfolio data
    await store.dispatch('portfolios/initializeUserPortfolio');
  } else {
    store.commit('auth/clearUser');
    // If no user, maybe load a default or public portfolio?
    // For now, let's just clear the active portfolio
    store.commit('portfolios/setActivePortfolioId', null);
  }

  if (!app) {
    app = createApp(App)
    // Only fetch if we haven't already initialized via auth
    // But initializeUserPortfolio handles setting data.
    // If not logged in, we might want to fetch public data if on a public route?
    // The components will handle fetching specific data if needed, or we can fetch a default here.
    // For now, removing the generic fetchPortfolioData call on startup to avoid race conditions or fetching wrong data.
    
    app.use(store)
    app.use(router)
    app.mount('#app')
  }
});