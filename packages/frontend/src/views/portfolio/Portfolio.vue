<template>
    <section class="portfolio" style="padding-top: 180px;">
        <div class="container">
            <h2>Portfólio</h2>
            
            <div class="portfolio-filter" style="display: flex; gap: 10px; margin-bottom: 30px; justify-content: center;">
                <button v-for="filter in filters" 
                        :key="filter.value" 
                        class="filter-btn" 
                        :class="{ active: activeFilter === filter.value }"
                        @click="activeFilter = filter.value">
                    {{ filter.label }}
                </button>
            </div>
            
            <div class="portfolio-grid">
                <div v-for="project in filteredProjects" :key="project.id">
                    <ProjectCard :project="project" />
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
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
    if (activeFilter.value === 'all') {
        return projects.value;
    }
    const active = activeFilter.value.toLowerCase();
    
    // Filter by category or tags
    return projects.value.filter((project: any) => {
        const category = (project.category || '').toLowerCase();
        const tags = (project.tags || []).map((t: string) => t.toLowerCase());
        
        return category.includes(active) || tags.includes(active);
    });
});
</script>
