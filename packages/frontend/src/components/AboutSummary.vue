<template>
  <section class="about-summary">
    <div class="container">

      <div class="stats">
        <div class="stat-item">
          <span class="stat-number">{{ projectsCount }}+</span>
          <span class="stat-label">Projetos Portifólio</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ skillsCategoriesCount }}+</span>
          <span class="stat-label">Habilidades Técnicas</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ experienceCount }}+</span>
          <span class="stat-label">Experiências</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ contentCount }}+</span>
          <span class="stat-label">Artigos e Tutorias</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { usePortfoliosStore } from "@/stores/portfolios";

const portfoliosStore     = usePortfoliosStore();
const projectsCount       = computed(() => portfoliosStore.projects?.length || 0);
const skillsCount         = computed(() => portfoliosStore.skills ? Object.keys(portfoliosStore.skills).length : 0);
const experienceCount     = computed(() => portfoliosStore.experiences?.length || 0);
const contentCount        = computed(() => (portfoliosStore.articles?.length || 0) + (portfoliosStore.tutorials?.length || 0));
</script>

<style scoped>

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
  .about-image {
    margin: 0;
  }
}

/* --- Stats Section --- */
.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  padding-top: 3rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  color: var(--primary);
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  color: var(--gray);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}

@media (min-width: 768px) {
  .stats {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>