<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <h1>🚀 Nexus Sprint - Match com Vagas</h1>
        <p class="page-subtitle">
          Cole a descrição de uma vaga e descubra o quanto você está próximo. A IA criará um roadmap personalizado para preencher as lacunas.
        </p>
      </div>
      <router-link to="/admin/nexus-sprint/list" class="btn btn-info">Ver Análises Salvas</router-link>
    </div>

    <div class="card">
      <JobInput
        v-model="jobData"
        :loading="loading"
        @analyze="handleAnalyze"
      />

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- O resultado imediato foi removido para simplificar o fluxo. -->
      <!-- O usuário será redirecionado para a página de detalhes da análise. -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import JobInput from './components/JobInput.vue';
import { nexusSprintService, type NexusSprintResult } from '@/services/nexus-sprint.service';
import { usePortfoliosStore } from '@/stores/portfolios';
import { useUiStore } from '@/stores/ui';

const portfoliosStore = usePortfoliosStore();
const uiStore = useUiStore();
const router = useRouter();

const jobData = ref({ title: '', description: '' });
const loading = ref(false);
const error = ref<string | null>(null);

const handleAnalyze = async () => {
  if (!jobData.value.description.trim()) {
    uiStore.triggerToast({ message: 'A descrição da vaga não pode estar vazia.', type: 'error' });
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const analysisResult = await nexusSprintService.analyzeJobAndCreateSprint({
      jobDescription: jobData.value.description,
      jobTitle: jobData.value.title || 'Vaga analisada',
    });

    // Salva a análise completa
    const newAnalysisId = await portfoliosStore.saveNexusSprint(analysisResult);

    uiStore.triggerToast({ message: 'Análise concluída e salva!', type: 'success' });
    
    // Redireciona para a página de detalhes da nova análise
    router.push(`/admin/nexus-sprint/${newAnalysisId}`);

  } catch (err: any) {
    error.value = err.message || 'Erro ao analisar vaga.';
    uiStore.triggerToast({ message: error.value, type: 'error' });
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #fee2e2;
  color: #b91c1c;
  border-radius: 8px;
}
.btn-info {
    background-color: #17a2b8;
    color: white;
}
</style>
