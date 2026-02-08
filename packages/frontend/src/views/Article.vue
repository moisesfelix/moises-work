<template>
  <div class="article-page">
      <div class="container">
          <div v-if="article" class="article-wrapper">
              
              <div class="article-header">
                  <h1>{{ article.title }}</h1>
                  <div class="article-meta">
                      <div class="meta-item">
                          <i class="fas fa-calendar-alt"></i> {{ article.date }}
                      </div>
                      <div class="meta-item">
                          <i class="far fa-clock"></i> {{ article.readTime }}
                      </div>
                      <div class="meta-item badge">
                          {{ article.category }}
                      </div>
                  </div>
              </div>
              
              <div class="image-container">
                  <img :src="article.image" :alt="article.title" class="article-image">
              </div>
              
              <div class="article-body" v-html="article.content"></div>
              
              <div v-if="article.codeBlocks && article.codeBlocks.length > 0" class="code-section">
                  <h3 class="code-section-title"><i class="fas fa-code"></i> Exemplos de Código</h3>
                  
                  <div v-for="(codeBlock, index) in article.codeBlocks" :key="index" class="code-block">
                      <div class="code-header">
                          <span class="code-language">{{ codeBlock.language || 'text' }}</span>
                          <button class="copy-btn" @click="copyCode(codeBlock.code, index)" :class="{ 'copied': copiedIndex === index }">
                              <i :class="copiedIndex === index ? 'fas fa-check' : 'far fa-copy'"></i>
                              {{ copiedIndex === index ? 'Copiado!' : 'Copiar' }}
                          </button>
                      </div>
                      <pre><code class="hljs">{{ codeBlock.code }}</code></pre>
                  </div>
              </div>
              
              <div class="article-footer">
                  <router-link to="/blog" class="btn btn-back">
                      <i class="fas fa-arrow-left"></i> Voltar para Artigos
                  </router-link>
              </div>
          </div>
          
          <div v-else class="not-found">
              <i class="fas fa-file-alt" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
              <p>Artigo não encontrado.</p>
              <router-link to="/blog" class="btn btn-back">Voltar</router-link>
          </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject, watch, nextTick } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css'; // Importante para o tema do código

const store = useStore();
const route = useRoute();
const showToast = inject('showToast') as (toast: { type: string; title: string; message: string; }) => void;

const copiedIndex = ref<number | null>(null);

const article = computed(() => store.getters.getArticleBySlug(route.params.slug as string));

const copyCode = async (code: string, index: number) => {
    try {
        await navigator.clipboard.writeText(code);
        copiedIndex.value = index;
        showToast({
            type: 'success',
            title: 'Copiado!',
            message: 'Código copiado para a área de transferência!'
        });
        
        setTimeout(() => {
            copiedIndex.value = null;
        }, 2000);
    } catch (err) {
        console.error('Erro ao copiar:', err);
        showToast({
            type: 'error',
            title: 'Erro!',
            message: 'Erro ao copiar o código.'
        });
    }
};

const highlightCode = () => {
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
    });
};

onMounted(() => {
    if (article.value) {
        highlightCode();
    }
});

// Garante que o highlight funcione se os dados carregarem depois da montagem
watch(article, async () => {
    await nextTick();
    highlightCode();
});
</script>

<style scoped>
/* Variáveis de Tema */
.article-page {
    --primary: #4f46e5;
    --text-main: #1f2937;
    --text-muted: #6b7280;
    --bg-light: #f9fafb;
    --border-radius: 12px;
}

.article-page {
    background-color: var(--bg-light);
    min-height: 100vh;
    padding: 40px 20px;
}

.container {
    max-width: 800px;
    margin: 0 auto;
}

.article-wrapper {
    background: white;
    padding: 40px;
    border-radius: var(--border-radius);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Header */
.article-header {
    margin-bottom: 30px;
}

.article-header h1 {
    font-size: 2.25rem;
    font-weight: 800;
    color: var(--text-main);
    line-height: 1.2;
    margin-bottom: 15px;
}

.article-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    color: var(--text-muted);
    font-size: 0.9rem;
    align-items: center;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
}

.badge {
    background-color: #e0e7ff;
    color: var(--primary);
    padding: 4px 10px;
    border-radius: 99px;
    font-weight: 600;
    font-size: 0.8rem;
    text-transform: uppercase;
}

/* Imagem */
.image-container {
    margin: 0 -40px 40px -40px; /* Quebra o padding do container para full width visual */
    overflow: hidden;
}

.article-image {
    width: 100%;
    height: auto;
    max-height: 450px;
    object-fit: cover;
    display: block;
}

/* CONTEÚDO DO ARTIGO (Deep Selectors para v-html) */
/* Isso estiliza o HTML que vem do banco de dados */
.article-body {
    font-size: 1.125rem;
    line-height: 1.8;
    color: #374151;
    margin-bottom: 40px;
}

.article-body :deep(h2) {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-main);
    margin-top: 2rem;
    margin-bottom: 1rem;
}

.article-body :deep(h3) {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-main);
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
}

.article-body :deep(p) {
    margin-bottom: 1.25rem;
}

.article-body :deep(ul), 
.article-body :deep(ol) {
    margin-bottom: 1.25rem;
    padding-left: 1.5rem;
}

.article-body :deep(li) {
    margin-bottom: 0.5rem;
}

.article-body :deep(blockquote) {
    border-left: 4px solid var(--primary);
    background: #f3f4f6;
    padding: 1rem;
    font-style: italic;
    margin: 1.5rem 0;
    border-radius: 0 8px 8px 0;
}

.article-body :deep(a) {
    color: var(--primary);
    text-decoration: underline;
    text-underline-offset: 2px;
}

.article-body :deep(img) {
    max-width: 100%;
    border-radius: 8px;
    margin: 20px 0;
}

/* Code Blocks */
.code-section-title {
    font-size: 1.4rem;
    margin-bottom: 20px;
    color: var(--text-main);
    display: flex;
    align-items: center;
    gap: 10px;
}

.code-block {
    background: #1e1e1e; /* Fundo escuro */
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 30px;
    border: 1px solid #333;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.code-header {
    background: #2d2d2d;
    padding: 8px 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #404040;
}

.code-language {
    color: #a5b4fc;
    font-family: monospace;
    font-size: 0.85rem;
    font-weight: bold;
    text-transform: uppercase;
}

.copy-btn {
    background: rgba(255,255,255,0.1);
    border: none;
    color: #cbd5e1;
    cursor: pointer;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    border-radius: 4px;
    transition: all 0.2s;
}

.copy-btn:hover {
    background: rgba(255,255,255,0.2);
    color: white;
}

.copy-btn.copied {
    color: #34d399; /* Verde sucesso */
    background: rgba(16, 185, 129, 0.1);
}

.code-block pre {
    margin: 0;
    padding: 15px;
    overflow-x: auto; /* IMPORTANTE: Scroll horizontal no mobile */
}

.code-block code {
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 0.95rem;
    line-height: 1.5;
}

/* Footer & Buttons */
.article-footer {
    border-top: 1px solid #e5e7eb;
    margin-top: 40px;
    padding-top: 30px;
    text-align: center;
}

.btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    text-decoration: none;
    transition: transform 0.2s;
}

.btn-back {
    color: var(--primary);
    background: #e0e7ff;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
}

.btn-back:hover {
    background: #c7d2fe;
    transform: translateY(-2px);
}

.not-found {
    text-align: center;
    padding: 60px 0;
}

/* RESPONSIVIDADE */
@media (max-width: 768px) {
    .container {
        padding: 0;
    }
    
    .article-wrapper {
        padding: 20px;
        border-radius: 0; /* Remove bordas arredondadas no mobile */
        box-shadow: none;
    }

    .image-container {
        margin: 0 -20px 30px -20px;
        border-radius: 0;
    }

    .article-header h1 {
        font-size: 1.75rem;
    }

    .article-body {
        font-size: 1rem;
    }
}
</style>