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
                  
                  <div v-if="article.tags && article.tags.length > 0" class="article-tags">
                      <span v-for="tag in article.tags" :key="tag" class="tag-badge">#{{ tag }}</span>
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
.article-page {
  padding: 40px 20px;
  background-color: var(--background-body);
  color: var(--text-color-body);
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.article-wrapper {
  background: var(--background-card);
  padding: 40px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.article-header h1 {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--text-color-heading);
  line-height: 1.2;
  margin-bottom: 15px;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  color: var(--text-color-paragraph);
  font-size: 0.9rem;
  align-items: center;
}

.badge {
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--primary);
  padding: 4px 10px;
  border-radius: 99px;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
}

.article-tags {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-badge {
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--text-color-paragraph);
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-family: monospace;
}

.image-container {
  margin: 0 -40px 40px -40px;
  overflow: hidden;
}

.article-image {
  width: 100%;
  height: auto;
  max-height: 450px;
  object-fit: cover;
  display: block;
}

.article-body {
  font-size: 1.125rem;
  line-height: 1.8;
  color: var(--text-color-paragraph);
  margin-bottom: 40px;
}

.article-body :deep(h2),
.article-body :deep(h3) {
  color: var(--text-color-heading);
}

.article-body :deep(blockquote) {
    border-left: 4px solid var(--primary);
    background-color: var(--background-body);
    padding: 1rem;
    font-style: italic;
    margin: 1.5rem 0;
    border-radius: 0 8px 8px 0;
}

.code-section-title {
  color: var(--text-color-heading);
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

.article-footer {
  border-top: 1px solid var(--timeline-border);
  margin-top: 40px;
  padding-top: 30px;
  text-align: center;
}

.btn-back {
    color: var(--primary);
    background: rgba(59, 130, 246, 0.1);
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
}

.btn-back:hover {
    background: var(--primary);
    color: white;
}

.not-found {
  text-align: center;
  padding: 60px 0;
}

.not-found i {
    color: var(--text-color-paragraph);
}

@media (max-width: 768px) {
    .container {
        padding: 0;
    }
    
    .article-wrapper {
        padding: 20px;
        border-radius: 0;
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