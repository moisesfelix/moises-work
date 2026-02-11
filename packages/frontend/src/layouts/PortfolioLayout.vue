<template>
  <div class="portfolio-layout">
    <div v-if="loading" class="loading-screen">
      <div class="spinner"></div>
      <p>Carregando portfólio...</p>
    </div>
    <div v-else-if="error" class="error-screen">
      <h1>Ops!</h1>
      <p>{{ error }}</p>
      <router-link to="/" class="btn">Voltar ao Início</router-link>
    </div>
    <div v-else>
      <!-- Reuse UnifiedLayout structure here but for public portfolio viewing -->
      <div class="app-container">
        <TheHeader />
        <div class="layout-container">
          <main class="main-content">
             <router-view :slug="slug" />
          </main>
        </div>
        <TheFooter />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import TheHeader from '@/components/TheHeader.vue';
import TheFooter from '@/components/TheFooter.vue';

const store = useStore();
const route = useRoute();

const slug = computed(() => route.params.slug as string);
const loading = computed(() => store.state.ui.isLoading);
const error = computed(() => store.state.ui.error);

const loadPortfolio = async () => {
  if (slug.value) {
    // If slug is present, fetch data.
    // If we are navigating between pages of SAME portfolio, check activePortfolioId/slug mismatch?
    // fetchPortfolioData handles slug resolution.
    console.log("Loading portfolio for slug:", slug.value);
    await store.dispatch('portfolios/fetchPortfolioData', slug.value);
  }
};

onMounted(() => {
    // Force immediate load
    loadPortfolio();
});

watch(slug, loadPortfolio);
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.layout-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.main-content {
  flex: 1;
  overflow-y: auto;
  padding-top: var(--header-height);
}
.loading-screen, .error-screen {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.error-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
}
.loading-screen {
    justify-content: center;
    align-items: center;
    text-align: center;
}
.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: var(--primary);
  animation: spin 1s ease infinite;
  margin-bottom: 1rem;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>