<template>
    <section class="portfolio" style="padding-top: 180px;">
        <div class="container">
            <h2>Portfólio</h2>
            
            <div class="portfolio-filter" style="display: flex; gap: 10px; margin-bottom: 30px; justify-content: center; flex-wrap: wrap;">
                <button v-for="filter in filters" 
                        :key="filter.value" 
                        class="filter-btn" 
                        :class="{ active: activeFilter === filter.value }"
                        @click="activeFilter = filter.value">
                    {{ filter.label }}
                </button>
            </div>
            
            <div class="portfolio-grid">
                <ProjectCard v-for="project in filteredProjects" 
                             :key="project.id" 
                             :project="project" />
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import ProjectCard from '@/components/ProjectCard.vue';

const store = useStore();
const activeFilter = ref('all');
const filters = [
    { label: 'Todos', value: 'all' },
    { label: 'Web', value: 'web' },
    { label: 'Mobile', value: 'mobile' },
    { label: 'IA', value: 'ai' },
    { label: 'FullStack', value: 'fullstack' }
];

const projects = computed(() => store.state.projects);
const filteredProjects = computed(() => {
    if (activeFilter.value === 'all') return projects.value;
    return projects.value.filter(project => project.category.includes(activeFilter.value));
});
</script>