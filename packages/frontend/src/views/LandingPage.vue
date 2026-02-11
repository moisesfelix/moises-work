<template>
  <div class="landing-page">
    <TheHeader />

    <main>
      <section class="hero-section">
        <div class="container">
          <div class="hero-content">
            <h1>Crie um Portfólio Incrível com o Poder da IA</h1>
            <p>
              Destaque seus projetos, artigos e experiências em minutos. 
              Nossa plataforma inteligente ajuda você a construir uma presença online profissional sem esforço.
            </p>
            <div class="cta-buttons">
              <router-link to="/login" class="btn btn-lg btn-primary">Começar Agora</router-link>
              <a href="#features" class="btn btn-lg btn-outline">Saiba Mais</a>
            </div>
          </div>
          <div class="hero-visual">
            <div class="visual-placeholder">
              <i class="fas fa-magic"></i>
              <span>IA Dashboard</span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" class="features-section">
        <div class="container">
          <h2>Feed da Comunidade</h2>
          <div v-if="globalArticles && globalArticles.length" class="feed-grid">
             <div v-for="article in globalArticles" :key="article.id" class="feed-item">
                 <router-link :to="`/${article.sourceSlug}/artigo/${article.slug}`" class="feed-link">
                    <div class="feed-img" :style="{ backgroundImage: `url(${article.image || 'https://via.placeholder.com/400x200'})` }"></div>
                    <div class="feed-content">
                        <span class="feed-author">Por {{ article.authorName || 'Usuário' }}</span>
                        <h3>{{ article.title }}</h3>
                        <p>{{ article.excerpt }}</p>
                    </div>
                 </router-link>
             </div>
          </div>
          <p v-else class="text-center">Nenhum artigo recente encontrado.</p>
        </div>
      </section>

      <section class="features-section-alt">
        <div class="container">
          <h2>Por que usar nossa plataforma?</h2>
          <div class="features-grid">
            <div class="feature-card">
              <i class="fas fa-bolt"></i>
              <h3>Rápido e Fácil</h3>
              <p>Configure seu portfólio em poucos cliques usando nossa interface intuitiva.</p>
            </div>
            <div class="feature-card">
              <i class="fas fa-robot"></i>
              <h3>Alimentado por IA</h3>
              <p>Gere descrições e conteúdos otimizados para seus projetos automaticamente.</p>
            </div>
            <div class="feature-card">
              <i class="fas fa-mobile-alt"></i>
              <h3>Totalmente Responsivo</h3>
              <p>Seu portfólio ficará perfeito em qualquer dispositivo, do celular ao desktop.</p>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="landing-footer">
      <div class="container">
        <p>&copy; {{ new Date().getFullYear() }} moises.work - Todos os direitos reservados.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import TheHeader from '@/components/TheHeader.vue';
</script>

<style scoped>
.landing-page {
  font-family: 'Inter', sans-serif;
  color: var(--text-color-heading);
  background-color: var(--background-body);
  padding-top: var(--header-height); /* Ensure content doesn't hide behind fixed header */
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Header - Removed internal header styles as we use TheHeader */

/* Hero */
.hero-section {
  padding: 5rem 0;
  display: flex;
  align-items: center;
  min-height: 80vh;
}
.hero-section .container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}
.hero-content h1 {
  font-size: 3.5rem;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  background: linear-gradient(to right, var(--primary), #8a2be2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.hero-content p {
  font-size: 1.25rem;
  color: var(--text-color-body);
  margin-bottom: 2.5rem;
  line-height: 1.6;
}
.cta-buttons {
  display: flex;
  gap: 1rem;
}
.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

/* Visual Placeholder */
.visual-placeholder {
  background: var(--background-secondary);
  border-radius: 20px;
  height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 2rem;
  color: var(--text-color-body);
  border: 1px dashed var(--border-color);
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}
.visual-placeholder i {
  font-size: 4rem;
  margin-bottom: 1rem;
  color: var(--primary);
}

/* Features */
.features-section {
  padding: 5rem 0;
  background-color: var(--background-secondary);
}
.features-section h2 {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}
.feature-card {
  background: var(--background-body);
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.3s;
  border: 1px solid var(--border-color);
}
.feature-card:hover {
  transform: translateY(-5px);
}
.feature-card i {
  font-size: 2.5rem;
  color: var(--primary);
  margin-bottom: 1.5rem;
}
.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

/* Footer */
.landing-footer {
  padding: 2rem 0;
  text-align: center;
  border-top: 1px solid var(--border-color);
  color: var(--text-color-body);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-section .container {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .cta-buttons {
    justify-content: center;
  }
  .hero-content h1 {
    font-size: 2.5rem;
  }
}
</style>