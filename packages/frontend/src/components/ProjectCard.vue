<template>
    <div class="portfolio-item">
        <div class="portfolio-img">
            <img :src="project.image" :alt="project.title">
        </div>
        <div class="portfolio-info" style="padding: 25px; flex: 1; display: flex; flex-direction: column;">
            <h3>{{ project.title }}</h3>
            <p style="flex-grow: 1;">{{ project.description }}</p>
            <div class="portfolio-tags">
                <span v-for="tag in project.tags" :key="tag" class="tech-tag">{{ tag }}</span>
            </div>
            
            <div class="project-links" v-if="project.githubUrl || project.articleUrl || project.tutorialUrl">
                <a v-if="project.githubUrl" :href="project.githubUrl" target="_blank" class="btn-link" title="Ver código no GitHub">
                    <i class="fab fa-github"></i> Código
                </a>
                <a v-if="project.articleUrl" :href="project.articleUrl" target="_blank" class="btn-link" title="Ler artigo">
                    <i class="fas fa-file-alt"></i> Artigo
                </a>
                <a v-if="project.tutorialUrl" :href="project.tutorialUrl" target="_blank" class="btn-link" title="Ver tutorial">
                    <i class="fas fa-graduation-cap"></i> Tutorial
                </a>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  link?: string;
  tags: string[];
  githubUrl?: string;
  articleUrl?: string;
  tutorialUrl?: string;
}

const props = defineProps<{
    project: Project;
}>();
</script>

<style scoped>
.portfolio-item {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.portfolio-info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.project-links {
    margin-top: 15px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    border-top: 1px solid rgba(0,0,0,0.05);
    padding-top: 15px;
}

.btn-link {
    font-size: 0.85rem;
    color: var(--primary);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: 1px solid var(--primary);
    border-radius: 6px;
    transition: all 0.2s ease;
    font-weight: 500;
}

.btn-link:hover {
    background: var(--primary);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.btn-link i {
    font-size: 1rem;
}
</style>