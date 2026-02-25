<template>
  <div class="projects-page">
    <div class="header-section">
      <div class="container">
        <h1>Meus Projetos</h1>
        <p>Explore os projetos desenvolvidos, com integrações e detalhes técnicos.</p>
      </div>
    </div>

    <div class="container content-section">
      <!-- Filtros e Busca -->
      <div class="filter-container">
          <div class="search-box">
              <i class="fas fa-search search-icon"></i>
              <input 
                  v-model="searchQuery" 
                  type="text" 
                  placeholder="Buscar projetos..." 
                  class="search-input"
              >
          </div>
          
          <div class="filters-actions">
              <select v-model="activeFilter" class="filter-select">
                  <option value="all">Todas Categorias</option>
                  <option value="web">Web</option>
                  <option value="mobile">Mobile</option>
                  <option value="backend">Backend</option>
                  <option value="ai">IA</option>
              </select>

              <select v-model="sortOrder" class="filter-select">
                  <option value="newest">Mais Recentes</option>
                  <option value="oldest">Mais Antigos</option>
                  <option value="az">A-Z</option>
                  <option value="za">Z-A</option>
              </select>
          </div>
      </div>

      <!-- Lista de Projetos -->
      <div v-if="filteredProjects.length > 0" class="projects-grid">
        <ProjectCard 
          v-for="project in filteredProjects" 
          :key="project.id" 
          :project="project"  
          @click="viewProject(project)"
        />
      </div>

      <div v-else class="empty-state">
        <i class="fas fa-search" style="font-size: 2rem; color: #ccc; margin-bottom: 1rem;"></i>
        <p>Nenhum projeto encontrado com os filtros atuais.</p>
        <button @click="clearFilters" class="btn-clear">Limpar Filtros</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePortfoliosStore } from '@/stores/portfolios';
import ProjectCard from '@/components/ProjectCard.vue';

const router = useRouter();
const portfoliosStore = usePortfoliosStore();
const projects = computed(() => portfoliosStore.projects || []);

// Estado dos Filtros
const activeFilter = ref('all');
const searchQuery = ref('');
const sortOrder = ref('newest');

onMounted(() => {
  portfoliosStore.fetchPortfolioData();
});

const filteredProjects = computed(() => {
  let result = [...projects.value];

  // 1. Filtro por Categoria (Tab)
  if (activeFilter.value !== 'all') {
    const filter = activeFilter.value.toLowerCase();
    result = result.filter((p: any) => {
      const category = (p.category || '').toLowerCase();
      const tags = Array.isArray(p.tags) 
        ? p.tags.map((t: string) => t.toLowerCase()) 
        : (p.tags || '').split(',').map((t: string) => t.trim().toLowerCase());
      
      return category.includes(filter) || tags.some((t: string) => t.includes(filter));
    });
  }

  // 2. Filtro por Busca (Texto)
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter((p: any) => {
      const title = (p.title || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const tech = (p.technologies || []).join(' ').toLowerCase();
      
      return title.includes(query) || 
             desc.includes(query) || 
             tech.includes(query);
    });
  }

  // 3. Ordenação
  result.sort((a: any, b: any) => {
    switch (sortOrder.value) {
        case "az": return (a.title || "").localeCompare(b.title || "");
        case "za": return (b.title || "").localeCompare(a.title || "");
        case "oldest": return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
        case "newest":
        default: return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
    }
  });

  return result;
});

const viewProject = (project: any) => {
  if (portfoliosStore.activePortfolioSlug) {
    const slug = project.slug || project.id;
    router.push({ 
      name: 'PortfolioProject', 
      params: { 
        slug: portfoliosStore.activePortfolioSlug,
        id: slug 
      } 
    });
  }
};
</script>

<style scoped>
.projects-page {
  min-height: 100vh;
  background-color: var(--dark);
  color: var(--light);
}

.header-section {
  background: var(--dark-light);
  padding: 120px 0 60px;
  text-align: center;
  margin-bottom: 40px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.header-section h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  color: var(--primary);
}

.header-section p {
  font-size: 1.1rem;
  color: var(--gray);
  max-width: 600px;
  margin: 0 auto;
}

.content-section {
  padding-bottom: 80px;
}

/* Novos Filtros */
.filter-container {
    margin-bottom: 2.5rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    justify-content: space-between;
    align-items: center;
    background: var(--dark-light);
    padding: 1.5rem;
    border-radius: var(--radius);
    border: 1px solid rgba(255, 255, 255, 0.05);
}

.search-box {
    position: relative;
    flex: 1;
    min-width: 280px;
}

.search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--gray);
    pointer-events: none;
}

.search-input {
    width: 100%;
    padding: 0.8rem 1rem 0.8rem 2.8rem;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--gray);
    border-radius: var(--radius);
    color: var(--light);
    font-size: 1rem;
    transition: all 0.3s ease;
}

.search-input:focus {
    border-color: var(--primary);
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.filters-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.filter-select {
    padding: 0.8rem 2.5rem 0.8rem 1rem;
    background-color: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--gray);
    border-radius: var(--radius);
    color: var(--light);
    cursor: pointer;
    font-size: 0.95rem;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
    background-repeat: no-repeat;
    background-position: right 0.7rem top 50%;
    background-size: 0.65rem auto;
}

.filter-select:focus {
    border-color: var(--primary);
    outline: none;
}

/* Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  background: var(--dark-light);
  border-radius: 12px;
  border: 1px dashed var(--gray);
  color: var(--gray-light);
}

.btn-clear {
    background: transparent;
    border: 1px solid var(--primary);
    color: var(--primary);
    padding: 0.5rem 1rem;
    border-radius: var(--radius);
    cursor: pointer;
    margin-top: 1rem;
    transition: all 0.2s;
}

.btn-clear:hover {
    background: var(--primary);
    color: white;
}

@media (max-width: 768px) {
  .projects-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-container {
      flex-direction: column;
      align-items: stretch;
  }
  
  .filters-actions {
      flex-direction: column;
  }
}
</style>