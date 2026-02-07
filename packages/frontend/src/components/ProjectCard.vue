<template>
    <div class="portfolio-item">
        <div class="portfolio-img">
            <img :src="project.image" :alt="project.title">
        </div>
        <div class="portfolio-info" style="padding: 25px; flex: 1;">
            <h3>{{ project.title }}</h3>
            <p>{{ project.description }}</p>
            <div class="portfolio-tags">
                <span v-for="tag in project.tags" :key="tag" class="tech-tag">{{ tag }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
  tags: string[];
}

defineProps({
    project: {
        type: Object as () => Project,
        required: true
    }
});
</script>