<template>
    <main>
        <section class="hero">
            <div class="container hero-content">
                <div class="hero-text">
                    <span class="hero-badge">Desenvolvedor FullStack & Professor</span>
                    <h1>Moisés Felix</h1>
                    <p>Transformando ideias complexas em soluções digitais elegantes e eficientes. Apaixonado por ensinar e aplicar tecnologias de ponta, incluindo IA e Machine Learning.</p>
                    <div class="social-links">
                        <a href="https://github.com/moises-felix" target="_blank" class="btn">GitHub</a>
                        <a href="https://linkedin.com/in/moises-felix" target="_blank" class="btn btn-secondary">LinkedIn</a>
                    </div>
                </div>
                
                <div class="hero-image">
                    <div class="image-wrapper">
                        <img src="https://media.licdn.com/dms/image/v2/D4D03AQFq7OqKaCPTkQ/profile-displayphoto-scale_400_400/B4DZwbgAV5J0Ag-/0/1769987904145?e=1772064000&v=beta&t=J-IL4IkEeiYzI7qeo6buqKaj0sM-k1kB0AVlpFo26zY" alt="Moisés Felix">
                    </div>
                </div>
            </div>
        </section>

        <!-- Seção "Sobre Mim" refatorada em um componente -->
        <AboutSummary />

        <!-- Projetos Recentes -->
        <section class="portfolio">
          <div class="container">
              <h2>Projetos em Destaque</h2>
              
              <div class="portfolio-grid">
                  <div v-for="project in projects.slice(0, 3)" :key="project.id" class="portfolio-item">
                      <div class="portfolio-img">
                          <img :src="project.image" :alt="project.title">
                      </div>
                      <div class="portfolio-info" style="padding: 25px;">
                          <h3>{{ project.title }}</h3>
                          <p>{{ project.description }}</p>
                          <div class="portfolio-tags">
                              <span v-for="tag in project.tags" :key="tag" class="tech-tag">{{ tag }}</span>
                          </div>
                      </div>
                  </div>
              </div>
              
              <div style="text-align: center; margin-top: 50px;">
                  <router-link to="/portfolio" class="btn">
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
                          <router-link :to="'/artigo/' + article.slug" class="btn" style="margin-top: 20px; padding: 10px 25px;">
                              <i class="fas fa-book-open"></i> Ler Artigo
                          </router-link>
                      </div>
                  </div>
              </div>
          </div>
      </section>
    </main>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import AboutSummary from '@/components/AboutSummary.vue';

const store = useStore();

const projects = computed(() => store.state.projects);
const articles = computed(() => store.getters.getLatestArticles(3));
</script>

