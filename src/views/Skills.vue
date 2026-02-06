<template>
    <section class="skills" style="padding-top: 180px;">
        <div class="container">
            <h2>Habilidades Técnicas</h2>
            
            <div class="skills-container">
                <div v-for="(category, key) in skillCategories" :key="key" class="skill-category">
                    <h3><i :class="category.icon"></i> {{ category.title }}</h3>
                    <div class="skill-bar">
                        <div v-for="skill in getSkills(key)" :key="skill.name" class="skill-item">
                            <div class="skill-info">
                                <span class="skill-name">{{ skill.name }}</span>
                                <span class="skill-percent">{{ skill.percent }}%</span>
                            </div>
                            <div class="skill-progress">
                                <div class="skill-progress-bar" :style="{ width: animated ? skill.percent + '%' : '0%' }"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const animated = ref(false);
const skillCategories = {
    frontend: { title: 'Frontend', icon: 'fas fa-code' },
    backend: { title: 'Backend', icon: 'fas fa-server' },
    ai_devops: { title: 'IA & DevOps', icon: 'fas fa-robot' }
};

const allSkills = computed(() => store.state.skills);
const getSkills = (categoryKey) => allSkills.value[categoryKey] || [];

onMounted(() => {
    setTimeout(() => {
        animated.value = true;
    }, 100);
});
</script>