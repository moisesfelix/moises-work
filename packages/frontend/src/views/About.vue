<template>
  <section class="about" id="about">
    <div class="container">
      <h2>Sobre Mim</h2>
      <div v-if="about" class="about-content">
        <div class="about-image">
          <img :src="about.image" :alt="about.title">
        </div>
        <div class="about-text">
          <h3>{{ about.title }}</h3>
          <p v-html="about.description.replace(/\n/g, '<br>')"></p>
          <div class="about-buttons">
             <a href="#contact" class="btn">Vamos Conversar</a>
             <a href="/path-to-your-cv.pdf" class="btn btn-secondary" target="_blank">Download CV</a>
          </div>
        </div>
      </div>
       <div v-else class="loading-state">
        <p>Carregando...</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const about = computed(() => store.state.about);
</script>

<style scoped>
.about {
  padding-top: 10rem;
}

.about-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  margin-top: 4rem;
}

.about-image {
  width: 250px;
  height: 250px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid var(--primary);
  box-shadow: 0 0 40px rgba(59, 130, 246, 0.3);
  flex-shrink: 0;
}

.about-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.about-text {
  text-align: center;
}

.about-text h3 {
  font-size: 1.8rem;
  color: var(--light);
  margin-bottom: 1rem;
}

.about-text p {
  max-width: 60ch;
  margin-left: auto;
  margin-right: auto;
}

.about-buttons {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Layout para telas maiores */
@media (min-width: 768px) {
  .about-content {
    flex-direction: row;
    align-items: flex-start;
  }
  
  .about-text {
    text-align: left;
  }

  .about-text p {
    margin-left: 0;
    margin-right: 0;
  }

  .about-buttons {
    justify-content: flex-start;
  }
}
</style>

