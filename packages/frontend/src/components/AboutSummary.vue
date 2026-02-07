<template>
  <section class="about-summary">
    <div class="container">
      <div class="about-summary-content">
      
        <div class="about-text">
          <h2>Sobre Mim</h2>
          <p>Com mais de 5 anos de experiência em desenvolvimento web e mobile, atuei em projetos desafiadores que vão desde e-commerces até sistemas complexos com integração de IA e machine learning.</p>
          <router-link to="/sobre" class="btn btn-secondary">Saiba Mais</router-link>
        </div>
      </div>
      <div class="stats">
        <div class="stat-item">
          <span class="stat-number">50+</span>
          <span class="stat-label">Projetos Concluídos</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">25+</span>
          <span class="stat-label">Clientes Satisfeitos</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">5+</span>
          <span class="stat-label">Anos de Experiência</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">200+</span>
          <span class="stat-label">Alunos Ensinados</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.about-summary {
  background-color: var(--dark-light);
}

.about-summary-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: center;
  margin-bottom: 4rem;
}

.about-image {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid var(--primary);
  margin: 0 auto;
}

.about-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.about-text {
  text-align: center;
}

.about-text h2 {
  text-align: center;
}

.about-text h2::after {
  /* Alinha o sublinhado do h2 com o texto */
  left: 50%;
  transform: translateX(-50%);
}

@media (min-width: 768px) {
  .about-summary-content {
    grid-template-columns: 1fr 2fr;
    gap: 3rem;
  }
  .about-text {
    text-align: left;
  }
  .about-text h2 {
    text-align: left;
  }
  .about-text h2::after {
    left: 0;
    transform: none;
  }
  .about-image {
    margin: 0;
  }
}

/* --- Stats Section --- */
.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: clamp(2rem, 5vw, 2.5rem);
  font-weight: 700;
  color: var(--primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--gray);
}

@media (min-width: 768px) {
  .stats {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>