<template>
  <div>
      <!-- Hero Section -->
      <section class="hero">
          <div class="container hero-content">
              <div class="hero-text">
                  <span class="hero-badge">
                      <i class="fas fa-rocket"></i>
                      Desenvolvedor FullStack & Professor
                  </span>
                  <h1>Transformando ideias em soluções digitais</h1>
                  <p>Sou um desenvolvedor FullStack com experiência em diversas tecnologias e apaixonado por ensinar programação.</p>
                  <p class="typing-text">{{ typingText }}</p>
                  
                  <div class="social-links">
                      <a href="https://github.com" target="_blank"><i class="fab fa-github"></i></a>
                      <a href="https://linkedin.com" target="_blank"><i class="fab fa-linkedin"></i></a>
                      <a href="https://codepen.io" target="_blank"><i class="fab fa-codepen"></i></a>
                  </div>
                  
                  <div style="margin-top: 40px; display: flex; gap: 15px; flex-wrap: wrap;">
                      <router-link to="/portfolio" class="btn">
                          <i class="fas fa-eye"></i> Ver Projetos
                      </router-link>
                      <router-link to="/contato" class="btn btn-secondary">
                          <i class="fas fa-paper-plane"></i> Contato
                      </router-link>
                  </div>
              </div>
              
              <div class="hero-image">
                  <div class="image-wrapper">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80" alt="Moisés Felix">
                  </div>
              </div>
          </div>
      </section>

      <!-- About -->
      <section class="about">
          <div class="container">
              <h2>Sobre Mim</h2>
              <p>Com mais de 5 anos de experiência em desenvolvimento web e mobile.</p>
              
              <div class="about-stats">
                  <div class="stat-card">
                      <i class="fas fa-code"></i>
                      <div class="counter">50</div>
                      <p>Projetos Concluídos</p>
                  </div>
                  
                  <div class="stat-card">
                      <i class="fas fa-users"></i>
                      <div class="counter">25</div>
                      <p>Clientes Satisfeitos</p>
                  </div>
                  
                  <div class="stat-card">
                      <i class="fas fa-hourglass-half"></i>
                      <div class="counter">5</div>
                      <p>Anos de Experiência</p>
                  </div>
                  
                  <div class="stat-card">
                      <i class="fas fa-chalkboard-teacher"></i>
                      <div class="counter">200</div>
                      <p>Alunos Ensinados</p>
                  </div>
              </div>
          </div>
      </section>

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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const typingText = ref('');
const typingIndex = ref(0);
const typingSpeed = 100;
const typingTexts = [
    'React | Vue.js | Node.js | IA & Machine Learning',
    'FullStack Developer | Professor | Tech Enthusiast',
    'Turning ideas into digital solutions'
];
const currentTextIndex = ref(0);

const projects = computed(() => store.state.projects);
const articles = computed(() => store.getters.getLatestArticles(3));

const startTyping = () => {
    const type = () => {
        const currentText = typingTexts[currentTextIndex.value];
        
        if (typingIndex.value < currentText.length) {
            typingText.value += currentText.charAt(typingIndex.value);
            typingIndex.value++;
            setTimeout(type, typingSpeed);
        } else {
            setTimeout(() => {
                deleteText();
            }, 2000);
        }
    };
    
    type();
};

const deleteText = () => {
    if (typingText.value.length > 0) {
        typingText.value = typingText.value.slice(0, -1);
        setTimeout(() => deleteText(), 50);
    } else {
        typingIndex.value = 0;
        currentTextIndex.value = (currentTextIndex.value + 1) % typingTexts.length;
        setTimeout(() => startTyping(), 500);
    }
};

const animateCounters = () => {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = parseInt(counter.textContent);
        let count = 0;
        const increment = target / 100;
        
        const updateCounter = () => {
            if (count < target) {
                count += increment;
                counter.textContent = Math.floor(count);
                setTimeout(updateCounter, 20);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    });
};

onMounted(() => {
    startTyping();
    animateCounters();
});
</script>
