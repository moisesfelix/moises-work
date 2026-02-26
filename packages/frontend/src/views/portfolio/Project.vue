<template>
  <div class="project-page">
    <div class="container">
      <div v-if="project" class="project-wrapper">

        <!-- HEADER -->
        <div class="project-header">
          <span class="badge">{{ project.category || 'Geral' }}</span>
          <h1>{{ project.title }}</h1>

          <div class="project-meta">
            <div class="meta-item" v-if="project.date">
              <i class="fas fa-calendar-alt"></i> {{ project.date }}
            </div>
            <div class="meta-item" v-if="githubData">
              <i class="fas fa-star"></i> {{ githubData.stars }} Stars
            </div>
            <div class="meta-item" v-if="githubData">
              <i class="fas fa-code-branch"></i> {{ githubData.forks }} Forks
            </div>

            <a v-if="project.githubUrl" :href="project.githubUrl" target="_blank" class="btn-action">
              <i class="fab fa-github"></i>
              <span>Código Fonte</span>
            </a>
            <a v-if="project.demoUrl" :href="project.demoUrl" target="_blank" class="btn-action btn-demo">
              <i class="fas fa-external-link-alt"></i>
              <span>Live Demo</span>
            </a>
            <button @click="shareProject" class="btn-action btn-share">
              <i class="fas fa-share-alt"></i>
              <span>Compartilhar</span>
            </button>
          </div>

          <div class="project-tags">
            <span v-for="tag in tagList" :key="tag" class="tag-badge">#{{ tag }}</span>
          </div>
        </div>

        <!-- IMAGE -->
        <div class="image-container">
          <img :src="project.image || placeholderImage" :alt="project.title" class="project-image" />
        </div>

        <!-- DESCRIPTION -->
        <div class="project-body">
          <h2>Sobre o Projeto</h2>
          <p>{{ project.description }}</p>
        </div>

        <!-- GITHUB STATS -->
        <div v-if="githubData" class="github-stats">
          <div class="stat-box">
            <span class="stat-value">{{ githubData.stars }}</span>
            <span class="stat-label">Stars</span>
          </div>
          <div class="stat-box">
            <span class="stat-value">{{ githubData.forks }}</span>
            <span class="stat-label">Forks</span>
          </div>
          <div class="stat-box">
            <span class="stat-value">{{ githubData.issues }}</span>
            <span class="stat-label">Issues</span>
          </div>
          <div class="stat-box">
            <span class="stat-value">{{ githubData.lastCommitDate }}</span>
            <span class="stat-label">Último Commit</span>
          </div>
        </div>

        <!-- LANGUAGES -->
        <div v-if="githubData && githubData.languages && Object.keys(githubData.languages).length" class="section">
          <h3 class="section-title"><i class="fas fa-chart-bar"></i> Linguagens</h3>
          <div class="languages-list">
            <div v-for="(percentage, lang) in githubData.languages" :key="lang" class="lang-item">
              <div class="lang-row">
                <span class="lang-name">{{ lang }}</span>
                <span class="lang-percent">{{ percentage }}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: percentage + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- README -->
        <div v-if="githubData && githubData.readme" class="section">
          <h3 class="section-title"><i class="fas fa-book-open"></i> README.md</h3>
          <div class="readme-content markdown-body" v-html="renderedReadme"></div>
        </div>

        <!-- COMMITS -->
        <div v-if="githubData && githubData.commits && githubData.commits.length" class="section">
          <h3 class="section-title"><i class="fas fa-history"></i> Últimos Commits</h3>
          <ul class="commits-list">
            <li v-for="commit in githubData.commits" :key="commit.sha" class="commit-item">
              <div class="commit-message">{{ commit.message }}</div>
              <div class="commit-meta">
                <span class="commit-author">{{ commit.author }}</span>
                <span class="commit-date">{{ commit.date }}</span>
              </div>
            </li>
          </ul>
        </div>

        <!-- FOOTER -->
        <div class="project-footer">
          <router-link :to="`/${route.params.slug}/projetos`" class="btn btn-back">
            <i class="fas fa-arrow-left"></i> Voltar para Projetos
          </router-link>
        </div>

      </div>

      <div v-else-if="loading" class="not-found">
        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
        <p>Carregando projeto...</p>
      </div>

      <div v-else class="not-found">
        <i class="fas fa-folder-open" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
        <p>Projeto não encontrado.</p>
        <router-link :to="`/${route.params.slug}/projects`" class="btn btn-back">Voltar</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, inject } from 'vue';
import { useRoute } from 'vue-router';
import { usePortfoliosStore } from '@/stores/portfolios';
import { GitHubRepoSDK, GithubUtils } from '@/sdk/GitHubSDK';
import { marked } from 'marked';

const route            = useRoute();
const portfoliosStore  = usePortfoliosStore();
const showToast        = inject("showToast") as (t: { type: string; title: string; message: string }) => void;

const project          = ref<any>(null);
const loading          = ref(true);
const githubData       = ref<any>(null);
const placeholderImage = "https://via.placeholder.com/800x400?text=Project+Cover";

const currentPortfolioId = computed(() => portfoliosStore.activePortfolioId);

const tagList = computed(() => {
  if (!project.value?.tags) return [];
  return Array.isArray(project.value.tags)
    ? project.value.tags
    : project.value.tags.split(',').map((t: string) => t.trim());
});

const renderedReadme = computed(() => {
  if (!githubData.value?.readme) return '';
  return marked(githubData.value.readme);
});

const shareProject = async () => {
  if (!project.value || !currentPortfolioId.value) {
    showToast({ type: "error", title: "Erro", message: "Não foi possível gerar o link." });
    return;
  }
  
  const isDev    = window.location.hostname === "localhost";
  const apiBase  = isDev
    ? "http://127.0.0.1:5001/moises-work-app/us-central1/link"
    : `${window.location.origin}/share`;
    
  // Usa o SLUG se existir, senão o ID
  const projectSlug = project.value.slug || project.value.id;
  const shareUrl = `${apiBase}/${currentPortfolioId.value}/project/${projectSlug}`;

  if (navigator.share) {
    try { 
      await navigator.share({ 
        title: project.value.title, 
        text: project.value.description, 
        url: shareUrl 
      }); 
    } catch (e) { 
      console.log("Compartilhamento cancelado", e); 
    }
  } else {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast({ type: "success", title: "Link Copiado!", message: "Link copiado para a área de transferência." });
    } catch {
      showToast({ type: "error", title: "Erro", message: "Não foi possível copiar o link." });
    }
  }
};

onMounted(async () => {
  const projectSlug = route.params.id as string; // O parâmetro 'id' aqui na rota pode conter o SLUG ou ID
  
  // Garante que os dados estejam carregados
  if (!portfoliosStore.projects || portfoliosStore.projects.length === 0) {
      // Se não temos dados, tentamos carregar usando o slug da rota pai (parametro :slug no router)
      const portfolioSlug = route.params.slug as string;
      if (portfolioSlug) {
          await portfoliosStore.fetchPortfolioData(portfolioSlug);
      } else {
          await portfoliosStore.fetchPortfolioData();
      }
  }
  
  // Tentar encontrar por ID ou por Slug
  project.value = portfoliosStore.projects.find((p: any) => p.id === projectSlug || p.slug === projectSlug);

  if (project.value?.githubUrl) {
    await loadGithubData(project.value.githubUrl);
  }

  loading.value = false;
});

const loadGithubData = async (url: string) => {
  const repoInfo = GithubUtils.parseUrl(url);
  if (!repoInfo) return;

  try {
    const ghSdk = new GitHubRepoSDK(repoInfo.owner, repoInfo.repo);

    const [info, readme, languages, commits] = await Promise.all([
      ghSdk.getRepoInfo().catch(() => ({ stargazers_count: 0, forks_count: 0, open_issues_count: 0, pushed_at: new Date().toISOString() })),
      ghSdk.getReadme().catch(() => ({ decoded: '' })),
      ghSdk.getLanguages().catch(() => ({})),
      ghSdk.getCommits({ per_page: 5 }).catch(() => [])
    ]);

    const totalBytes = Object.values(languages).reduce((a: any, b: any) => a + b, 0) as number;
    const langStats: any = {};
    if (totalBytes > 0) {
      Object.entries(languages).forEach(([lang, bytes]: [string, any]) => {
        const percent = ((bytes / totalBytes) * 100).toFixed(1);
        if (parseFloat(percent) > 1.0) langStats[lang] = percent;
      });
    }

    githubData.value = {
      stars: info.stargazers_count,
      forks: info.forks_count,
      issues: info.open_issues_count,
      lastCommitDate: new Date(info.pushed_at).toLocaleDateString('pt-BR'),
      readme: readme.decoded,
      languages: langStats,
      commits: commits.map((c: any) => ({
        sha: c.sha,
        message: c.commit.message,
        author: c.commit.author.name,
        date: new Date(c.commit.author.date).toLocaleDateString('pt-BR'),
      }))
    };
  } catch (e) {
    console.error("Erro ao carregar dados do GitHub:", e);
  }
};
</script>

<style scoped>
/* ============================================================
   PAGE
   ============================================================ */
.project-page {
  padding: clamp(20px, 4vw, 40px) clamp(16px, 4vw, 20px);
  background-color: var(--background-body);
  color: var(--text-color-body);
  min-height: 100vh;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

/* ============================================================
   WRAPPER
   ============================================================ */
.project-wrapper {
  background: var(--background-card);
  padding: clamp(20px, 5vw, 40px);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

/* ============================================================
   HEADER
   ============================================================ */
.project-header {
  margin-bottom: 0;
}

.project-header h1 {
  font-size: clamp(1.5rem, 5vw, 2.25rem);
  font-weight: 800;
  color: var(--text-color-heading);
  line-height: 1.2;
  margin: 10px 0 15px;
  word-break: break-word;
}

.project-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  font-size: 0.9rem;
  color: var(--text-color-paragraph);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

/* ============================================================
   BADGE
   ============================================================ */
.badge {
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--primary);
  padding: 4px 10px;
  border-radius: 99px;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  display: inline-block;
}

/* ============================================================
   ACTION BUTTONS — mesmo estilo de btn-speech do artigo
   ============================================================ */
.btn-action {
  background: transparent;
  border: 1px solid var(--primary);
  color: var(--primary);
  padding: 4px 12px;
  border-radius: 99px;
  cursor: pointer;
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: background 0.2s, color 0.2s, transform 0.2s;
  white-space: nowrap;
  text-decoration: none;
}

.btn-action:hover {
  background: var(--primary);
  color: white;
  transform: translateY(-1px);
}

.btn-action.btn-demo {
  border-color: #27ae60;
  color: #27ae60;
}

.btn-action.btn-demo:hover {
  background: #27ae60;
  color: white;
}

.btn-action.btn-share {
  border-color: #8b5cf6;
  color: #8b5cf6;
}

.btn-action.btn-share:hover {
  background: #8b5cf6;
  color: white;
}

/* ============================================================
   TAGS — idêntico ao artigo
   ============================================================ */
.project-tags {
  margin-top: 15px;
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-badge {
  background-color: var(--background-body);
  color: var(--primary);
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-family: monospace;
  border: 1px solid var(--timeline-border);
}

/* ============================================================
   IMAGE — sangria negativa igual ao artigo
   ============================================================ */
.image-container {
  margin: 0 calc(-1 * clamp(20px, 5vw, 40px)) 40px;
  overflow: hidden;
}

.project-image {
  width: 100%;
  height: auto;
  max-height: 450px;
  object-fit: cover;
  display: block;
}

/* ============================================================
   BODY
   ============================================================ */
.project-body {
  font-size: clamp(0.95rem, 2vw, 1.125rem);
  line-height: 1.8;
  color: var(--text-color-paragraph);
  margin-bottom: 30px;
  overflow-wrap: break-word;
}

.project-body h2 {
  color: var(--text-color-heading);
  font-size: clamp(1.1rem, 2.5vw, 1.4rem);
  margin-top: 0;
}

/* ============================================================
   GITHUB STATS
   ============================================================ */
.github-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: clamp(8px, 2vw, 15px);
  margin-bottom: 30px;
}

.stat-box {
  background: var(--background-body);
  padding: clamp(10px, 2vw, 15px);
  border-radius: 8px;
  text-align: center;
  border: 1px solid var(--timeline-border);
}

.stat-value {
  display: block;
  font-size: clamp(1rem, 3vw, 1.5rem);
  font-weight: 700;
  color: var(--text-color-heading);
  word-break: break-word;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-color-paragraph);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* ============================================================
   SECTIONS
   ============================================================ */
.section {
  border-top: 1px solid var(--timeline-border);
  padding-top: 30px;
  margin-bottom: 30px;
}

.section-title {
  color: var(--text-color-heading);
  font-size: clamp(1rem, 2.5vw, 1.15rem);
  margin-top: 0;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ============================================================
   LANGUAGES
   ============================================================ */
.languages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.lang-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}

.lang-name {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-color-body);
}

.lang-percent {
  font-size: 0.82rem;
  color: var(--text-color-paragraph);
}

.progress-bar {
  height: 6px;
  background: var(--timeline-border);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 3px;
  transition: width 0.5s ease;
}

/* ============================================================
   README
   ============================================================ */
.readme-content {
  border: 1px solid var(--timeline-border);
  border-radius: 8px;
  padding: clamp(12px, 3vw, 20px);
  max-height: 500px;
  overflow-y: auto;
  overflow-x: auto;
  background: var(--background-body);
}

.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
  font-size: clamp(13px, 1.5vw, 15px);
  line-height: 1.6;
  word-wrap: break-word;
  color: var(--text-color-paragraph);
}

.markdown-body h1,
.markdown-body h2 {
  border-bottom: 1px solid var(--timeline-border);
  padding-bottom: 0.3em;
  color: var(--text-color-heading);
}

.markdown-body code {
  background-color: rgba(27, 31, 35, 0.07);
  border-radius: 3px;
  font-size: 85%;
  padding: 0.2em 0.4em;
}

.markdown-body pre {
  background-color: #1e1e1e;
  border-radius: 6px;
  font-size: 85%;
  line-height: 1.45;
  overflow: auto;
  padding: 16px;
  max-width: 100%;
}

.markdown-body img {
  max-width: 100%;
  height: auto;
}

/* ============================================================
   COMMITS
   ============================================================ */
.commits-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.commit-item {
  border-bottom: 1px solid var(--timeline-border);
  padding: 10px 0;
}

.commit-item:last-child {
  border-bottom: none;
}

.commit-message {
  font-weight: 500;
  color: var(--text-color-body);
  font-size: clamp(0.85rem, 1.5vw, 0.95rem);
  line-height: 1.4;
  word-break: break-word;
}

.commit-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--text-color-paragraph);
  margin-top: 4px;
}

.commit-author {
  font-weight: 600;
}

/* ============================================================
   FOOTER
   ============================================================ */
.project-footer {
  border-top: 1px solid var(--timeline-border);
  margin-top: 40px;
  padding-top: 30px;
  text-align: center;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--primary);
  background: rgba(59, 130, 246, 0.1);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
}

.btn-back:hover {
  background: var(--primary);
  color: white;
}

/* ============================================================
   NOT FOUND / LOADING
   ============================================================ */
.not-found {
  text-align: center;
  padding: clamp(40px, 10vw, 60px) 0;
  color: var(--text-color-paragraph);
}

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 768px) {
  .container {
    padding: 0;
  }

  .project-wrapper {
    border-radius: 0;
    box-shadow: none;
  }

  .github-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  /* Oculta label dos botões, mantém só ícone */
  .btn-action span {
    display: none;
  }

  .btn-action {
    padding: 6px 10px;
  }

  .project-image {
    max-height: 220px;
  }
}

@media (max-width: 360px) {
  .badge,
  .tag-badge {
    font-size: 0.72rem;
    padding: 3px 7px;
  }

  .btn-back {
    padding: 10px 16px;
    font-size: 0.88rem;
  }
}
</style>