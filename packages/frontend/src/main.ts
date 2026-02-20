import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useAuthStore }       from '@/stores/auth';
import { usePortfoliosStore } from '@/stores/portfolios';
import { useUiStore }         from '@/stores/ui';

import '@fortawesome/fontawesome-free/css/all.css';
import './assets/main.css';
import './assets/themes.css';
import './assets/admin/styles.css';

let app: ReturnType<typeof createApp> | null = null;

onAuthStateChanged(getAuth(), async (user) => {
  if (!app) {
    app = createApp(App);
    app.use(createPinia());
    app.use(router);
    app.mount('#app');
  }

  const authStore       = useAuthStore();
  const portfoliosStore = usePortfoliosStore();

  if (user) {
    authStore.setUser(user);
    await portfoliosStore.initializeUserPortfolio();
  } else {
    authStore.clearUser();
    portfoliosStore.activePortfolioId = null;
  }
});
