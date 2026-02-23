<template>
  <div class="page-container">
    <div class="page-header">
      <h1>🚀 Nexus Sprint - Match com Vagas</h1>
      <p class="page-subtitle">
        Cole a descrição de uma vaga e descubra o quanto você está próximo. A IA criará um roadmap personalizado para preencher as lacunas.
      </p>
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

      <div v-if="result" class="result-container">
        <hr class="divider" />

        <h2>Resultado da Análise</h2>

        <GapAnalysis :analysis="result.gapAnalysis" />

        <div v-if="result.roadmap" class="roadmap-preview">
          <h3>📚 Roadmap de Estudos Gerado</h3>
          <p><strong>Objetivo:</strong> {{ result.roadmap.title }}</p>
          <p>{{ result.roadmap.overview }}</p>

          <div class="steps-preview">
            <div v-for="(step, idx) in result.roadmap.steps.slice(0, 3)" :key="step.id" class="step-item">
              <span class="step-number">{{ idx + 1 }}</span>
              <div class="step-info">
                <h4>{{ step.title }}</h4>
                <p>{{ step.description }}</p>
              </div>
            </div>
            <div v-if="result.roadmap.steps.length > 3" class="more-steps">
              + {{ result.roadmap.steps.length - 3 }} etapas adicionais...
            </div>
          </div>

          <div class="actions">
            <button @click="saveRoadmap" class="btn btn-success" :disabled="saving">
              <span v-if="saving" class="spinner"></span>
              {{ saving ? 'Salvando...' : 'Salvar como meu Roadmap' }}
            </button>
            <button @click="reset" class="btn btn-outline">Nova Análise</button>
          </div>
        </div>

        <div v-else-if="result.gapAnalysis.allGapSkills.length === 0" class="no-gap-message">
          <p>Você já está 100% compatível! Nenhum roadmap necessário.</p>
          <button @click="reset" class="btn btn-outline">Analisar outra vaga</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import JobInput from './components/JobInput.vue';
import GapAnalysis from './components/GapAnalysis.vue';
import { nexusSprintService, type NexusSprintResult } from '@/services/nexus-sprint.service';
import { usePortfoliosStore } from '@/stores/portfolios';
import { useUiStore } from '@/stores/ui';
import { useRouter } from 'vue-router';

const portfoliosStore = usePortfoliosStore();
const uiStore = useUiStore();
const router = useRouter();

const jobData = ref({ title: '', description: '' });
const loading = ref(false);
const saving = ref(false);
const error = ref<string | null>(null);
const result = ref<NexusSprintResult | null>(null);

const handleAnalyze = async () => {
  if (!jobData.value.description.trim()) return;

  loading.value = true;
  error.value = null;
  result.value = null;

  try {
    const res = await nexusSprintService.analyzeJobAndCreateSprint({
      jobDescription: jobData.value.description,
      jobTitle: jobData.value.title || 'Vaga analisada',
    });
    result.value = res;
  } catch (err: any) {
    error.value = err.message || 'Erro ao analisar vaga.';
  } finally {
    loading.value = false;
  }
};

const saveRoadmap = async () => {
  if (!result.value?.roadmap) return;

  saving.value = true;
  try {
    // Adiciona o roadmap à lista de roadmaps do usuário
    const roadmap = result.value.roadmap;
    // Podemos marcar que veio de um sprint
    roadmap.metadata = {
      type: 'sprint',
      jobTitle: result.value.jobTitle,
      jobDescription: result.value.jobDescription,
      extractedSkills: result.value.extractedSkills,
    };
    await portfoliosStore.saveRoadmap(roadmap);
    uiStore.triggerToast({ message: 'Roadmap salvo com sucesso!', type: 'success' });
    router.push('/admin/roadmap'); // Redireciona para a página de roadmap
  } catch (err: any) {
    uiStore.triggerToast({ message: 'Erro ao salvar roadmap: ' + err.message, type: 'error' });
  } finally {
    saving.value = false;
  }
};

const reset = () => {
  jobData.value = { title: '', description: '' };
  result.value = null;
  error.value = null;
};
</script>

<style scoped>
.result-container {
  margin-top: 2rem;
}
.divider {
  margin: 2rem 0;
  border: none;
  border-top: 1px solid #eee;
}
.roadmap-preview {
  margin-top: 2rem;
  background: #f9fafb;
  border-radius: 12px;
  padding: 1.5rem;
}
.steps-preview {
  margin: 1.5rem 0;
}
.step-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.step-number {
  width: 30px;
  height: 30px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}
.step-info h4 {
  margin: 0 0 0.25rem;
  font-size: 1rem;
}
.step-info p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
}
.more-steps {
  text-align: center;
  color: #888;
  font-style: italic;
  padding: 0.5rem;
}
.actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}
.btn-success {
  background: #10b981;
  color: white;
}
.btn-outline {
  background: transparent;
  border: 1px solid #ddd;
  color: #333;
}
.error-message {
  margin-top: 1rem;
  padding: 1rem;
  background: #fee2e2;
  color: #b91c1c;
  border-radius: 8px;
}
</style>
