<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">Visão geral e estatísticas do seu portfólio.</p>
    </div>
    <div class="card">
      <div class="card-content">
        <p>Bem-vindo ao painel de administração, <strong>{{ userName }}</strong>!</p>
        <p v-if="portfolioId">Seu portfólio está ativo (ID: {{ portfolioId }}).</p>
        <p v-else>Inicializando seu portfólio...</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'Dashboard',
  setup() {
    const store = useStore();
    const userName = computed(() => store.state.auth.user?.displayName || 'Usuário');
    const portfolioId = computed(() => store.state.portfolios.activePortfolioId);

    return {
      userName,
      portfolioId
    }
  }
});
</script>

<style scoped>
.page-container {
  padding: 20px;
  background-color: #f5f7fb;
  min-height: 100vh;
}
.page-header {
  margin-bottom: 25px;
}
.page-title {
  font-size: 24px;
  font-weight: 600;
}
.page-subtitle { 
  color: #888; 
  font-size: 14px; 
}
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.card-content { 
  padding: 30px; 
}
</style>