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
                  <p class="typing-text">{{ typingText }}<span class="cursor">|</span></p>
                  
                  <div class="social-links">
                      <a href="https://github.com" target="_blank" aria-label="GitHub"><i class="fab fa-github"></i></a>
                      <a href="https://linkedin.com" target="_blank" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
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

      <!-- About Stats -->
      <section class="about" style="padding-top: 0;">
          <div class="container">
              <div class="about-stats">
                  <div v-for="(stat, index) in stats" :key="index" class="stat-card">
                      <i :class="stat.icon" style="font-size: 2rem; color: var(--primary); margin-bottom: 15px;"></i>
                      <div class="counter" ref="counters" :data-target="stat.value">0</div>
                      <p>{{ stat.label }}</p>
                  </div>
              </div>
          </div>
      </section>

      <!-- Projetos Recentes -->
      <section class="portfolio">
          <div class="container">
              <h2>Projetos em Destaque</h2>
              
              <div class="portfolio-grid">
                  <ProjectCard v-for="project in projects" 
                               :key="project.id" 
                               :project="project" />
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
                      <div class="portfolio-info" style="padding: 25px; flex: 1;">
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
import ProjectCard from '@/components/ProjectCard.vue';

const store = useStore();

const typingText = ref('');
const typingIndex = ref(0);
const typingSpeed = ref(100);
const typingTexts = [
    'React | Vue.js | Node.js | IA & Machine Learning',
    'FullStack Developer | Professor | Tech Enthusiast',
    'Turning ideas into digital solutions'
];
const currentTextIndex = ref(0);
const isDeleting = ref(false);

const stats = ref([
    { icon: 'fas fa-code', value: 50, label: 'Projetos Concluídos' },
    { icon: 'fas fa-users', value: 25, label: 'Clientes Satisfeitos' },
    { icon: 'fas fa-hourglass-half', value: 5, label: 'Anos de Experiência' },
    { icon: 'fas fa-chalkboard-teacher', value: 200, label: 'Alunos Ensinados' }
]);

const counters = ref([]);

const projects = computed(() => store.state.projects.slice(0, 3));
const articles = computed(() => store.getters.getLatestArticles(3));

const startTyping = () => {
    const currentText = typingTexts[currentTextIndex.value];
    
    if (isDeleting.value) {
        typingText.value = currentText.substring(0, typingIndex.value - 1);
        typingIndex.value--;
        typingSpeed.value = 50;
    } else {
        typingText.value = currentText.substring(0, typingIndex.value + 1);
        typingIndex.value++;
        typingSpeed.value = 100;
    }
    
    if (!isDeleting.value && typingIndex.value === currentText.length) {
        isDeleting.value = true;
        typingSpeed.value = 2000;
    } else if (isDeleting.value && typingIndex.value === 0) {
        isDeleting.value = false;
        currentTextIndex.value = (currentTextIndex.value + 1) % typingTexts.length;
        typingSpeed.value = 500;
    }
    
    setTimeout(startTyping, typingSpeed.value);
};

const animateCounter = (el, target) => {
    let count = 0;
    const increment = target / 50;
    const update = () => {
        count += increment;
        if (count < target) {
            el.textContent = Math.ceil(count);
            requestAnimationFrame(update);
        } else {
            el.textContent = target + "+";
        }
    };
    update();
};

const setupObserver = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-target'));
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });
    
    if (counters.value) {
        counters.value.forEach(el => observer.observe(el));
    }
};

onMounted(() => {
    startTyping();
    setupObserver();
});
</script>

<style scoped>
.hero {
    padding-top: 180px;
    padding-bottom: 120px;
    position: relative;
    overflow: hidden;
}
/* Outros estilos específicos da Home podem vir aqui */
</style>