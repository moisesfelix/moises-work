<template>
  <section class="skills" style="padding-top: 180px;">
      <div class="container">
          <h2>Habilidades Técnicas</h2>
          
          <div class="skills-container">
              <div class="skill-category">
                  <h3><i class="fas fa-code"></i> Frontend</h3>
                  <div class="skill-bar">
                      <div v-for="skill in frontendSkills" :key="skill.name" class="skill-item">
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
              
              <div class="skill-category">
                  <h3><i class="fas fa-server"></i> Backend</h3>
                  <div class="skill-bar">
                      <div v-for="skill in backendSkills" :key="skill.name" class="skill-item">
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
              
              <div class="skill-category">
                  <h3><i class="fas fa-robot"></i> IA & DevOps</h3>
                  <div class="skill-bar">
                      <div v-for="skill in aiDevopsSkills" :key="skill.name" class="skill-item">
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
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();

const frontendSkills = computed(() => (store.state.skills as any).frontend);
const backendSkills = computed(() => (store.state.skills as any).backend);
const aiDevopsSkills = computed(() => (store.state.skills as any).ai_devops);

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
    animateSkillBars();
});
</script>
