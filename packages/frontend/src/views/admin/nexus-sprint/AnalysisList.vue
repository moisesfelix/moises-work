<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Análises de Vagas</h1>
      <p class="page-subtitle">Veja as análises de compatibilidade de vagas salvas.</p>
    </div>
    <div class="card">
      <div v-if="loading" class="loading-state">
        <div class="spinner-large"></div>
        <p>Carregando análises...</p>
      </div>

      <div v-else-if="analyses.length > 0" class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th width="30%">Vaga</th>
              <th width="15%">Compatibilidade</th>
              <th width="40%">Principais Gaps</th>
              <th width="15%" class="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="analysis in analyses" :key="analysis.id">
              <td class="font-medium">
                {{ analysis.jobTitle }}
                <div class="meta-mini">{{ new Date(analysis.createdAt).toLocaleDateString() }}</div>
              </td>
              <td>
                <span class="badge" :class="getCompatibilityClass(analysis.gapAnalysis.compatibility)">
                  {{ (analysis.gapAnalysis.compatibility * 100).toFixed(0) }}%
                </span>
              </td>
              <td class="text-muted">
                {{ getGapSkillsPreview(analysis.gapAnalysis) }}
              </td>
              <td class="actions-cell">
                <button @click="viewAnalysisDetails(analysis)" class="btn-icon view" title="Ver Detalhes">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state">
        <p>Nenhuma análise de vaga encontrada.</p>
        <router-link to="/admin/nexus-sprint" class="btn btn-outline">Analisar primeira vaga</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePortfoliosStore } from "@/stores/portfolios";
import { useUiStore } from "@/stores/ui";
import type { NexusSprintResult } from "@/services/nexus-sprint.service";

interface Analysis extends NexusSprintResult {
  id: string;
  createdAt: string;
}

const portfoliosStore = usePortfoliosStore();
const uiStore = useUiStore();
const router = useRouter();

const analyses = computed(() => (portfoliosStore.nexusSprints || []) as Analysis[]);
const loading = computed(() => uiStore.isLoading);

onMounted(() => {
  if (!portfoliosStore.dataLoaded) {
    portfoliosStore.fetchPortfolioData();
  }
});

const getCompatibilityClass = (compatibility: number) => {
  if (compatibility > 0.75) return 'badge-success';
  if (compatibility > 0.5) return 'badge-warning';
  return 'badge-danger';
};

const getGapSkillsPreview = (gapAnalysis: any) => {
  const allGaps = gapAnalysis.allGapSkills || [];
  if (allGaps.length === 0) return 'Nenhuma lacuna encontrada.';
  return allGaps.map((g: any) => g.skill).slice(0, 3).join(', ') + (allGaps.length > 3 ? '...' : '');
};

const viewAnalysisDetails = (analysis: Analysis) => {
  // We need to store the selected analysis to be viewed in the details page
  // A good approach is to use the store for this
  portfoliosStore.setCurrentNexusSprint(analysis);
  router.push(`/admin/nexus-sprint/${analysis.id}`);
};
</script>

<style scoped>
/* Basic styles from Articles.vue, can be centralized in a common admin CSS file */
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
  overflow: hidden;
}
.loading-state, .empty-state {
  padding: 50px;
  text-align: center;
  color: #888;
}
.spinner-large {
  width: 40px;
  height: 40px;
  border: 4px solid #eee;
  border-top-color: #5b5fab;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.table-responsive {
  width: 100%;
  overflow-x: auto;
}
.custom-table {
  width: 100%;
  border-collapse: collapse;
}
.custom-table th, .custom-table td {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}
.custom-table th {
  background-color: #f8f9fa;
  color: #555;
  font-weight: 600;
  text-align: left;
  font-size: 13px;
  text-transform: uppercase;
}
.font-medium {
  font-weight: 500;
}
.meta-mini {
  font-size: 12px;
  color: #999;
  margin-top: 3px;
}
.text-muted {
  color: #777;
  font-size: 13px;
}
.text-right { text-align: right; }
.actions-cell { text-align: right; white-space: nowrap; }

.badge {
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  background-color: #ccc;
}
.badge-success { background-color: #28a745; }
.badge-warning { background-color: #ffc107; color: #333; }
.badge-danger { background-color: #dc3545; }

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  display: inline-flex;
}
.btn-outline {
  background-color: transparent;
  color: #5b5fab;
  border: 1px solid #5b5fab;
}
.btn-icon {
  background: none;
  padding: 6px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  margin-left: 5px;
}
.btn-icon.view { color: #17a2b8; background-color: #e0f7fa; }
</style>
