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
import { computed, onMounted, watch, nextTick } from "vue";
import { usePortfoliosStore } from "@/stores/portfolios";

const portfoliosStore = usePortfoliosStore();
const skills          = computed(() => portfoliosStore.skills);

const animateSkillBars = () => {
  document.querySelectorAll<HTMLElement>(".skill-progress-bar").forEach((bar) => {
    const w  = bar.style.width;
    bar.style.width = "0%";
    setTimeout(() => { bar.style.width = w; }, 100);
  });
};

onMounted(() => {
  if (skills.value && Object.keys(skills.value).length > 0) animateSkillBars();
});
watch(skills, async (v) => {
  if (v && Object.keys(v).length > 0) { await nextTick(); animateSkillBars(); }
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
