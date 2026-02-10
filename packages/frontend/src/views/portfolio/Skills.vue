<template>
  <section class="skills" style="padding-top: 180px;">
    <div class="container">
      <h2>Habilidades Técnicas</h2>
      <div class="skills-container portfolio-grid">
        <div v-for="(tools, category) in skills" :key="category" class="portfolio-item">
          <div class="portfolio-info">
            <h3 class="skill-category-title"><i class="fas fa-code"></i> {{ category }}</h3>
            <div class="skill-bar">
              <div v-for="skill in tools" :key="skill.name" class="skill-item">
                <div class="skill-info">
                  <span class="skill-name">{{ skill.name }}</span>
                  <span class="skill-percent">{{ skill.percent }}%</span>
                </div>
                <div class="skill-progress">
                  <div class="skill-progress-bar" :style="{ width: skill.percent + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const skills = computed(() => store.state.portfolios.skills);
const hasSkills = computed(() => {
  return store.state.portfolios.skills && Object.keys(store.state.portfolios.skills).length > 0;
});

// Animação da barra de progresso
const animateBars = () => {
  if (store.state.portfolios.skills && Object.keys(store.state.portfolios.skills).length > 0) {
    nextTick(() => {
      const progressBars = document.querySelectorAll('.progress');
      progressBars.forEach(bar => {
        const width = (bar as HTMLElement).getAttribute('data-width');
        if (width) {
          (bar as HTMLElement).style.width = width;
        }
      });
    });
  }
};

const animateSkillBars = () => {
  const skillBars = document.querySelectorAll('.skill-progress-bar');
  skillBars.forEach(bar => {
    const progressBar = bar as HTMLElement;
    const width = progressBar.style.width;
    progressBar.style.width = '0%';
    setTimeout(() => {
      progressBar.style.width = width;
    }, 100);
  });
};

onMounted(() => {
    if (store.state.skills && Object.keys(store.state.skills).length > 0) {
        animateSkillBars();
    }
});

watch(skills, (newSkills) => {
    if (newSkills && Object.keys(newSkills).length > 0) {
        animateSkillBars();
    }
}, { deep: true });

</script>

<style scoped>
.skills {
    padding: 6rem 0;
    background: var(--background-secondary);
}

.portfolio-info {
    padding: 25px;
}

.skill-category-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--primary);
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.skill-item {
    margin-bottom: 1.2rem;
}
.skill-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
}
.skill-name {
    font-weight: 500;
    color: var(--text-body);
}
.skill-percent {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-muted);
}
.skill-progress {
    height: 10px;
    background: var(--background-tertiary);
    border-radius: 5px;
    overflow: hidden;
}
.skill-progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--primary), var(--primary-light));
    border-radius: 5px;
    transition: width 0.8s cubic-bezier(0.25, 0.1, 0.25, 1);
}
</style>
