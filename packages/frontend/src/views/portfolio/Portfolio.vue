<template>
  <div class="container" style="padding-top: 120px; padding-bottom: 60px;">
    <h2>Meus Projetos</h2>
    <p>Aqui estão alguns dos projetos em que trabalhei.</p>

    <!-- Filters -->
    <div class="filters">
      <button 
        v-for="filter in filters" 
        :key="filter.value"
        @click="activeFilter = filter.value"
        :class="{ active: activeFilter === filter.value }"
        class="filter-btn"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- Projects Grid -->
    <div class="portfolio-grid" v-if="filteredProjects && filteredProjects.length">
      <div v-for="project in filteredProjects" :key="project.id">
        <ProjectCard :project="project" />
      </div>
    </div>
    <div v-else class="no-projects">
       <p>Nenhum projeto encontrado nesta categoria.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { usePortfoliosStore } from "@/stores/portfolios";
import ProjectCard from "@/components/ProjectCard.vue";

const portfoliosStore = usePortfoliosStore();
const activeFilter    = ref("all");
const projects        = computed(() => portfoliosStore.projects || []);

const filters = [
  { label: "Todos",  value: "all"    },
  { label: "Web",    value: "web"    },
  { label: "Mobile", value: "mobile" },
  { label: "IA",     value: "ai"     },
];

const filteredProjects = computed(() => {
  if (activeFilter.value === "all") return projects.value;
  const f = activeFilter.value.toLowerCase();
  return projects.value.filter((p: any) => {
    const cat  = (p.category || "").toLowerCase();
    const tags = (p.tags || []).map((t: string) => t.toLowerCase());
    return cat.includes(f) || tags.includes(f);
  });
});
</script>

<style scoped>
.filters {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}
.filter-btn {
  background: none;
  border: 1px solid var(--border-color);
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--text-color-body);
}
.filter-btn.active, .filter-btn:hover {
  background-color: var(--primary);
  color: white;
  border-color: var(--primary);
}
.no-projects {
    text-align: center;
    padding: 2rem;
    color: var(--text-color-body);
}
</style>
