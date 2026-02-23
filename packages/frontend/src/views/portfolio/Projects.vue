<template>
  <div class="projects-page">
    <div class="header-section">
      <div class="container">
        <h1>Meus Projetos</h1>
        <p>Explore os projetos desenvolvidos, com integrações e detalhes técnicos.</p>
      </div>
    </div>

    <div class="container content-section">
      <!-- Filtros -->
      <div class="filters">
        <button v-for="filter in filters" :key="filter.value" @click="activeFilter = filter.value"
          :class="['filter-btn', { active: activeFilter === filter.value }]">
          {{ filter.label }}
        </button>
      </div>

      <!-- Lista de Projetos -->





 <div v-if="filteredProjects.length > 0" class="projects-grid">
        <ProjectCard v-for="project in filteredProjects" :key="project.id" :project="project"  @click="viewProject(project.id)"/>
      </div>

      <div v-if="!filteredProjects.length" class="empty-state">
        <p>Nenhum projeto encontrado nesta categoria.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue';
import { useRouter } from 'vue-router';
import { usePortfoliosStore } from '@/stores/portfolios';
import ProjectCard from '@/components/ProjectCard.vue';

const sdk = inject('sdk') as AppSDK;


const router = useRouter();
const portfoliosStore = usePortfoliosStore();
const projects = computed(() => portfoliosStore.projects || []);
const activeFilter = ref('all');
const placeholderImage = "https://via.placeholder.com/400x250?text=Project";

const filters = [
  { label: "Todos", value: "all" },
  { label: "Web", value: "web" },
  { label: "Mobile", value: "mobile" },
  { label: "Backend", value: "backend" },
  { label: "IA", value: "ai" }
];

onMounted(() => {
  portfoliosStore.fetchPortfolioData();
});

const filteredProjects = computed(() => {
  if (activeFilter.value === 'all') return projects.value;
  const filter = activeFilter.value.toLowerCase();

  return projects.value.filter((p: any) => {
    const category = (p.category || '').toLowerCase();
    const tags = Array.isArray(p.tags)
      ? p.tags.map((t: string) => t.toLowerCase())
      : (p.tags || '').split(',').map((t: string) => t.trim().toLowerCase());

    return category.includes(filter) || tags.some((t: string) => t.includes(filter));
  });
});

const getTags = (tags: any) => {
  if (Array.isArray(tags)) return tags.slice(0, 3);
  if (typeof tags === 'string') return tags.split(',').slice(0, 3).map((t: string) => t.trim());
  return [];
};

const truncateText = (text: string, limit: number) => {
  if (!text) return '';
  return text.length > limit ? text.substring(0, limit) + '...' : text;
};

const viewProject = (id: string) => {
  router.push({ 
    name: 'PortfolioProject', 
    params: { 
      slug: portfoliosStore.activePortfolioSlug,
      id 
    } 
  });
};
</script>

<style scoped>
.projects-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.header-section {
  background: #5b5fab;
  color: white;
  padding: 120px 0 60px;
  text-align: center;
  margin-bottom: 40px;
}

.header-section h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  font-weight: 700;
}

.header-section p {
  font-size: 1.1rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.content-section {
  padding-bottom: 80px;
}

/* Filtros */
.filters {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 40px;
  flex-wrap: wrap;
}

.filter-btn {
  background: white;
  border: 1px solid #e0e0e0;
  padding: 8px 20px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #555;
  font-weight: 500;
}

.filter-btn:hover,
.filter-btn.active {
  background: #5b5fab;
  color: white;
  border-color: #5b5fab;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(91, 95, 171, 0.2);
}

/* Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.project-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.project-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.card-image {
  height: 200px;
  position: relative;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.project-card:hover .card-image img {
  transform: scale(1.05);
}

.category-tag {
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.card-content {
  padding: 25px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-content h3 {
  margin: 0 0 10px;
  font-size: 1.25rem;
  color: #222;
  font-weight: 600;
}

.description {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 20px;
  flex: 1;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: #f0f2f5;
  color: #555;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
}

.card-footer {
  padding: 15px 25px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  text-align: right;
  margin-top: auto;
}

.view-details {
  color: #5b5fab;
  font-weight: 600;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.project-card:hover .view-details {
  color: #4a4e94;
}

.empty-state {
  text-align: center;
  padding: 60px;
  color: #888;
  font-size: 1.1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  width: 100%;
}

@media (max-width: 768px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>