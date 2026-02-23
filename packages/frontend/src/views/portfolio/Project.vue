<template>
  <div class="project-details-page" v-if="project">
    <header class="project-header" :style="{ backgroundImage: `url(${project.image || placeholderImage})` }">
      <div class="overlay"></div>
      <div class="container header-content">
        <span class="category-badge">{{ project.category || 'Geral' }}</span>
        <h1 class="project-title">{{ project.title }}</h1>
        <div class="project-meta">
          <div class="tags">
            <span v-for="tag in tagList" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </header>

    <div class="container content-grid">
      <main class="main-content">
        <section class="description-section">
          <h2>Sobre o Projeto</h2>
          <p class="description-text">{{ project.description }}</p>
        </section>

        <!-- GitHub Integration Section -->
        <section v-if="githubData" class="github-section">
          <div class="github-header">
            <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" class="github-logo" />
            <h3>Repositório GitHub</h3>
            <a :href="project.githubUrl" target="_blank" class="github-link">Ver no GitHub &nearr;</a>
          </div>

          <div class="github-stats">
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

          <div v-if="githubData.readme" class="readme-content">
            <h4>README.md</h4>
            <div class="markdown-body" v-html="renderedReadme"></div>
          </div>
        </section>

        <!-- Commits History -->
        <section v-if="githubData && githubData.commits && githubData.commits.length" class="commits-section">
            <h3>Últimos Commits</h3>
            <ul class="commits-list">
                <li v-for="commit in githubData.commits" :key="commit.sha" class="commit-item">
                    <div class="commit-message">{{ commit.message }}</div>
                    <div class="commit-meta">
                        <span class="commit-author">{{ commit.author }}</span>
                        <span class="commit-date">{{ commit.date }}</span>
                    </div>
                </li>
            </ul>
        </section>

      </main>

      <aside class="sidebar">
        <div class="sidebar-card">
          <h3>Links do Projeto</h3>
          <ul class="project-links">
            <li v-if="project.githubUrl">
              <a :href="project.githubUrl" target="_blank" class="btn btn-github">
                <i class="fab fa-github"></i> Código Fonte
              </a>
            </li>
            <li v-if="project.demoUrl">
              <a :href="project.demoUrl" target="_blank" class="btn btn-demo">
                <i class="fas fa-external-link-alt"></i> Live Demo
              </a>
            </li>
            <li v-if="project.articleUrl">
              <a :href="project.articleUrl" target="_blank" class="btn btn-outline">
                Ler Artigo
              </a>
            </li>
            <li v-if="project.tutorialUrl">
              <a :href="project.tutorialUrl" target="_blank" class="btn btn-outline">
                Ver Tutorial
              </a>
            </li>
          </ul>
        </div>

        <div class="sidebar-card" v-if="githubData && githubData.languages">
            <h3>Linguagens</h3>
            <div class="languages-list">
                <div v-for="(percentage, lang) in githubData.languages" :key="lang" class="lang-item">
                    <span class="lang-name">{{ lang }}</span>
                    <span class="lang-percent">{{ percentage }}%</span>
                    <div class="progress-bar">
                        <div class="progress-fill" :style="{ width: percentage + '%' }"></div>
                    </div>
                </div>
            </div>
        </div>
      </aside>
    </div>
  </div>
  <div v-else-if="loading" class="loading-state">
    Carregando projeto...
  </div>
 <div v-else class="error-state">
        Projeto não encontrado.
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { usePortfoliosStore } from '@/stores/portfolios';
import { GitHubRepoSDK, GithubUtils } from '@/sdk/GitHubSDK';
import { marked } from 'marked'; // Assumindo que você tem marked instalado ou similar para renderizar MD

const route = useRoute();
const portfoliosStore = usePortfoliosStore();
const project = ref<any>(null);
const loading = ref(true);
const githubData = ref<any>(null);
const placeholderImage = "https://via.placeholder.com/1200x400?text=Project+Cover";

const tagList = computed(() => {
    if (!project.value?.tags) return [];
    return Array.isArray(project.value.tags) ? project.value.tags : project.value.tags.split(',').map((t: string) => t.trim());
});

const renderedReadme = computed(() => {
    if (!githubData.value?.readme) return '';
    return marked(githubData.value.readme);
});

onMounted(async () => {
    const projectId = route.params.id as string;
    await portfoliosStore.fetchPortfolioData();
    project.value = portfoliosStore.projects.find((p: any) => p.id === projectId);
    
    if (project.value && project.value.githubUrl) {
        await loadGithubData(project.value.githubUrl);
    }
    
    loading.value = false;
});

const loadGithubData = async (url: string) => {
    const repoInfo = GithubUtils.parseUrl(url);
    if (!repoInfo) return;

    try {
        const ghSdk = new GitHubRepoSDK(repoInfo.owner, repoInfo.repo);
        
        // Parallel requests for speed
        const [info, readme, languages, commits] = await Promise.all([
            ghSdk.getRepoInfo().catch(() => ({ stargazers_count: 0, forks_count: 0, open_issues_count: 0, pushed_at: new Date().toISOString() })),
            ghSdk.getReadme().catch(() => ({ decoded: '' })),
            ghSdk.getLanguages().catch(() => ({})),
            ghSdk.getCommits({ per_page: 5 }).catch(() => ([]))
        ]);

        // Process Languages to percentages
        const totalBytes = Object.values(languages).reduce((a: any, b: any) => a + b, 0) as number;
        const langStats: any = {};
        if (totalBytes > 0) {
          Object.entries(languages).forEach(([lang, bytes]: [string, any]) => {
            const percent = ((bytes / totalBytes) * 100).toFixed(1);
            if (parseFloat(percent) > 1.0) langStats[lang] = percent; // Filter tiny bits
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
                message: c.commit.message,
                author: c.commit.author.name,
                date: new Date(c.commit.author.date).toLocaleDateString('pt-BR'),
                sha: c.sha
            }))
        };
    } catch (e) {
        console.error("Erro ao carregar dados do GitHub:", e);
    }
};

</script>

<style scoped>
.project-details-page {
  background-color: #f8f9fa;
  min-height: 100vh;
  padding-bottom: 50px;
}

.project-header {
  height: 400px;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: flex-end;
  color: white;
}

.overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
}

.header-content {
  position: relative;
  z-index: 2;
  padding-bottom: 40px;
  width: 100%;
}

.category-badge {
  background: #5b5fab;
  padding: 5px 15px;
  border-radius: 20px;
  text-transform: uppercase;
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 10px;
  display: inline-block;
}

.project-title {
  font-size: 3rem;
  margin: 10px 0;
  font-weight: 800;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
  margin-top: 40px;
}

.main-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.sidebar-card h3 {
  margin-top: 0;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 15px;
  font-size: 1.1rem;
}

.project-links {
  list-style: none;
  padding: 0;
}

.project-links li {
  margin-bottom: 10px;
}

.btn {
  display: block;
  text-align: center;
  padding: 12px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: 0.2s;
}

.btn-github { background: #24292e; color: white; }
.btn-demo { background: #27ae60; color: white; }
.btn-outline { border: 1px solid #ddd; color: #555; }
.btn:hover { opacity: 0.9; transform: translateY(-2px); }

/* GitHub Section Styles */
.github-section {
  margin-top: 40px;
  border-top: 1px solid #eee;
  padding-top: 30px;
}

.github-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.github-logo { width: 32px; height: 32px; }

.github-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 30px;
}

.stat-box {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 0.8rem;
  color: #666;
  text-transform: uppercase;
}

.readme-content {
  background: #fff;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  padding: 20px;
  max-height: 500px;
  overflow-y: auto;
}

/* Commits */
.commits-list {
  list-style: none;
  padding: 0;
}

.commit-item {
  border-bottom: 1px solid #eee;
  padding: 10px 0;
}

.commit-message {
  font-weight: 500;
  color: #333;
}

.commit-meta {
  font-size: 0.85rem;
  color: #888;
  margin-top: 4px;
}

/* Languages */
.lang-item { margin-bottom: 10px; }
.lang-name { font-weight: 600; font-size: 0.9rem; }
.lang-percent { float: right; font-size: 0.85rem; color: #666; }
.progress-bar {
  height: 6px;
  background: #eee;
  border-radius: 3px;
  margin-top: 4px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #5b5fab;
}

.loading-state, .error-state {
  text-align: center;
  padding: 100px;
  font-size: 1.5rem;
  color: #666;
}

@media (max-width: 768px) {
  .content-grid { grid-template-columns: 1fr; }
  .github-stats { grid-template-columns: repeat(2, 1fr); }
}

/* Markdown styling simplified */
.markdown-body { font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif; font-size: 16px; line-height: 1.5; word-wrap: break-word; }
.markdown-body h1, .markdown-body h2 { border-bottom: 1px solid #eaecef; padding-bottom: .3em; }
.markdown-body code { background-color: rgba(27,31,35,.05); border-radius: 3px; font-size: 85%; margin: 0; padding: .2em .4em; }
.markdown-body pre { background-color: #f6f8fa; border-radius: 3px; font-size: 85%; line-height: 1.45; overflow: auto; padding: 16px; }
</style>