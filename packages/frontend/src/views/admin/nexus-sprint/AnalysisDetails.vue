<template>
  <div class="page-container" v-if="analysis">
    <div class="page-header">
      <div>
        <h1 class="page-title">Detalhes da Análise: {{ analysis.jobTitle }}</h1>
        <p class="page-subtitle">Análise de compatibilidade e plano de desenvolvimento.</p>
      </div>
      <router-link to="/admin/nexus-sprint/list" class="btn btn-secondary">Voltar para a lista</router-link>
    </div>

    <div class="analysis-layout">
      <!-- Coluna da Esquerda: Gap Analysis -->
      <div class="analysis-column">
        <div class="card">
          <div class="card-header">
            <h3>Análise de Gaps</h3>
          </div>
          <div class="card-body">
            <div class="compatibility-score">
              <label>Compatibilidade</label>
              <div class="progress-bar">
                <div
                  class="progress"
                  :style="{ width: compatibilityPercent + '%' }"
                  :class="compatibilityClass"
                ></div>
              </div>
              <span>{{ compatibilityPercent }}%</span>
            </div>

            <!-- CTA: Montar Trilha (aparece quando não é 100%) -->
            <div v-if="Number(compatibilityPercent) < 100" class="sprint-cta">
              <div class="sprint-cta-info">
                <div class="sprint-cta-icon">🚀</div>
                <div>
                  <strong>Você está a {{ 100 - Number(compatibilityPercent) }}% da vaga!</strong>
                  <p>Monte uma trilha de aprendizado personalizada para preencher exatamente os gaps identificados.</p>
                </div>
              </div>
              <button
                class="btn btn-sprint"
                @click="generateLearningTrail"
                :disabled="generatingTrail"
              >
                <span v-if="generatingTrail" class="spinner-small"></span>
                <span v-else>⚡</span>
                {{ generatingTrail ? 'Montando sua trilha...' : 'Montar Trilha de Aprendizado' }}
              </button>
            </div>

            <!-- Badge 100% -->
            <div v-else class="badge-100">
              🏆 Você está 100% apto para essa vaga!
            </div>

            <div class="skills-section">
              <h4>Habilidades Ausentes ({{ analysis.gapAnalysis.missingSkills.length }})</h4>
              <ul v-if="analysis.gapAnalysis.missingSkills.length > 0">
                <li v-for="skill in analysis.gapAnalysis.missingSkills" :key="skill" class="skill-missing">
                  <span class="dot-missing"></span>{{ skill }}
                </li>
              </ul>
              <p v-else class="text-muted">Nenhuma habilidade ausente!</p>
            </div>

            <div class="skills-section">
              <h4>Habilidades Fracas ({{ analysis.gapAnalysis.weakSkills?.length || 0 }})</h4>
              <ul v-if="analysis.gapAnalysis.weakSkills && analysis.gapAnalysis.weakSkills.length > 0">
                <li v-for="ws in analysis.gapAnalysis.weakSkills" :key="ws.skill" class="skill-weak">
                  <span class="dot-weak"></span>
                  {{ ws.skill }}
                  <span class="skill-level">
                    ({{ (ws.current * 100).toFixed(0) }}% → {{ (ws.required * 100).toFixed(0) }}% req.)
                  </span>
                </li>
              </ul>
              <p v-else class="text-muted">Nenhuma habilidade abaixo do nível requerido.</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Descrição da Vaga</h3>
          </div>
          <div class="card-body job-description">
            <pre>{{ analysis.jobDescription }}</pre>
          </div>
        </div>
      </div>

      <!-- Coluna da Direita: Roadmap original OU trilha gerada -->
      <div class="analysis-column">

        <!-- Trilha de aprendizado gerada pelo CTA -->
        <div v-if="learningTrail" class="card card-trail">
          <div class="card-header trail-header">
            <div>
              <h3>⚡ Trilha para 100% de Compatibilidade</h3>
              <p class="trail-subtitle">{{ learningTrail.overview }}</p>
            </div>
            <button class="btn btn-success btn-small" @click="saveTrailAsRoadmap" :disabled="savingTrail">
              <span v-if="savingTrail" class="spinner-small"></span>
              {{ savingTrail ? 'Salvando...' : '💾 Salvar como Roadmap' }}
            </button>
          </div>
          <div class="card-body">
            <div
              v-for="(step, index) in learningTrail.steps"
              :key="step.id"
              class="trail-step"
            >
              <div class="trail-step-number">{{ index + 1 }}</div>
              <div class="trail-step-content">
                <h5 class="trail-step-title">{{ step.title }}</h5>
                <p class="trail-step-desc">{{ step.description }}</p>
                <div class="trail-step-topics" v-if="step.topics && step.topics.length">
                  <span v-for="topic in step.topics" :key="topic" class="trail-topic-tag">{{ topic }}</span>
                </div>
                <div class="trail-step-meta">
                  <span class="trail-hours">⏱ {{ step.estimatedHours }}h estimadas</span>
                  <span v-if="step.projectSuggestion" class="trail-project">
                    💡 {{ step.projectSuggestion }}
                  </span>
                </div>
              </div>
            </div>

            <div class="trail-resources" v-if="learningTrail.resources && learningTrail.resources.length">
              <h4>📚 Recursos Recomendados</h4>
              <ul>
                <li v-for="res in learningTrail.resources" :key="res">{{ res }}</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Roadmap original da análise -->
        <div class="card" :class="{ 'card-dimmed': !!learningTrail }">
          <div class="card-header">
            <h3>{{ learningTrail ? 'Roadmap Original da Análise' : 'Plano de Ação (Roadmap)' }}</h3>
          </div>
          <div class="card-body">
            <div v-if="analysis.roadmap && analysis.roadmap.steps">
              <div v-for="step in analysis.roadmap.steps" :key="step.id" class="roadmap-step">
                <h5 class="step-title">{{ step.title }}</h5>
                <p class="step-description">{{ step.description }}</p>
                <div class="step-topics" v-if="step.topics && step.topics.length > 0">
                  <strong>Tópicos:</strong>
                  <span>{{ step.topics.join(', ') }}</span>
                </div>
              </div>
            </div>
            <p v-else class="text-muted">Nenhum roadmap gerado, pois não haviam gaps de habilidades.</p>
          </div>
        </div>

      </div>
    </div>
  </div>

  <div v-else class="loading-state">
    <div class="spinner-large"></div>
    <p>Carregando análise...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePortfoliosStore } from '@/stores/portfolios';
import { useUiStore } from '@/stores/ui';
import { apiGeminiService } from '@/services/api.gemini.service';
import type { NexusSprintResult } from "@/services/nexus-sprint.service";

interface Analysis extends NexusSprintResult {
  id: string;
  createdAt: string;
}

const route = useRoute();
const router = useRouter();
const portfoliosStore = usePortfoliosStore();
const uiStore = useUiStore();

const analysis = ref<Analysis | null>(null);
const learningTrail = ref<any>(null);
const generatingTrail = ref(false);
const savingTrail = ref(false);

const compatibilityPercent = computed(() => {
  if (!analysis.value) return 0;
  return (analysis.value.gapAnalysis.compatibility * 100).toFixed(0);
});

const compatibilityClass = computed(() => {
  if (!analysis.value) return '';
  const score = analysis.value.gapAnalysis.compatibility;
  if (score >= 1) return 'bg-success';
  if (score > 0.75) return 'bg-success';
  if (score > 0.5) return 'bg-warning';
  return 'bg-danger';
});

onMounted(async () => {
  const analysisId = route.params.id as string;

  if (portfoliosStore.currentNexusSprint && (portfoliosStore.currentNexusSprint as any).id === analysisId) {
    analysis.value = portfoliosStore.currentNexusSprint as Analysis;
  } else {
    if (!portfoliosStore.dataLoaded) {
      await portfoliosStore.fetchPortfolioData();
    }
    const found = portfoliosStore.nexusSprints.find((s: any) => s.id === analysisId);
    if (found) {
      analysis.value = found as Analysis;
      portfoliosStore.setCurrentNexusSprint(found);
    }
  }
});

/** Gera uma trilha de aprendizado personalizada focada nos gaps */
const generateLearningTrail = async () => {
  if (!analysis.value) return;

  generatingTrail.value = true;
  learningTrail.value = null;

  try {
    const { missingSkills, weakSkills } = analysis.value.gapAnalysis;
    const userSkills = portfoliosStore.userSkills;

    const missingList = missingSkills.join(', ') || 'nenhuma';
    const weakList = weakSkills
      .map(w => `${w.skill} (atual ${(w.current * 100).toFixed(0)}%, precisa ${(w.required * 100).toFixed(0)}%)`)
      .join(', ') || 'nenhuma';

    const goal = `Atingir 100% de compatibilidade com a vaga "${analysis.value.jobTitle}"`;

    const trail = await apiGeminiService.generateRoadmap({
      goal,
      currentRole: 'Desenvolvedor',
      months: 3,
      skills: userSkills,
      context: `
        Foco EXCLUSIVO nas lacunas identificadas para esta vaga específica.
        
        Habilidades que o candidato já domina: ${userSkills.join(', ')}.
        
        Skills TOTALMENTE AUSENTES (prioridade máxima): ${missingList}.
        Skills ABAIXO DO NÍVEL EXIGIDO (prioridade alta): ${weakList}.
        
        IMPORTANTE:
        - NÃO crie etapas para skills que o candidato já domina.
        - Cada etapa deve ensinar exatamente uma ou duas skills do gap identificado.
        - Use as skills existentes como âncora para ensinar as novas (ex: "já que você sabe React, Docker vai ser assim...").
        - Prazo realista de 3 meses intensivos.
        - Projetos práticos que simulem o ambiente da vaga.
        
        Descrição completa da vaga:
        ${analysis.value.jobDescription}
      `,
    });

    learningTrail.value = trail;
    uiStore.triggerToast({ message: 'Trilha montada! Agora é só seguir o plano. 🚀', type: 'success' });
  } catch (err: any) {
    uiStore.triggerToast({ message: 'Erro ao gerar trilha: ' + err.message, type: 'error' });
  } finally {
    generatingTrail.value = false;
  }
};

/** Salva a trilha gerada como roadmap no portfólio */
const saveTrailAsRoadmap = async () => {
  if (!learningTrail.value) return;

  savingTrail.value = true;
  try {
    const roadmap = {
      ...learningTrail.value,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      steps: learningTrail.value.steps.map((s: any) => ({ ...s, completed: false })),
    };

    await portfoliosStore.saveRoadmap(roadmap);
    uiStore.triggerToast({ message: 'Trilha salva como Roadmap! Acesse em Trajetória.', type: 'success' });
    router.push('/admin/roadmap');
  } catch (err: any) {
    uiStore.triggerToast({ message: 'Erro ao salvar: ' + err.message, type: 'error' });
  } finally {
    savingTrail.value = false;
  }
};
</script>

<style scoped>
/* ── Sprint CTA ─────────────────────────────────── */
.sprint-cta {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border: 1px solid #e94560;
  border-radius: 12px;
  padding: 20px;
  margin: 16px 0 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sprint-cta-info {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  color: #e0e0e0;
}

.sprint-cta-icon {
  font-size: 2rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.sprint-cta-info strong {
  display: block;
  color: #fff;
  font-size: 1rem;
  margin-bottom: 4px;
}

.sprint-cta-info p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #a0a0c0;
}

.btn-sprint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #e94560, #c23152);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.3px;
}

.btn-sprint:hover:not(:disabled) {
  background: linear-gradient(135deg, #ff5a78, #e94560);
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(233, 69, 96, 0.4);
}

.btn-sprint:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* ── Badge 100% ─────────────────────────────────── */
.badge-100 {
  background: linear-gradient(135deg, #1a4a1a, #2d7a2d);
  border: 1px solid #4caf50;
  border-radius: 10px;
  padding: 14px 20px;
  color: #a5d6a7;
  font-weight: 600;
  text-align: center;
  margin: 16px 0 24px;
}

/* ── Skills lists ───────────────────────────────── */
.skill-missing,
.skill-weak {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: 0.9rem;
}

.dot-missing {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e94560;
  flex-shrink: 0;
}

.dot-weak {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f59e0b;
  flex-shrink: 0;
}

.skill-level {
  color: #888;
  font-size: 0.8rem;
  margin-left: auto;
}

/* ── Card da trilha ─────────────────────────────── */
.card-trail {
  border: 2px solid #e94560;
  position: relative;
  overflow: hidden;
}

.card-trail::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #e94560, #f59e0b, #4caf50);
}

.card-dimmed {
  opacity: 0.6;
}

.trail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.trail-subtitle {
  margin: 4px 0 0;
  font-size: 0.85rem;
  color: #888;
}

.btn-success {
  background: #2d7a2d;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  transition: background 0.2s;
}

.btn-success:hover:not(:disabled) {
  background: #388e3c;
}

.btn-success:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* ── Steps da trilha ────────────────────────────── */
.trail-step {
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #2a2a2a;
}

.trail-step:last-child {
  border-bottom: none;
}

.trail-step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e94560, #c23152);
  color: #fff;
  font-weight: 700;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.trail-step-content {
  flex: 1;
}

.trail-step-title {
  margin: 0 0 6px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #f0f0f0;
}

.trail-step-desc {
  margin: 0 0 10px;
  font-size: 0.875rem;
  color: #a0a0a0;
  line-height: 1.5;
}

.trail-step-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.trail-topic-tag {
  background: rgba(233, 69, 96, 0.15);
  border: 1px solid rgba(233, 69, 96, 0.3);
  color: #e94560;
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.75rem;
  font-weight: 500;
}

.trail-step-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.trail-hours {
  font-size: 0.8rem;
  color: #888;
}

.trail-project {
  font-size: 0.8rem;
  color: #f59e0b;
  font-style: italic;
}

.trail-resources {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #2a2a2a;
}

.trail-resources h4 {
  margin: 0 0 10px;
  font-size: 0.9rem;
  color: #ccc;
}

.trail-resources ul {
  margin: 0;
  padding-left: 18px;
}

.trail-resources li {
  color: #888;
  font-size: 0.85rem;
  margin-bottom: 4px;
}

/* ── Spinner ─────────────────────────────────────── */
.spinner-small {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Reuse existing styles ──────────────────────── */
.analysis-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

@media (max-width: 900px) {
  .analysis-layout {
    grid-template-columns: 1fr;
  }
}

.analysis-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.compatibility-score {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #ccc;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #333;
  border-radius: 4px;
  overflow: hidden;
}

.progress {
  height: 100%;
  border-radius: 4px;
  transition: width 0.8s ease;
}

.bg-success { background: linear-gradient(90deg, #4caf50, #66bb6a); }
.bg-warning { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.bg-danger  { background: linear-gradient(90deg, #e94560, #ff6b6b); }

.skills-section {
  margin-bottom: 20px;
}

.skills-section h4 {
  font-size: 0.875rem;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 10px;
}

.skills-section ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.text-muted {
  color: #666;
  font-size: 0.875rem;
  font-style: italic;
}

.job-description pre {
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 0.85rem;
  color: #aaa;
  line-height: 1.6;
  margin: 0;
}

.roadmap-step {
  padding: 14px 0;
  border-bottom: 1px solid #2a2a2a;
}

.roadmap-step:last-child {
  border-bottom: none;
}

.step-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 6px;
}

.step-description {
  font-size: 0.85rem;
  color: #aaa;
  margin: 0 0 8px;
}

.step-topics {
  font-size: 0.8rem;
  color: #777;
}
</style>