import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useAuthStore }       from '@/stores/auth';
import { usePortfoliosStore } from '@/stores/portfolios';
import { useUiStore }         from '@/stores/ui';
import { useUserStore }       from '@/stores/user';
import { sdk } from './sdk';

import '@fortawesome/fontawesome-free/css/all.css';
import './assets/main.css';
import './assets/themes.css';
import './assets/admin/styles.css';

let app: any = null;

onAuthStateChanged(getAuth(), async (user) => {
  if (!app) {
    app = createApp(App);
    app.use(createPinia());
    app.use(router);
    app.provide('sdk', sdk);
    app.mount('#app');
  }

  const authStore       = useAuthStore();
  const portfoliosStore = usePortfoliosStore();
  const userStore       = useUserStore();

  if (user) {
    authStore.setUser(user);
    
    // Inicia listener de dados do usuário (créditos, indicações)
    userStore.listenToUserData();
    // Verifica se tem bônus mensal ou de boas-vindas para receber
    userStore.checkMonthlyBonus();
    
    // Verifica se entrou via link de indicação e registra se necessário
    await sdk.referral.checkUrlAndRegister(user.uid, user.displayName || 'Usuário');
    
    await portfoliosStore.initializeUserPortfolio();
  } else {
    authStore.clearUser();
    userStore.stopListening();
    portfoliosStore.activePortfolioId = null;
  }
});
