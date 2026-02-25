<template>
    <main>
        <section class="hero">
            <div class="container hero-content">
                <div class="hero-text">
                    <span class="hero-badge">Desenvolvedor FullStack</span>
                    <h1>{{ about?.title || 'Moisés Felix' }}</h1>
                    <p>{{ about?.excerpt || about?.description || 'Transformando ideias complexas em soluções digitais elegantes e eficientes. Apaixonado por ensinar e aplicar tecnologias de ponta, incluindo IA e Machine Learning.' }}</p>
                    <div class="social-links" v-if="contact">
                        <a v-if="contact.github" :href="contact.github" target="_blank" class="btn">
                            <i class="fab fa-github"></i> GitHub
                        </a>
                        <a v-if="contact.linkedin" :href="contact.linkedin" target="_blank" class="btn btn-secondary">
                            <i class="fab fa-linkedin"></i> LinkedIn
                        </a>
                    </div>

                    <!-- Barra de Busca Global -->
                    <div class="global-search-container">
                        <div class="search-input-wrapper">
                            <i class="fas fa-search search-icon"></i>
                            <input 
                                v-model="searchQuery" 
                                type="text" 
                                placeholder="O que você procura? (Projetos, Artigos, Skills...)" 
                                class="search-input"
                                @keyup.enter="performSearch"
                            >
                            <button v-if="searchQuery" @click="clearSearch" class="clear-btn">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="hero-image" v-if="about?.image">
                    <div class="image-wrapper">
                        <img :src="about.image" :alt="about.title">
                    </div>
                </div>
            </div>
        </section>

        <!-- Resultados da Busca Global -->
        <section v-if="searchQuery" class="search-results-section" id="search-results">
            <div class="container">
                <div class="section-header">
                    <h2>Resultados da Busca</h2>
                    <p>Exibindo resultados para: <strong>"{{ searchQuery }}"</strong></p>
                </div>

                <div v-if="totalResults === 0" class="no-results">
                    <i class="fas fa-search"></i>
                    <p>Nenhum resultado encontrado em todo o portfólio.</p>
                    <button @click="clearSearch" class="btn btn-secondary">Limpar Busca</button>
                </div>

                <div v-else class="results-grid">
                    <!-- Projetos Encontrados -->
                    <div v-if="searchResults.projects.length > 0" class="result-group">
                        <h3><i class="fas fa-project-diagram"></i> Projetos ({{ searchResults.projects.length }})</h3>
                        <div class="portfolio-grid">
                            <div v-for="project in searchResults.projects" :key="project.id" class="portfolio-item">
                                <div class="portfolio-img">
                                    <img :src="project.image" :alt="project.title">
                                </div>
                                <div class="portfolio-info" style="padding: 25px;">
                                    <h3 v-html="highlightText(project.title)"></h3>
                                    <p v-html="highlightText(project.description)"></p>
                                    <div class="portfolio-tags">
                                        <span v-for="tag in project.tags" :key="tag" class="tech-tag" v-html="highlightText(tag)"></span>
                                    </div>
                                    <router-link :to="`/${currentSlug}/projeto/${project.id}`" class="btn-link">
                                        Ver Detalhes <i class="fas fa-arrow-right"></i>
                                    </router-link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Artigos Encontrados -->
                    <div v-if="searchResults.articles.length > 0" class="result-group">
                        <h3><i class="fas fa-newspaper"></i> Artigos ({{ searchResults.articles.length }})</h3>
                        <div class="blog-grid">
                            <div v-for="article in searchResults.articles" :key="article.id" class="blog-item">
                                <div class="portfolio-info" style="padding: 20px;">
                                    <div class="blog-category" v-html="highlightText(article.category)"></div>
                                    <h4 v-html="highlightText(article.title)"></h4>
                                    
                                    <span v-if="article.matchLabel" class="match-badge">{{ article.matchLabel }}</span>
                                    <p class="small-excerpt" v-html="highlightText(article.displayExcerpt)"></p>
                                    
                                    <router-link :to="`/${currentSlug}/artigo/${article.slug}`" class="btn-link">
                                        Ler Artigo <i class="fas fa-arrow-right"></i>
                                    </router-link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tutoriais Encontrados -->
                    <div v-if="searchResults.tutorials.length > 0" class="result-group">
                        <h3><i class="fas fa-graduation-cap"></i> Tutoriais ({{ searchResults.tutorials.length }})</h3>
                        <div class="blog-grid">
                            <div v-for="tutorial in searchResults.tutorials" :key="tutorial.id" class="blog-item">
                                <div class="portfolio-info" style="padding: 20px;">
                                    <div class="blog-category" v-html="highlightText(tutorial.category)"></div>
                                    <h4 v-html="highlightText(tutorial.title)"></h4>
                                    <p class="small-excerpt" v-html="highlightText(tutorial.description)"></p>
                                    <router-link :to="`/${currentSlug}/tutorial/${tutorial.slug}`" class="btn-link">
                                        Ver Tutorial <i class="fas fa-arrow-right"></i>
                                    </router-link>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Skills Encontradas -->
                    <div v-if="searchResults.skills.length > 0" class="result-group">
                        <h3><i class="fas fa-code"></i> Habilidades ({{ searchResults.skills.length }})</h3>
                        <div class="skills-results-grid">
                            <div v-for="skill in searchResults.skills" :key="skill.name" class="skill-card-mini">
                                <span class="skill-name" v-html="highlightText(skill.name)"></span>
                                <div class="skill-bar-mini">
                                    <div class="skill-fill" :style="{ width: skill.percent + '%' }"></div>
                                </div>
                                <span class="skill-percent">{{ skill.percent }}%</span>
                                <span class="skill-cat-badge">{{ skill.category }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <div v-else>
            <!-- Conteúdo Normal da Home (quando não há busca) -->
            <!-- Seção "Sobre Mim" refatorada em um componente -->
            <AboutSummary />

            <!-- Projetos Recentes -->
            <section class="portfolio">
              <div class="container">
                  <h2>Projetos em Destaque</h2>
                  
                  <div class="portfolio-grid">
                      <div v-for="project in projects.slice(0, 3)" :key="project.id">
                          <ProjectCard :project="project" />
                      </div>
                  </div>
                  
                  <div style="text-align: center; margin-top: 50px;">
                      <router-link :to="`/${currentSlug}/projetos`" class="btn">
                          <i class="fas fa-th-list"></i> Ver Todos os Projetos
                      </router-link>
                  </div>
              </div>
      </section>

          <!-- Artigos Recentes -->
          <section class="blog">
              <div class="container">
                  <h2>Artigos Recentes</h2>
                  
                  <div class="blog-grid">
                      <div v-for="article in articles" :key="article.id" class="blog-item">
                          <div class="portfolio-img">
                              <img :src="article.image" :alt="article.title">
                              <div class="blog-category">{{ article.category }}</div>
                          </div>
                          <div class="portfolio-info" style="padding: 25px;">
                              <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                                  <span><i class="fas fa-calendar"></i> {{ article.date }}</span>
                                  <span><i class="far fa-clock"></i> {{ article.readTime }}</span>
                              </div>
                              <h3>{{ article.title }}</h3>
                              <p>{{ article.excerpt }}</p>
                              <router-link :to="`/${currentSlug}/artigo/${article.slug}`" class="btn" style="margin-top: 20px; padding: 10px 25px;">
                                  <i class="fas fa-book-open"></i> Ler Artigo
                              </router-link>
                          </div>
                      </div>
                  </div>
              </div>
      </section>
        </div>
    </main>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { usePortfoliosStore } from "@/stores/portfolios";
import { useRoute } from "vue-router";
import AboutSummary from "@/components/AboutSummary.vue";
import ProjectCard  from "@/components/ProjectCard.vue";

const route           = useRoute();
const portfoliosStore = usePortfoliosStore();

const currentSlug = computed(() => route.params.slug);
const about       = computed(() => portfoliosStore.about);
const contact     = computed(() => portfoliosStore.contact);
const projects    = computed(() => portfoliosStore.projects || []);
const articles    = computed(() =>
  [...(portfoliosStore.articles || [])]
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
);

// --- Lógica de Busca Global ---
const searchQuery = ref("");
const searchResults = ref({
    projects: [] as any[],
    articles: [] as any[],
    tutorials: [] as any[],
    skills: [] as any[]
});

const totalResults = computed(() => {
    return searchResults.value.projects.length +
           searchResults.value.articles.length +
           searchResults.value.tutorials.length +
           searchResults.value.skills.length;
});

const performSearch = () => {
    if (!searchQuery.value.trim()) {
        clearSearch();
        return;
    }

    const query = searchQuery.value.toLowerCase();
    const store = portfoliosStore;

    // Buscar em Projetos
    searchResults.value.projects = (store.projects || []).filter((p: any) => {
        return (p.title || "").toLowerCase().includes(query) ||
               (p.description || "").toLowerCase().includes(query) ||
               (p.technologies || []).some((t: string) => t.toLowerCase().includes(query));
    });

    // Buscar em Artigos
    searchResults.value.articles = (store.articles || []).map((a: any) => {
        const title = (a.title || "");
        const excerpt = (a.excerpt || "");
        const category = (a.category || "");
        // Concatenar tags em uma string para busca
        const tags = Array.isArray(a.tags) ? a.tags.join(" ") : (a.tags || "");
        // Remover tags HTML para buscar no texto puro
        const contentRaw = a.content ? a.content.replace(/<[^>]*>?/gm, ' ') : "";

        const foundTitle = title.toLowerCase().includes(query);
        const foundExcerpt = excerpt.toLowerCase().includes(query);
        const foundCategory = category.toLowerCase().includes(query);
        const foundTags = tags.toLowerCase().includes(query);
        const foundContent = contentRaw.toLowerCase().includes(query);

        if (foundTitle || foundExcerpt || foundCategory || foundTags || foundContent) {
            let displayExcerpt = excerpt;
            let matchLabel = "";

            // Prioridade de exibição do contexto
            if (foundContent && !foundTitle && !foundExcerpt && !foundTags) {
                 const idx = contentRaw.toLowerCase().indexOf(query);
                 const start = Math.max(0, idx - 60);
                 const end = Math.min(contentRaw.length, idx + query.length + 60);
                 displayExcerpt = "..." + contentRaw.substring(start, end) + "...";
                 matchLabel = "Encontrado no conteúdo";
            } else if (foundTags && !foundTitle) {
                matchLabel = "Encontrado em tags";
            }

            return { 
                ...a, 
                displayExcerpt,
                matchLabel
            };
        }
        return null;
    }).filter(Boolean);

    // Buscar em Tutoriais
    searchResults.value.tutorials = (store.tutorials || []).filter((t: any) => {
        return (t.title || "").toLowerCase().includes(query) ||
               (t.description || "").toLowerCase().includes(query) ||
               (t.category || "").toLowerCase().includes(query);
    });

    // Buscar em Skills
    searchResults.value.skills = [];
    Object.entries(store.skills || {}).forEach(([category, skillsList]: [string, any[]]) => {
        skillsList.forEach((skill: any) => {
            if (skill.name.toLowerCase().includes(query)) {
                searchResults.value.skills.push({ ...skill, category });
            }
        });
    });

    // Scroll para resultados se houver busca
    if (query) {
        setTimeout(() => {
            const el = document.getElementById("search-results");
            if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 100);
    }
};

const clearSearch = () => {
    searchQuery.value = "";
    searchResults.value = { projects: [], articles: [], tutorials: [], skills: [] };
};

// Observar mudanças no input para busca "ao vivo" (opcional, pode ser removido se quiser só no Enter)
watch(searchQuery, (newVal) => {
    if (newVal.trim().length > 2) {
        performSearch();
    } else if (newVal.trim().length === 0) {
        clearSearch();
    }
});

const highlightText = (text: string) => {
    if (!searchQuery.value || !text) return text;
    const regex = new RegExp(`(${searchQuery.value})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
};
</script>

<style scoped>
/* Highlight */
:deep(.highlight) {
    background-color: yellow;
    color: black;
    font-weight: bold;
    padding: 0 2px;
    border-radius: 2px;
}

/* Estilos da Busca Global */
.global-search-container {
    margin-top: 2rem;
    width: 100%;
    max-width: 600px;
}

.search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.search-input {
    width: 100%;
    padding: 1rem 3rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50px;
    color: white;
    font-size: 1rem;
    backdrop-filter: blur(5px);
    transition: all 0.3s ease;
}

.search-input:focus {
    background: rgba(255, 255, 255, 0.15);
    border-color: var(--primary);
    outline: none;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.2);
}

.search-icon {
    position: absolute;
    left: 1.2rem;
    color: rgba(255, 255, 255, 0.6);
}

.clear-btn {
    position: absolute;
    right: 1.2rem;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    font-size: 1rem;
}

.clear-btn:hover {
    color: white;
}

/* Resultados da Busca */
.search-results-section {
    padding: 4rem 0;
    background: var(--dark-light);
    min-height: 50vh;
}

.section-header {
    margin-bottom: 3rem;
    text-align: center;
}

.result-group {
    margin-bottom: 4rem;
}

.result-group h3 {
    margin-bottom: 1.5rem;
    color: var(--primary);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.no-results {
    text-align: center;
    padding: 4rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: var(--radius);
    margin-top: 2rem;
}

.no-results i {
    font-size: 3rem;
    color: var(--gray);
    margin-bottom: 1rem;
}

.small-excerpt {
    font-size: 0.9rem;
    color: var(--gray);
    margin: 0.5rem 0 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.btn-link {
    color: var(--primary);
    font-weight: 600;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
}

.btn-link:hover {
    text-decoration: underline;
}

.match-badge {
    display: inline-block;
    font-size: 0.75rem;
    background: rgba(255, 255, 0, 0.15);
    color: #ffeb3b;
    padding: 2px 6px;
    border-radius: 4px;
    margin-bottom: 0.5rem;
    border: 1px solid rgba(255, 255, 0, 0.3);
}

/* Grid de Skills Mini */
.skills-results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
}

.skill-card-mini {
    background: rgba(255, 255, 255, 0.05);
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.skill-name {
    font-weight: 600;
    color: white;
}

.skill-bar-mini {
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
}

.skill-fill {
    height: 100%;
    background: var(--primary);
}

.skill-cat-badge {
    font-size: 0.7rem;
    background: rgba(59, 130, 246, 0.2);
    color: var(--primary-light);
    padding: 2px 6px;
    border-radius: 4px;
    align-self: flex-start;
}
</style>

