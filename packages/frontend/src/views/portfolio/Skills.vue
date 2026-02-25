<template>
  <section class="skills" style="padding-top: 180px;">
    <div class="container">
      <h2>Habilidades Técnicas</h2>

      <!-- Filtros e Busca -->
      <div class="filter-container">
          <div class="search-box">
              <i class="fas fa-search search-icon"></i>
              <input 
                  v-model="searchQuery" 
                  type="text" 
                  placeholder="Buscar habilidade..." 
                  class="search-input"
              >
          </div>
          
          <div class="filters-actions">
              <select v-model="selectedCategory" class="filter-select">
                  <option value="Todas">Todas Categorias</option>
                  <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>

              <select v-model="sortOrder" class="filter-select">
                  <option value="default">Padrão</option>
                  <option value="percent-desc">Maior Domínio</option>
                  <option value="percent-asc">Menor Domínio</option>
                  <option value="az">A-Z</option>
              </select>
          </div>
      </div>

      <div v-if="Object.keys(filteredSkills).length > 0" class="skills-grid">
        <div v-for="(tools, category) in filteredSkills" :key="category" class="skill-card">
            <h3 class="skill-category-title">
                <i class="fas fa-code"></i> {{ category }}
            </h3>
            
            <div class="skill-list">
                <div v-for="skill in tools" :key="skill.name" class="skill-item">
                    <div class="skill-header">
                        <span class="skill-name">{{ skill.name }}</span>
                        <span class="skill-percent-text">{{ skill.percent }}%</span>
                    </div>
                    <div class="skill-progress-track">
                        <div 
                            class="skill-progress-fill" 
                            :style="{ width: skill.percent + '%' }"
                        ></div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <i class="fas fa-search"></i>
        <p>Nenhuma habilidade encontrada para sua busca.</p>
        <button @click="clearFilters" class="btn-clear">Limpar Filtros</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { usePortfoliosStore } from "@/stores/portfolios";

const portfoliosStore = usePortfoliosStore();
const skills = computed(() => portfoliosStore.skills || {});

// Estados de Filtro
const searchQuery = ref("");
const selectedCategory = ref("Todas");
const sortOrder = ref("default");

// Categorias disponíveis
const categories = computed(() => Object.keys(skills.value).sort());

// Habilidades Filtradas
const filteredSkills = computed(() => {
    const query = searchQuery.value.toLowerCase();
    const result: Record<string, any[]> = {};

    // Iterar sobre as categorias originais
    Object.entries(skills.value).forEach(([category, tools]: [string, any[]]) => {
        // 1. Filtrar por Categoria Selecionada
        if (selectedCategory.value !== "Todas" && category !== selectedCategory.value) {
            return;
        }

        // 2. Filtrar por Busca (Nome da Habilidade)
        let filteredTools = tools.filter(skill => 
            skill.name.toLowerCase().includes(query)
        );

        if (filteredTools.length > 0) {
            // 3. Ordenação das Skills dentro da Categoria
            filteredTools = [...filteredTools].sort((a, b) => {
                switch (sortOrder.value) {
                    case "percent-desc":
                        return b.percent - a.percent;
                    case "percent-asc":
                        return a.percent - b.percent;
                    case "az":
                        return a.name.localeCompare(b.name);
                    default:
                        return 0; // Mantém ordem original
                }
            });

            result[category] = filteredTools;
        }
    });

    return result;
});

const clearFilters = () => {
    searchQuery.value = "";
    selectedCategory.value = "Todas";
    sortOrder.value = "default";
};

// Animação simples ao montar
onMounted(() => {
    // A animação via CSS transition já ocorrerá ao renderizar
});
</script>

<style scoped>
.skills {
    padding-bottom: 5rem;
    min-height: 100vh;
}

/* Filtros */
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

/* Grid de Skills */
.skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
}

.skill-card {
    background: var(--dark-light);
    padding: 2rem;
    border-radius: var(--radius);
    border: 1px solid rgba(255,255,255,0.05);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.skill-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    border-color: var(--primary);
}

.skill-category-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary);
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.1);
}

.skill-list {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.skill-item {
    width: 100%;
}

.skill-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.95rem;
}

.skill-name {
    color: var(--light);
    font-weight: 500;
}

.skill-percent-text {
    color: var(--gray);
    font-family: monospace;
}

.skill-progress-track {
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
}

.skill-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary), var(--secondary));
    border-radius: 4px;
    transition: width 1s ease-in-out;
}

/* Empty State */
.empty-state {
    text-align: center;
    padding: 4rem;
    background: var(--dark-light);
    border-radius: var(--radius);
    border: 1px dashed var(--gray);
    color: var(--gray-light);
}

.empty-state i {
    font-size: 2.5rem;
    color: var(--gray);
    margin-bottom: 1rem;
    display: block;
}

.btn-clear {
    background: transparent;
    border: 1px solid var(--primary);
    color: var(--primary);
    padding: 0.6rem 1.2rem;
    border-radius: var(--radius);
    cursor: pointer;
    margin-top: 1.5rem;
    transition: all 0.2s;
    font-weight: 500;
}

.btn-clear:hover {
    background: var(--primary);
    color: white;
}

@media (max-width: 768px) {
    .filter-container {
        flex-direction: column;
        align-items: stretch;
    }
    
    .filters-actions {
        flex-direction: column;
    }

    .skills-grid {
        grid-template-columns: 1fr;
    }
}
</style>
