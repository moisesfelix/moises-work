<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">Visão geral e estatísticas do seu portfólio.</p>
    </div>

    <!-- Stats Summary -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">{{ analytics.total || 0 }}</div>
        <div class="stat-label">Total Views</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ analytics.articles || 0 }}</div>
        <div class="stat-label">Articles</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ analytics.tutorials || 0 }}</div>
        <div class="stat-label">Tutorials</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">{{ analytics.human || 0 }}</div>
        <div class="stat-label">Human Visitors</div>
      </div>
    </div>

    <div class="charts-grid">
      <!-- Top Content -->
      <div class="card">
        <div class="card-header">
          <h3>Top Conteúdo</h3>
        </div>
        <div class="card-content">
          <ul class="ranking-list" v-if="topContent.length">
            <li v-for="(item, index) in topContent" :key="index" class="ranking-item">
              <span class="rank">{{ index + 1 }}</span>
              <div class="rank-info">
                <span class="rank-title">{{ item.slug }}</span>
                <span class="rank-type">{{ item.type }}</span>
              </div>
              <span class="rank-count">{{ item.count }} views</span>
            </li>
          </ul>
          <p v-else class="empty-state">Sem dados disponíveis.</p>
        </div>
      </div>

      <!-- Referrers -->
      <div class="card">
        <div class="card-header">
          <h3>Origem do Tráfego</h3>
        </div>
        <div class="card-content">
           <ul class="ranking-list" v-if="referrers.length">
            <li v-for="(item, index) in referrers" :key="index" class="ranking-item">
              <div class="rank-info">
                <span class="rank-title">{{ item.source }}</span>
              </div>
              <span class="rank-count">{{ item.count }}</span>
            </li>
          </ul>
           <p v-else class="empty-state">Sem dados disponíveis.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted, watch } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'Dashboard',
  setup() {
    const store = useStore();
    const portfolioId = computed(() => store.state.portfolios.activePortfolioId); 
    
    // Conectar ao novo módulo Vuex
    const analyticsData = computed(() => store.state.analytics.data);
    const loading = computed(() => store.state.analytics.loading);
    
    const analytics = computed(() => analyticsData.value?.summary || {
      total: 0,
      articles: 0,
      tutorials: 0,
      human: 0
    });
    
    const topContent = computed(() => analyticsData.value?.topContent || []);
    const referrers = computed(() => analyticsData.value?.referrers || []);

    const fetchAnalytics = () => {
      if (portfolioId.value) {
        store.dispatch('analytics/fetchAnalytics');
      }
    };

    onMounted(() => {
       if (portfolioId.value) {
         fetchAnalytics();
       }
    });

    watch(portfolioId, (newId) => {
      if (newId) fetchAnalytics();
    });

    return {
      portfolioId,
      analytics,
      topContent,
      referrers,
      loading
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
  margin-bottom: 5px;
}
.page-subtitle { 
  color: #6c757d; 
  font-size: 14px; 
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}
.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  text-align: center;
}
.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 5px;
}
.stat-label {
  color: #6c757d;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  overflow: hidden;
}
.card-header {
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
}
.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}
.card-content { 
  padding: 0; 
}

/* Ranking List */
.ranking-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.ranking-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #f5f5f5;
}
.ranking-item:last-child {
  border-bottom: none;
}
.rank {
  width: 24px;
  height: 24px;
  background: #e9ecef;
  color: #495057;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  margin-right: 15px;
}
.rank-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.rank-title {
  font-size: 14px;
  font-weight: 500;
  color: #343a40;
}
.rank-type {
  font-size: 11px;
  color: #adb5bd;
  text-transform: uppercase;
}
.rank-count {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
}
.empty-state {
  padding: 30px;
  text-align: center;
  color: #adb5bd;
  font-size: 14px;
}
</style>