<template>
  <div class="page-container">
    <div class="page-header">
      <div class="header-top">
        <h1>🚀 Minha Trajetória de Carreira</h1>
        <button v-if="roadmap" class="btn btn-primary" @click="startNewRoadmap">
           + Novo Objetivo
        </button>
      </div>
      <p class="subtitle">Defina um objetivo e receba um plano personalizado com IA. Complete etapas e veja seu progresso.</p>
      
      <!-- Seletor de Roadmap se houver mais de um -->
      <div v-if="portfoliosStore.roadmaps.length > 1" class="roadmap-selector">
        <label>Objetivo Ativo:</label>
        <select :value="portfoliosStore.currentRoadmapId" @change="switchRoadmap">
           <option v-for="r in portfoliosStore.roadmaps" :key="r.id" :value="r.id">
             {{ r.title }} ({{ getRoadmapProgress(r) }}%)
           </option>
        </select>
      </div>
    </div>

    <!-- Seção de criação de roadmap (se não existir ou se estiver criando novo) -->
    <div v-if="!roadmap || isCreatingNew" class="card create-card">
      <div class="card-header-flex">
         <h2>{{ isCreatingNew ? 'Criar Novo Objetivo' : 'Qual é seu próximo objetivo?' }}</h2>
         <button v-if="isCreatingNew && roadmap" class="btn btn-outline btn-small" @click="isCreatingNew = false">Cancelar</button>
      </div>
      
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
        
        <div v-if="portfoliosStore.userSkills.length > 0" class="skills-summary">
           <p><strong>Habilidades já adquiridas:</strong></p>
           <div class="skills-list">
             <span v-for="skill in portfoliosStore.userSkills" :key="skill" class="skill-pill">{{ skill }}</span>
           </div>
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
          
          <!-- Lista de Objetivos de Aprendizado -->
          <div v-if="step.learningObjectives && step.learningObjectives.length" class="learning-objectives">
            <h4>🎯 Objetivos da Etapa:</h4>
            <ul>
              <li v-for="obj in step.learningObjectives" :key="obj">{{ obj }}</li>
            </ul>
          </div>
          
          <div class="step-topics">
            <span v-for="tag in step.tags" :key="tag" class="skill-tag">🏷️ {{ tag }}</span>
            <span v-for="topic in step.topics" :key="topic" class="topic-tag">{{ topic }}</span>
          </div>
          
          <div v-if="getMissingPrerequisites(step).length > 0" class="missing-prerequisites">
            ⚠️ <strong>Faltam habilidades:</strong>
            <p>Você precisa aprender estas skills antes:</p>
            <div class="missing-tags">
               <span v-for="tag in getMissingPrerequisites(step)" :key="tag" class="missing-tag" @click="suggestRoadmapForSkill(tag)">
                 {{ tag }} (Criar Objetivo ↗️)
               </span>
            </div>
          </div>

          <div v-if="step.projectSuggestion" class="step-project">
            <strong>💡 Projeto sugerido:</strong> {{ step.projectSuggestion }}
          </div>

          <!-- Ações da etapa -->
          <div class="step-actions">
            <button @click="openQuiz(step)" class="btn btn-primary btn-small" v-if="!step.completed && (!step.quiz || !step.quiz.passed)" :disabled="!areDependenciesMet(step)">
               <span v-if="!areDependenciesMet(step)">🔒 Bloqueado (Complete etapas anteriores)</span>
               <span v-else>✍️ Fazer Quiz (Necessário para concluir)</span>
            </button>

            <div v-if="step.quiz && step.quiz.passed" class="quiz-badge">
               🏆 Quiz Aprovado (Nota: {{ step.quiz.score }}%)
            </div>

            <button @click="markStepComplete(step.id)" v-if="!step.completed && step.quiz && step.quiz.passed" class="btn btn-success btn-small">
              ✅ Concluir etapa
            </button>
            <button v-else-if="step.completed" disabled class="btn btn-small" style="background: #28a745; color: white; opacity:0.7;">
              ✔️ Concluída
            </button>

            <button @click="generateArticleForStep(step)" class="btn btn-small btn-outline" :disabled="!step.quiz?.passed || step.generatedArticleId || generating" :title="!step.quiz?.passed ? 'Complete o quiz primeiro' : ''">
              📝 {{ step.generatedArticleId ? 'Artigo gerado' : 'Gerar artigo' }}
            </button>
            <button @click="generateTutorialForStep(step)" class="btn btn-small btn-outline" :disabled="!step.quiz?.passed || step.generatedTutorialId || generating" :title="!step.quiz?.passed ? 'Complete o quiz primeiro' : ''">
              🎓 {{ step.generatedTutorialId ? 'Tutorial gerado' : 'Gerar tutorial' }}
            </button>
            <button @click="generateProjectForStep(step)" class="btn btn-small btn-outline" :disabled="!step.quiz?.passed || step.generatedProjectId || generating" :title="!step.quiz?.passed ? 'Complete o quiz primeiro' : ''">
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

    <!-- Modal de Quiz -->
    <transition name="fade">
      <div v-if="showQuizModal" class="modal-overlay">
        <div class="modal-content quiz-modal">
          <div class="modal-header">
            <h2>🎓 Quiz: {{ currentQuizStep?.title }}</h2>
            <button class="close-btn" @click="closeQuizModal" :disabled="submittingQuiz">&times;</button>
          </div>
          
          <div v-if="loadingQuiz" class="loading-state">
            <div class="spinner"></div>
            <p>Gerando perguntas desafiadoras...</p>
          </div>

          <div v-else-if="quizQuestions.length > 0" class="quiz-body">
            <p class="quiz-instructions">Responda corretamente a pelo menos 80% das questões para avançar.</p>
            
            <div v-for="(q, index) in quizQuestions" :key="q.id" class="quiz-question">
              <p class="question-text"><strong>{{ index + 1 }}.</strong> {{ q.question }}</p>
              <div class="options-list">
                <label v-for="(text, key) in q.options" :key="key" class="option-label" :class="{ 
                  'correct': quizSubmitted && key === q.correctOption,
                  'wrong': quizSubmitted && userAnswers[index] === key && key !== q.correctOption
                }">
                  <input type="radio" :name="'q'+index" :value="key" v-model="userAnswers[index]" :disabled="quizSubmitted">
                  <span class="option-letter">{{ key }})</span> {{ text }}
                </label>
              </div>
              <div v-if="quizSubmitted && userAnswers[index] !== q.correctOption" class="explanation">
                <strong>💡 Dica:</strong> {{ q.explanation }}
              </div>
            </div>

            <div v-if="quizSubmitted" class="quiz-result" :class="{ 'passed': quizScore >= 80, 'failed': quizScore < 80 }">
              <h3>Resultado: {{ quizScore }}% de acerto</h3>
              <p v-if="quizScore >= 80">Parabéns! Você dominou este tópico. 🎉</p>
              <p v-else>Você precisa estudar mais um pouco. Revise as dicas acima e tente novamente.</p>
            </div>

            <div class="modal-footer">
              <button v-if="!quizSubmitted" @click="submitQuiz" class="btn btn-primary" :disabled="Object.keys(userAnswers).length < quizQuestions.length">Confirmar Respostas</button>
              <button v-else-if="quizScore >= 80" @click="finalizeQuizSuccess" class="btn btn-success">Concluir e Voltar</button>
              <button v-else @click="retryQuiz" class="btn btn-secondary">Tentar Novamente</button>
            </div>
          </div>
        </div>
      </div>
    </transition>

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

const roadmap = computed(() => portfoliosStore.currentRoadmap);
const softSkills = computed(() => portfoliosStore.softSkills);

// Calcula progresso específico de um roadmap
const getRoadmapProgress = (r: any) => {
   if (!r.steps || !r.steps.length) return 0;
   const completed = r.steps.filter((s: any) => s.completed).length;
   return Math.round((completed / r.steps.length) * 100);
};

const progressPercent = computed(() => {
   if (!roadmap.value) return 0;
   return getRoadmapProgress(roadmap.value);
});

const generating = ref(false);
const analyzingSoft = ref(false);
const isCreatingNew = ref(false);

// Quiz State
const showQuizModal = ref(false);
const loadingQuiz = ref(false);
const submittingQuiz = ref(false);
const currentQuizStep = ref<any>(null);
const quizQuestions = ref<any[]>([]);
const userAnswers = ref<Record<number, string>>({});
const quizSubmitted = ref(false);
const quizScore = ref(0);

// Verifica dependências internas e pré-requisitos externos
const getMissingPrerequisites = (step: any): string[] => {
  if (!step.prerequisites || !step.prerequisites.length) return [];
  // Filtra as tags que o usuário NÃO tem
  return step.prerequisites.filter((req: string) => 
    !portfoliosStore.userSkills.includes(req.toLowerCase())
  );
};

const areDependenciesMet = (step: any): boolean => {
  // 1. Dependências internas (outras etapas deste roadmap)
  const internalDepsMet = (() => {
    if (!step.dependsOn || !Array.isArray(step.dependsOn) || step.dependsOn.length === 0) return true;
    if (!roadmap.value || !roadmap.value.steps) return true;
    
    return step.dependsOn.every((depId: string) => {
      const depStep = roadmap.value?.steps.find(s => s.id === depId);
      if (!depStep) return true;
      return depStep.completed;
    });
  })();

  // 2. Pré-requisitos externos (skills/tags)
  const externalDepsMet = getMissingPrerequisites(step).length === 0;

  return internalDepsMet && externalDepsMet;
};

const suggestRoadmapForSkill = (skill: string) => {
  isCreatingNew.value = true;
  goalForm.value.goal = `Aprender ${skill} para avançar na carreira`;
  goalForm.value.months = 3;
  // O usuário pode ajustar e clicar em gerar
  uiStore.triggerToast({ message: `Sugestão de objetivo criada para aprender "${skill}". Ajuste e gere o roadmap!`, type: 'info' });
};

const goalForm = ref({
  goal: '',
  currentRole: '',
  months: 6
});

const openQuiz = async (step: any) => {
  // Garante que tags seja um array, mesmo para roadmaps antigos
  if (!step.tags) step.tags = [];
  
  currentQuizStep.value = step;
  showQuizModal.value = true;
  loadingQuiz.value = true;
  quizSubmitted.value = false;
  userAnswers.value = {};
  quizScore.value = 0;
  
  try {
    const userPersona = localStorage.getItem('userPersona') || 'Professor Especialista';
    // Chama o serviço para gerar o quiz
    const questions = await apiGeminiService.generateStepQuiz(step.title, 'Intermediário', userPersona);
    quizQuestions.value = questions;
  } catch (e: any) {
    uiStore.triggerToast({ message: 'Erro ao gerar quiz: ' + e.message, type: 'error' });
    showQuizModal.value = false;
  } finally {
    loadingQuiz.value = false;
  }
};

const closeQuizModal = () => {
  showQuizModal.value = false;
  currentQuizStep.value = null;
  quizQuestions.value = [];
};

const submitQuiz = () => {
  let correctCount = 0;
  quizQuestions.value.forEach((q, index) => {
    if (userAnswers.value[index] === q.correctOption) {
      correctCount++;
    }
  });
  
  quizScore.value = Math.round((correctCount / quizQuestions.value.length) * 100);
  quizSubmitted.value = true;
};

const finalizeQuizSuccess = async () => {
  if (!currentQuizStep.value) return;
  
  try {
    const result = {
      passed: true,
      score: quizScore.value,
      attempts: (currentQuizStep.value.quiz?.attempts || 0) + 1,
      lastAttemptDate: new Date().toISOString()
    };
    
    await portfoliosStore.updateStepCompletion(currentQuizStep.value.id, false, { quizResult: result });
    
    // Adiciona as tags aprendidas à lista de habilidades do usuário
    if (currentQuizStep.value.tags && Array.isArray(currentQuizStep.value.tags)) {
      for (const tag of currentQuizStep.value.tags) {
        await portfoliosStore.addUserSkill(tag);
      }
    }

    uiStore.triggerToast({ message: 'Parabéns! Etapa desbloqueada e habilidades registradas.', type: 'success' });
    closeQuizModal();
  } catch (e: any) {
    uiStore.triggerToast({ message: 'Erro ao salvar progresso: ' + e.message, type: 'error' });
  }
};

const retryQuiz = () => {
  // Reinicia o estado do quiz para tentar novamente (pode manter as mesmas perguntas ou pedir novas, aqui vamos manter para estudo)
  quizSubmitted.value = false;
  userAnswers.value = {};
  // Opcional: Recarregar perguntas diferentes chamando openQuiz novamente
};

const generateRoadmap = async () => {
  generating.value = true;
  try {
    const result = await apiGeminiService.generateRoadmap({
      ...goalForm.value,
      skills: portfoliosStore.userSkills // Envia as skills do usuário para o backend
    });
    // Adiciona campo completed a cada step
    result.steps = result.steps.map(s => ({ ...s, completed: false }));
    await portfoliosStore.saveRoadmap(result);
    isCreatingNew.value = false;
  } catch (e: any) {
    uiStore.triggerToast({ message: 'Erro ao gerar roadmap: ' + e.message, type: 'error' });
  } finally {
    generating.value = false;
  }
};

const startNewRoadmap = () => {
  isCreatingNew.value = true;
  // Limpa o formulário mas mantém role atual se quiser
  goalForm.value.goal = '';
};

const switchRoadmap = (e: Event) => {
  const targetId = (e.target as HTMLSelectElement).value;
  portfoliosStore.setCurrentRoadmapId(targetId);
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
  
  generating.value = true;
  try {
    // Garante que a lista de artigos está carregada para não sobrescrever com array vazio se não tiver carregado
    if (!portfoliosStore.articles.length) {
       await portfoliosStore.fetchData('articles');
    }

    const userPersona = localStorage.getItem('userPersona') || 'Desenvolvedor FullStack e Professor';

    // Constrói um tópico rico com base nos objetivos de aprendizado
    const objectives = step.learningObjectives && step.learningObjectives.length 
      ? `\nObjetivos de aprendizado: ${step.learningObjectives.join(', ')}` 
      : '';
    
    const context = `${step.title}${objectives}`;

    // Gerar artigo com base no título da etapa e objetivos
    const article = await apiGeminiService.generateArticle({
      topic: context,
      category: 'Aprendizado',
      tone: 'educativo',
      persona: userPersona
    });
    
    // Salvar artigo
    const newArticle = { 
      ...article, 
      id: Date.now().toString(), 
      date: new Date().toLocaleDateString('pt-BR'),
      // Adiciona as tags da etapa ao artigo gerado para manter rastreabilidade
      tags: [...(article.tags || []), ...(step.tags || [])]
    };
    
    // Cria um novo array garantindo que é uma cópia
    const currentArticles = portfoliosStore.articles ? [...portfoliosStore.articles] : [];
    currentArticles.push(newArticle);
    
    await portfoliosStore.saveData({ type: 'articles', data: currentArticles });
    
    // Associar ao step
    await portfoliosStore.updateStepCompletion(step.id, step.completed, { articleId: newArticle.id });
    
    uiStore.triggerToast({ message: 'Artigo gerado com sucesso!', type: 'success' });
    router.push('/admin/articles');
  } catch (e: any) {
    console.error(e);
    uiStore.triggerToast({ message: 'Erro ao gerar artigo: ' + (e.message || 'Erro desconhecido'), type: 'error' });
  } finally {
    generating.value = false;
  }
};

const generateTutorialForStep = async (step: any) => {
  if (step.generatedTutorialId) {
    router.push(`/admin/tutorials/edit/${step.generatedTutorialId}`);
    return;
  }
  
  generating.value = true;
  try {
    if (!portfoliosStore.tutorials.length) {
       await portfoliosStore.fetchData('tutorials');
    }

    const userPersona = localStorage.getItem('userPersona') || 'Desenvolvedor FullStack e Professor';

    // Enriquece o tópico com objetivos
    const objectives = step.learningObjectives && step.learningObjectives.length 
      ? `. Foco nos seguintes pontos: ${step.learningObjectives.join(', ')}` 
      : '';

    const tutorial = await apiGeminiService.generateTutorial({
      topic: `${step.title}${objectives}`,
      difficulty: 'Iniciante',
      category: 'Programação',
      persona: userPersona
    });
    
    const newTutorial = { 
      ...tutorial, 
      id: Date.now().toString(), 
      date: new Date().toISOString(),
      tags: [...(tutorial.tags || []), ...(step.tags || [])]
    };

    const currentTutorials = portfoliosStore.tutorials ? [...portfoliosStore.tutorials] : [];
    currentTutorials.push(newTutorial);
    
    await portfoliosStore.saveData({ type: 'tutorials', data: currentTutorials });
    await portfoliosStore.updateStepCompletion(step.id, step.completed, { tutorialId: newTutorial.id });
    
    uiStore.triggerToast({ message: 'Tutorial gerado!', type: 'success' });
    router.push('/admin/tutorials');
  } catch (e: any) {
    uiStore.triggerToast({ message: 'Erro ao gerar tutorial: ' + e.message, type: 'error' });
  } finally {
    generating.value = false;
  }
};

const generateProjectForStep = async (step: any) => {
  if (step.generatedProjectId) {
    router.push(`/admin/projects/edit/${step.generatedProjectId}`);
    return;
  }
  
  generating.value = true;
  try {
    if (!portfoliosStore.projects.length) {
       await portfoliosStore.fetchData('projects');
    }

    const userPersona = localStorage.getItem('userPersona') || 'Desenvolvedor FullStack e Professor';

    // Usa as tags técnicas para sugestão de projeto, pois são mais precisas que os tópicos gerais
    const techContext = (step.tags && step.tags.length > 0) ? step.tags : step.topics;

    // Sugestão de projeto
    const suggestion = await apiGeminiService.generateProjectSuggestion(techContext, 'iniciante', userPersona);
    
    const project = {
      id: Date.now().toString(),
      title: suggestion.title,
      description: suggestion.description,
      image: '',
      tags: [...suggestion.technologies, ...(step.tags || [])], // Garante que as tags da etapa estejam no projeto
      category: 'Projeto de aprendizado',
      githubUrl: '',
    };
    
    const currentProjects = portfoliosStore.projects ? [...portfoliosStore.projects] : [];
    currentProjects.push(project);

    await portfoliosStore.saveData({ type: 'projects', data: currentProjects });
    await portfoliosStore.updateStepCompletion(step.id, step.completed, { projectId: project.id });
    
    uiStore.triggerToast({ message: 'Projeto criado!', type: 'success' });
    router.push('/admin/projects');
  } catch (e: any) {
    uiStore.triggerToast({ message: 'Erro ao criar projeto: ' + e.message, type: 'error' });
  } finally {
    generating.value = false;
  }
};

const analyzeSoftSkills = async () => {
  analyzingSoft.value = true;
  try {
    // Garante que temos os dados carregados antes de analisar
    if (!portfoliosStore.articles.length) await portfoliosStore.fetchData('articles');
    if (!portfoliosStore.projects.length) await portfoliosStore.fetchData('projects');
    if (!portfoliosStore.experiences.length) await portfoliosStore.fetchData('experiences');

    // Coletar textos de artigos, descrições de projetos, experiências
    const texts: string[] = [];
    
    // Adiciona Artigos (título e conteúdo)
    portfoliosStore.articles.forEach((a: any) => {
      texts.push(`Artigo: ${a.title}\n${a.description || ''}\n${a.content || ''}`);
    });
    
    // Adiciona Projetos (título e descrição)
    portfoliosStore.projects.forEach((p: any) => {
      texts.push(`Projeto: ${p.title}\n${p.description}`);
    });
    
    // Adiciona Experiências (cargo e descrição)
    portfoliosStore.experiences.forEach((e: any) => {
      texts.push(`Experiência: ${e.role} na ${e.company}\n${e.description}`);
    });
    
    if (texts.length === 0) {
      uiStore.triggerToast({ message: 'Crie algum conteúdo (artigos, projetos ou experiências) primeiro para a IA analisar.', type: 'warning' });
      return;
    }

    // Limita a quantidade de texto para não estourar o limite de tokens da requisição, priorizando os mais recentes
    // Pega os últimos 10 itens combinados
    const recentTexts = texts.slice(-10); 

    const userPersona = localStorage.getItem('userPersona') || 'Recrutador Técnico';

    const analysis = await apiGeminiService.analyzeSoftSkills({
       texts: recentTexts,
       persona: userPersona
    });
    
    await portfoliosStore.saveSoftSkills(analysis);
    uiStore.triggerToast({ message: 'Soft skills analisadas com sucesso!', type: 'success' });
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
.header-top { display: flex; justify-content: space-between; align-items: center; }
.roadmap-selector { margin-top: 15px; background: white; padding: 10px; border-radius: 8px; display: inline-flex; align-items: center; gap: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.roadmap-selector select { padding: 5px; border: 1px solid #ddd; border-radius: 4px; }
.card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }

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
.skills-summary {
  margin-bottom: 20px;
  background: #f8f9fa;
  padding: 10px;
  border-radius: 6px;
}
.skills-list { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 5px; }
.skill-pill { background: #e2e8f0; font-size: 0.75rem; padding: 2px 8px; border-radius: 10px; color: #4a5568; }

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
.learning-objectives {
  background: #eef5f9;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  border-left: 4px solid #5b5fab;
}
.learning-objectives h4 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 0.95rem;
  color: #333;
}
.learning-objectives ul {
  margin: 0;
  padding-left: 20px;
  font-size: 0.9rem;
  color: #555;
}
.learning-objectives li {
  margin-bottom: 4px;
}
.topic-tag {
  background: #eef2ff;
  color: #5b5fab;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
}
.skill-tag {
  background: #e6fffa;
  color: #2c7a7b;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  border: 1px solid #b2f5ea;
}
.missing-prerequisites {
  background: #fff5f5;
  border: 1px solid #feb2b2;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 15px;
}
.missing-tags { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 5px; }
.missing-tag {
  background: #fc8181;
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: 0.2s;
}
.missing-tag:hover { background: #c53030; }

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

/* Quiz Modal Styles */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.8);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.modal-content.quiz-modal {
  width: 90%; max-width: 700px; max-height: 90vh; overflow-y: auto;
  background: white; border-radius: 12px; display: flex; flex-direction: column;
}
.modal-header {
  padding: 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;
  background: #f8f9fa; border-radius: 12px 12px 0 0;
}
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #666; }

.quiz-body { padding: 25px; }
.quiz-question { margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px dashed #eee; }
.question-text { font-size: 1.1rem; margin-bottom: 15px; color: #333; }
.options-list { display: flex; flex-direction: column; gap: 10px; }
.option-label {
  padding: 12px; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; transition: 0.2s;
  display: flex; align-items: center; gap: 10px;
}
.option-label:hover:not(.correct):not(.wrong) { background: #f0f4ff; border-color: #5b5fab; }
.option-label input { margin: 0; }
.option-letter { font-weight: bold; color: #5b5fab; }

.option-label.correct { background: #d4edda; border-color: #28a745; color: #155724; }
.option-label.wrong { background: #f8d7da; border-color: #dc3545; color: #721c24; opacity: 0.7; }

.explanation {
  margin-top: 15px; padding: 15px; background: #e2e3e5; border-radius: 8px; font-size: 0.95rem; color: #383d41;
}

.quiz-result {
  text-align: center; padding: 20px; margin-top: 20px; border-radius: 8px;
}
.quiz-result.passed { background: #d1e7dd; color: #0f5132; }
.quiz-result.failed { background: #f8d7da; color: #842029; }

.quiz-badge {
  display: inline-block; background: #ffc107; color: #333; padding: 5px 10px; border-radius: 20px; font-size: 0.85rem; font-weight: bold; margin-bottom: 10px;
}

.modal-footer { padding: 20px; display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #eee; }

.loading-state { padding: 50px; text-align: center; }
.spinner { width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #5b5fab; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px; }

/* Transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
