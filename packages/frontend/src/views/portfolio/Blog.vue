<template>
    <section class="blog" style="padding-top: 180px;">
        <div class="container">
            <h2>Artigos & Tutoriais</h2>

            <div class="filter-container">
                <div class="search-box">
                    <i class="fas fa-search search-icon"></i>
                    <input 
                        v-model="searchQuery" 
                        type="text" 
                        placeholder="Buscar por palavra-chave em todo conteúdo..." 
                        class="search-input"
                    >
                </div>
                
                <div class="filters">
                    <select v-model="selectedCategory" class="filter-select">
                        <option value="Todas">Todas as Categorias</option>
                        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                    </select>

                    <select v-model="sortOrder" class="filter-select">
                        <option value="newest">Mais Recentes</option>
                        <option value="oldest">Mais Antigos</option>
                        <option value="az">A-Z</option>
                        <option value="za">Z-A</option>
                    </select>
                </div>
            </div>

            <div v-if="filteredArticles.length === 0" class="no-results">
                <i class="fas fa-search"></i>
                <p>Nenhum artigo encontrado para sua busca.</p>
                <button @click="clearFilters" class="btn btn-sm">Limpar Filtros</button>
            </div>

            <div class="blog-grid">
                <div v-for="article in filteredArticles" :key="article.id || article.slug" class="blog-item">
                    <div class="portfolio-img">
                        <img :src="article.image" :alt="article.title">
                        <div class="blog-category">{{ article.category }}</div>
                    </div>
                    <div class="portfolio-info" style="padding: 25px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                            <span><i class="fas fa-calendar"></i> {{ article.date }}</span>
                            <span><i class="far fa-clock"></i> {{ article.readTime }}</span>
                        </div>
                        <h3>{{ article.title }}</h3>
                        <p>{{ article.excerpt }}</p>
                        <router-link :to="`/${currentSlug}/artigo/${article.slug}`" class="btn"
                            style="margin-top: 20px; padding: 10px 25px;">
                            <i class="fas fa-book-open"></i> Ler Artigo
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { usePortfoliosStore } from "@/stores/portfolios";
import { useRoute } from "vue-router";

const route           = useRoute();
const portfoliosStore = usePortfoliosStore();
const articles        = computed(() => portfoliosStore.articles);
const currentSlug     = computed(() => route.params.slug);

// Estado dos filtros
const searchQuery = ref("");
const sortOrder = ref("newest");
const selectedCategory = ref("Todas");

// Extrair categorias únicas
const categories = computed(() => {
    const cats = new Set(articles.value.map((a: any) => a.category).filter(Boolean));
    return Array.from(cats).sort();
});

// Artigos filtrados e ordenados
const filteredArticles = computed(() => {
    let result = [...articles.value];

    // 1. Filtro por Categoria
    if (selectedCategory.value !== "Todas") {
        result = result.filter((a: any) => a.category === selectedCategory.value);
    }

    // 2. Filtro por Busca (Palavra-chave)
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter((article: any) => {
            const title = (article.title || "").toLowerCase();
            const excerpt = (article.excerpt || article.description || "").toLowerCase();
            const category = (article.category || "").toLowerCase();
            const content = (article.content || article.body || "").toLowerCase(); // Busca no corpo se disponível
            
            return title.includes(query) || 
                   excerpt.includes(query) || 
                   category.includes(query) ||
                   content.includes(query);
        });
    }

    // 3. Ordenação
    result.sort((a: any, b: any) => {
        switch (sortOrder.value) {
            case "az":
                return (a.title || "").localeCompare(b.title || "");
            case "za":
                return (b.title || "").localeCompare(a.title || "");
            case "oldest":
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            case "newest":
            default:
                return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
    });

    return result;
});

const clearFilters = () => {
    searchQuery.value = "";
    selectedCategory.value = "Todas";
    sortOrder.value = "newest";
};
</script>

<style scoped>
.filter-container {
    margin-bottom: 2rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
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
    min-width: 250px;
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
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--gray);
    border-radius: var(--radius);
    color: var(--light);
    font-size: 0.95rem;
    transition: all 0.3s ease;
}

.search-input:focus {
    border-color: var(--primary);
    outline: none;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.filters {
    display: flex;
    gap: 1rem;
}

.filter-select {
    padding: 0.75rem 2.5rem 0.75rem 1rem;
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

.no-results {
    text-align: center;
    padding: 3rem;
    background: var(--dark-light);
    border-radius: var(--radius);
    margin-bottom: 2rem;
}

.no-results i {
    font-size: 2rem;
    color: var(--gray);
    margin-bottom: 1rem;
}

.no-results p {
    color: var(--gray-light);
    margin-bottom: 1.5rem;
}

.btn-sm {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
}

@media (max-width: 768px) {
    .filter-container {
        flex-direction: column;
        align-items: stretch;
    }
    
    .filters {
        flex-direction: column;
    }
}
</style>