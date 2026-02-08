<template>
  <div class="article-page">
      <div class="container">
          <div v-if="tutorial" class="tutorial-content">
              <div class="article-header">
                  <h1>{{ tutorial.title }}</h1>
                  <div class="article-meta">
                      <div class="meta-item">
                          <i class="fas fa-clock"></i> {{ tutorial.duration }}
                      </div>
                      <div class="meta-item">
                          <i class="fas fa-signal"></i> {{ tutorial.difficulty }}
                      </div>
                      <div class="meta-item badge">
                          {{ tutorial.category }}
                      </div>
                  </div>
              </div>
              
              <div class="image-wrapper">
                  <img :src="tutorial.image" :alt="tutorial.title" class="article-image">
              </div>
              
              <div class="tutorial-steps">
                  <div v-for="(step, index) in tutorial.steps" :key="index" class="tutorial-step">
                      <h4 class="step-title">
                          <span class="step-number">
                              {{ index + 1 }}
                          </span>
                          {{ step.title }}
                      </h4>
                      <p class="step-description">{{ step.content }}</p>
                      
                      <div v-if="step.code" class="code-block">
                          <div class="code-header">
                              <span class="code-language">javascript</span>
                              <button class="copy-btn" @click="copyCode(step.code, index)" :class="{ 'copied': copiedStepIndex === index }">
                                  <i :class="copiedStepIndex === index ? 'fas fa-check' : 'far fa-copy'"></i>
                                  {{ copiedStepIndex === index ? 'Copiado!' : 'Copiar' }}
                              </button>
                          </div>
                          <pre><code class="hljs javascript">{{ step.code }}</code></pre>
                      </div>
                  </div>
              </div>
              
              <div class="tutorial-footer">
                  <router-link to="/tutoriais" class="btn btn-back">
                      <i class="fas fa-arrow-left"></i> Voltar para Tutoriais
                  </router-link>
              </div>
          </div>
          
          <div v-else class="not-found">
              <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; color: #ccc;"></i>
              <p>Tutorial não encontrado.</p>
              <router-link to="/tutoriais" class="btn btn-back">Voltar</router-link>
          </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject, nextTick, watch } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import hljs from 'highlight.js';
// Importe um tema do highlight.js se ainda não tiver feito no main.ts
import 'highlight.js/styles/atom-one-dark.css'; 

const store = useStore();
const route = useRoute();
const showToast = inject('showToast') as (toast: { type: string; title: string; message: string; }) => void;

const copiedStepIndex = ref<number | null>(null);

const tutorial = computed(() => store.getters.getTutorialBySlug(route.params.slug as string));

const copyCode = async (code: string, index: number) => {
    try {
        await navigator.clipboard.writeText(code);
        copiedStepIndex.value = index;
        showToast({
            type: 'success',
            title: 'Copiado!',
            message: 'Código copiado para a área de transferência!'
        });
        
        setTimeout(() => {
            copiedStepIndex.value = null;
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

// Função auxiliar para aplicar o highlight
const highlightCode = () => {
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block as HTMLElement);
    });
};

onMounted(() => {
    if (tutorial.value) {
        highlightCode();
    }
});

// Observar mudanças no tutorial para reaplicar highlight se os dados mudarem
watch(tutorial, async () => {
    await nextTick();
    highlightCode();
});
</script>

<style scoped>
/* Definição de Variáveis Locais (caso não existam globais) */
.article-page {
    --primary: #4f46e5; /* Cor principal (Indigo) */
    --primary-hover: #4338ca;
    --text-color: #333;
    --text-light: #666;
    --bg-code: #1e1e1e;
    --border-color: #e5e7eb;
}

.article-page {
    padding: 40px 20px;
    background-color: #f9fafb;
    min-height: 100vh;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Header Styles */
.article-header {
    margin-bottom: 30px;
    text-align: left;
}

.article-header h1 {
    font-size: 2.5rem;
    font-weight: 800;
    color: var(--text-color);
    margin-bottom: 15px;
    line-height: 1.2;
}

.article-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    color: var(--text-light);
    font-size: 0.95rem;
    align-items: center;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 8px;
}

.meta-item.badge {
    background-color: #e0e7ff;
    color: var(--primary);
    padding: 4px 12px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.85rem;
}

/* Image Styles */
.image-wrapper {
    width: 100%;
    margin-bottom: 40px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.article-image {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
    max-height: 400px;
    transition: transform 0.3s ease;
}

.article-image:hover {
    transform: scale(1.02);
}

/* Steps Styles */
.tutorial-steps {
    display: flex;
    flex-direction: column;
    gap: 40px;
}

.tutorial-step h4.step-title {
    display: flex;
    align-items: center;
    font-size: 1.5rem;
    margin-bottom: 15px;
    color: var(--text-color);
}

.step-number {
    background: var(--primary);
    color: white;
    width: 36px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    margin-right: 15px;
    font-size: 1.1rem;
    font-weight: bold;
    flex-shrink: 0; /* Impede o número de encolher no mobile */
}

.step-description {
    font-size: 1.1rem;
    line-height: 1.7;
    color: #4b5563;
    margin-bottom: 20px;
    padding-left: 50px; /* Alinha com o texto do título */
}

/* Code Block Styles */
.code-block {
    margin-left: 50px; /* Alinha com o texto */
    background: var(--bg-code);
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 20px;
    border: 1px solid #333;
}

.code-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    background: #2d2d2d;
    border-bottom: 1px solid #404040;
}

.code-language {
    color: #a5b4fc;
    font-size: 0.85rem;
    font-weight: 600;
    text-transform: uppercase;
}

.copy-btn {
    background: transparent;
    border: 1px solid rgba(255,255,255,0.2);
    color: #ccc;
    cursor: pointer;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 4px;
    transition: all 0.2s;
}

.copy-btn:hover {
    background: rgba(255,255,255,0.1);
    color: white;
}

.copy-btn.copied {
    border-color: #10b981;
    color: #10b981;
}

.code-block pre {
    margin: 0;
    padding: 15px;
    overflow-x: auto; /* Scroll horizontal importante para mobile */
}

.code-block code {
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 0.9rem;
    line-height: 1.5;
}

/* Footer & Buttons */
.tutorial-footer {
    margin-top: 60px;
    text-align: center;
    border-top: 1px solid var(--border-color);
    padding-top: 30px;
}

.btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    font-weight: 600;
    transition: transform 0.2s;
}

.btn-back {
    color: var(--primary);
    padding: 10px 20px;
    border-radius: 8px;
    background: #e0e7ff;
}

.btn-back:hover {
    background: #c7d2fe;
    transform: translateY(-2px);
}

.not-found {
    text-align: center;
    padding: 50px 0;
}

/* RESPONSIVIDADE (Media Queries) */
@media (max-width: 768px) {
    .container {
        padding: 20px;
    }

    .article-header h1 {
        font-size: 1.8rem;
    }

    .article-meta {
        font-size: 0.85rem;
        gap: 10px;
    }
    
    .tutorial-step h4.step-title {
        font-size: 1.2rem;
    }
    
    .step-number {
        width: 30px;
        height: 30px;
        font-size: 1rem;
        margin-right: 10px;
    }
    
    .step-description {
        padding-left: 0; /* Remove indentação no mobile para ganhar espaço */
        font-size: 1rem;
    }
    
    .code-block {
        margin-left: 0; /* Code block ocupa largura total no mobile */
    }
    
    .code-block code {
        font-size: 0.8rem;
    }
}
</style>