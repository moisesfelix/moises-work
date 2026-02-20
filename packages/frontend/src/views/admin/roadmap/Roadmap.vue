<template>
  <div class="page-container">
    <div class="page-header">
      <h1>🚀 Minha Trajetória de Carreira</h1>
      <p class="subtitle">Defina um objetivo e receba um plano personalizado com IA. Complete etapas e veja seu progresso.</p>
    </div>

    <!-- Seção de criação de roadmap (se não existir) -->
    <div v-if="!roadmap" class="card create-card">
      <h2>Qual é seu próximo objetivo?</h2>
      <form @submit.prevent="generateRoadmap" class="form-container">
        <div class="form-group">
          <label for="goal">O que você quer aprender ou se tornar?</label>
          <input id="goal" v-model="goalForm.goal" placeholder="Ex: Quero me tornar desenvolvedor Vue.js" required />
        </div>
        <div class="form-group">
          <label for="currentRole">Sua ocupação atual (opcional)</label>
          <input id="currentRole" v-model="goalForm.currentRole" placeholder="Ex: Entregador" />
        </div>
        <div class="form-group">
          <label for="months">Prazo em meses</label>
          <select id="months" v-model.number="goalForm.months" required>
            <option value="3">3 meses</option>
            <option value="6">6 meses</option>
            <option value="12">12 meses</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary" :disabled="generating">
          <span v-if="generating">🔄 Gerando roadmap...</span>
          <span v-else>✨ Gerar Roadmap com IA</span>
        </button>
      </form>
    </div>

    <!-- Roadmap ativo -->
    <div v-else class="roadmap-container">
      <div class="progress-header">
        <h2>{{ roadmap.title }}</h2>
        <div class="progress-bar-container">
          <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
          <span class="progress-text">{{ progressPercent }}% concluído</span>
        </div>
        <p class="overview">{{ roadmap.overview }}</p>
      </div>

      <div class="steps-timeline">
        <div v-for="(step, index) in roadmap.steps" :key="step.id" class="step-card" :class="{ completed: step.completed }">
          <div class="step-header">
            <span class="step-number">{{ index + 1 }}</span>
            <h3>{{ step.title }}</h3>
            <span class="step-hours">{{ step.estimatedHours }}h</span>
          </div>
          <p class="step-description">{{ step.description }}</p>
          <div class="step-topics">
            <span v-for="topic in step.topics" :key="topic" class="topic-tag">{{ topic }}</span>
          </div>
          <div v-if="step.projectSuggestion" class="step-project">
            <strong>💡 Projeto sugerido:</strong> {{ step.projectSuggestion }}
          </div>

          <!-- Ações da etapa -->
          <div class="step-actions">
            <button @click="markStepComplete(step.id)" v-if="!step.completed" class="btn btn-success btn-small">
              ✅ Concluir etapa
            </button>
            <button v-else disabled class="btn btn-small" style="background: #28a745; color: white; opacity:0.7;">
              ✔️ Concluída
            </button>

            <button @click="generateArticleForStep(step)" class="btn btn-small btn-outline" :disabled="step.generatedArticleId">
              📝 {{ step.generatedArticleId ? 'Artigo gerado' : 'Gerar artigo' }}
            </button>
            <button @click="generateTutorialForStep(step)" class="btn btn-small btn-outline" :disabled="step.generatedTutorialId">
              🎓 {{ step.generatedTutorialId ? 'Tutorial gerado' : 'Gerar tutorial' }}
            </button>
            <button @click="generateProjectForStep(step)" class="btn btn-small btn-outline" :disabled="step.generatedProjectId">
              🛠️ {{ step.generatedProjectId ? 'Projeto criado' : 'Criar projeto' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Recursos adicionais -->
      <div class="resources-section">
        <h3>📚 Recursos recomendados</h3>
        <ul>
          <li v-for="resource in roadmap.resources" :key="resource">{{ resource }}</li>
        </ul>
      </div>
    </div>

    <!-- Seção de Soft Skills (análise) -->
    <div class="card soft-skills-card">
      <h2>🧠 Análise de Soft Skills</h2>
      <p>Com base nos seus artigos, tutoriais e projetos, a IA analisa suas habilidades comportamentais.</p>
      
      <div v-if="softSkills" class="soft-skills-grid">
        <div class="skill-item">
          <span>Comunicação</span>
          <div class="skill-bar"><div :style="{ width: softSkills.communication + '%' }"></div></div>
          <span>{{ softSkills.communication }}%</span>
        </div>
        <div class="skill-item">
          <span>Trabalho em equipe</span>
          <div class="skill-bar"><div :style="{ width: softSkills.teamwork + '%' }"></div></div>
          <span>{{ softSkills.teamwork }}%</span>
        </div>
        <div class="skill-item">
          <span>Resolução de problemas</span>
          <div class="skill-bar"><div :style="{ width: softSkills.problemSolving + '%' }"></div></div>
          <span>{{ softSkills.problemSolving }}%</span>
        </div>
        <div class="skill-item">
          <span>Adaptabilidade</span>
          <div class="skill-bar"><div :style="{ width: softSkills.adaptability + '%' }"></div></div>
          <span>{{ softSkills.adaptability }}%</span>
        </div>
        <div class="skill-item">
          <span>Liderança</span>
          <div class="skill-bar"><div :style="{ width: softSkills.leadership + '%' }"></div></div>
          <span>{{ softSkills.leadership }}%</span>
        </div>
      </div>

      <div v-if="softSkills?.suggestedImprovements" class="improvements">
        <h4>💡 Sugestões de melhoria:</h4>
        <ul>
          <li v-for="imp in softSkills.suggestedImprovements" :key="imp">{{ imp }}</li>
        </ul>
      </div>

      <button @click="analyzeSoftSkills" class="btn btn-secondary" :disabled="analyzingSoft">
        {{ analyzingSoft ? 'Analisando...' : '🔄 Reanalisar Soft Skills' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { usePortfoliosStore } from '@/stores/portfolios';
import { apiGeminiService } from '@/services/api.gemini.service';
import { useRouter } from 'vue-router';
import { useUiStore } from '@/stores/ui';

const portfoliosStore = usePortfoliosStore();
const uiStore = useUiStore();
const router = useRouter();

const roadmap = computed(() => portfoliosStore.roadmap);
const softSkills = computed(() => portfoliosStore.softSkills);
const progressPercent = computed(() => portfoliosStore.progressPercent);

const generating = ref(false);
const analyzingSoft = ref(false);

const goalForm = ref({
  goal: '',
  currentRole: '',
  months: 6
});

const generateRoadmap = async () => {
  generating.value = true;
  try {
    const result = await apiGeminiService.generateRoadmap(goalForm.value);
    // Adiciona campo completed a cada step
    result.steps = result.steps.map(s => ({ ...s, completed: false }));
    await portfoliosStore.saveRoadmap(result);
  } catch (e: any) {
    uiStore.triggerToast({ message: 'Erro ao gerar roadmap: ' + e.message, type: 'error' });
  } finally {
    generating.value = false;
  }
};

const markStepComplete = async (stepId: string) => {
  await portfoliosStore.updateStepCompletion(stepId, true);
  uiStore.triggerToast({ message: 'Etapa concluída!', type: 'success' });
};

const generateArticleForStep = async (step: any) => {
  if (step.generatedArticleId) {
    router.push(`/admin/articles/edit/${step.generatedArticleId}`);
    return;
  }
  try {
    // Gerar artigo com base no título da etapa
    const article = await apiGeminiService.generateArticle({
      topic: step.title,
      category: 'Aprendizado',
      tone: 'educativo'
    });
    // Salvar artigo (usando store existente)
    const newArticle = { ...article, id: Date.now().toString(), date: new Date().toLocaleDateString('pt-BR') };
    await portfoliosStore.saveData({ type: 'articles', data: [...portfoliosStore.articles, newArticle] });
    // Associar ao step
    await portfoliosStore.updateStepCompletion(step.id, step.completed, { articleId: newArticle.id });
    uiStore.triggerToast({ message: 'Artigo gerado com sucesso!', type: 'success' });
    router.push('/admin/articles');
  } catch (e: any) {
    uiStore.triggerToast({ message: 'Erro ao gerar artigo: ' + e.message, type: 'error' });
  }
};

const generateTutorialForStep = async (step: any) => {
  if (step.generatedTutorialId) {
    router.push(`/admin/tutorials/edit/${step.generatedTutorialId}`);
    return;
  }
  try {
    const tutorial = await apiGeminiService.generateTutorial({
      topic: step.title,
      difficulty: 'Iniciante',
      category: 'Programação'
    });
    const newTutorial = { ...tutorial, id: Date.now().toString(), date: new Date().toISOString() };
    await portfoliosStore.saveData({ type: 'tutorials', data: [...portfoliosStore.tutorials, newTutorial] });
    await portfoliosStore.updateStepCompletion(step.id, step.completed, { tutorialId: newTutorial.id });
    uiStore.triggerToast({ message: 'Tutorial gerado!', type: 'success' });
    router.push('/admin/tutorials');
  } catch (e: any) {
    uiStore.triggerToast({ message: 'Erro ao gerar tutorial: ' + e.message, type: 'error' });
  }
};

const generateProjectForStep = async (step: any) => {
  if (step.generatedProjectId) {
    router.push(`/admin/projects/edit/${step.generatedProjectId}`);
    return;
  }
  try {
    // Sugestão de projeto
    const suggestion = await apiGeminiService.generateProjectSuggestion(step.topics, 'iniciante');
    const project = {
      id: Date.now().toString(),
      title: suggestion.title,
      description: suggestion.description,
      image: '',
      tags: suggestion.technologies,
      category: 'Projeto de aprendizado',
      githubUrl: '',
    };
    await portfoliosStore.saveData({ type: 'projects', data: [...portfoliosStore.projects, project] });
    await portfoliosStore.updateStepCompletion(step.id, step.completed, { projectId: project.id });
    uiStore.triggerToast({ message: 'Projeto criado!', type: 'success' });
    router.push('/admin/projects');
  } catch (e: any) {
    uiStore.triggerToast({ message: 'Erro ao criar projeto: ' + e.message, type: 'error' });
  }
};

const analyzeSoftSkills = async () => {
  analyzingSoft.value = true;
  try {
    // Coletar textos de artigos, descrições de projetos, experiências
    const texts: string[] = [];
    portfoliosStore.articles.forEach((a: any) => texts.push(a.title + '\n' + (a.description || '') + '\n' + (a.content || '')));
    portfoliosStore.projects.forEach((p: any) => texts.push(p.title + '\n' + p.description));
    portfoliosStore.experiences.forEach((e: any) => texts.push(e.role + ' at ' + e.company + '\n' + e.description));
    
    if (texts.length === 0) {
      uiStore.triggerToast({ message: 'Crie algum conteúdo primeiro (artigos, projetos) para análise.', type: 'warning' });
      return;
    }

    const analysis = await apiGeminiService.analyzeSoftSkills(texts.slice(0, 5)); // limitar para evitar tokens excessivos
    await portfoliosStore.saveSoftSkills(analysis);
    uiStore.triggerToast({ message: 'Soft skills analisadas!', type: 'success' });
  } catch (e: any) {
    uiStore.triggerToast({ message: 'Erro na análise: ' + e.message, type: 'error' });
  } finally {
    analyzingSoft.value = false;
  }
};
</script>

<style scoped>
.page-container {
  padding: 20px;
  background-color: var(--bg-light, #f5f7fb);
  min-height: 100vh;
}
.page-header {
  margin-bottom: 30px;
}
.page-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}
.subtitle {
  color: #6c757d;
}
.create-card, .roadmap-container, .soft-skills-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}
.form-container {
  max-width: 500px;
}
.form-group {
  margin-bottom: 20px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}
.form-group input, .form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
}
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}
.btn-primary {
  background-color: #5b5fab;
  color: white;
}
.btn-primary:hover:not(:disabled) {
  background-color: #4a4e94;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-success {
  background-color: #28a745;
  color: white;
}
.btn-outline {
  background: transparent;
  border: 1px solid #5b5fab;
  color: #5b5fab;
}
.btn-small {
  padding: 5px 10px;
  font-size: 0.85rem;
}
.progress-header {
  margin-bottom: 30px;
}
.progress-bar-container {
  background: #e9ecef;
  height: 24px;
  border-radius: 12px;
  position: relative;
  margin: 15px 0;
}
.progress-bar {
  background: linear-gradient(90deg, #5b5fab, #8b5cf6);
  height: 24px;
  border-radius: 12px;
  transition: width 0.3s;
}
.progress-text {
  position: absolute;
  top: 0;
  right: 10px;
  color: white;
  font-weight: bold;
  line-height: 24px;
  text-shadow: 0 0 2px rgba(0,0,0,0.3);
}
.steps-timeline {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}
.step-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  background: white;
  transition: 0.2s;
}
.step-card.completed {
  background: #f8f9fa;
  opacity: 0.8;
}
.step-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}
.step-number {
  width: 30px;
  height: 30px;
  background: #5b5fab;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}
.step-header h3 {
  flex: 1;
  margin: 0;
}
.step-hours {
  background: #e9ecef;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
}
.step-description {
  color: #495057;
  margin-bottom: 15px;
}
.step-topics {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 15px;
}
.topic-tag {
  background: #eef2ff;
  color: #5b5fab;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
}
.step-project {
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 4px;
}
.step-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}
.resources-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
}
.resources-section ul {
  margin-top: 10px;
  padding-left: 20px;
}
.soft-skills-card {
  margin-top: 30px;
}
.soft-skills-grid {
  display: grid;
  gap: 15px;
  margin: 20px 0;
}
.skill-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.skill-item span:first-child {
  width: 150px;
  font-weight: 500;
}
.skill-bar {
  flex: 1;
  height: 10px;
  background: #e9ecef;
  border-radius: 5px;
  overflow: hidden;
}
.skill-bar div {
  height: 100%;
  background: linear-gradient(90deg, #5b5fab, #8b5cf6);
}
.skill-item span:last-child {
  width: 45px;
  text-align: right;
}
.improvements {
  background: #d1ecf1;
  border-left: 4px solid #17a2b8;
  padding: 15px;
  border-radius: 4px;
  margin: 20px 0;
}
.improvements h4 {
  margin-top: 0;
}
.improvements ul {
  margin-bottom: 0;
}
</style>
