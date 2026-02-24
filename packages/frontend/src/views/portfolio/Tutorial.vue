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
                  
                  <div v-if="tutorial.tags && tutorial.tags.length > 0" class="tutorial-tags">
                      <span v-for="tag in tutorial.tags" :key="tag" class="tag-badge">#{{ tag }}</span>
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
                  <router-link :to="`/${route.params.slug}/tutoriais`" class="btn btn-back">
                      <i class="fas fa-arrow-left"></i> Voltar para Tutoriais
                  </router-link>
              </div>
          </div>
          
          <div v-else class="not-found">
              <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; color: #ccc;"></i>
              <p>Tutorial não encontrado.</p>
              <router-link :to="`/${route.params.slug}/tutoriais`" class="btn btn-back">Voltar</router-link>
          </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject, nextTick, watch } from "vue";
import { usePortfoliosStore } from "@/stores/portfolios";
import { useRoute } from "vue-router";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";

const portfoliosStore  = usePortfoliosStore();
const route            = useRoute();
const showToast        = inject("showToast") as (t: { type: string; title: string; message: string }) => void;
const copiedStepIndex  = ref<number | null>(null);
const tutorial         = computed(() => portfoliosStore.getTutorialBySlug(route.params.tutorialSlug as string));

const copyCode = async (code: string, index: number) => {
  try {
    await navigator.clipboard.writeText(code);
    copiedStepIndex.value = index;
    showToast({ type: "success", title: "Copiado!", message: "Código copiado!" });
    setTimeout(() => { copiedStepIndex.value = null; }, 2000);
  } catch {
    showToast({ type: "error", title: "Erro!", message: "Erro ao copiar o código." });
  }
};

const highlightCode = () => {
  document.querySelectorAll("pre code").forEach((b) => hljs.highlightElement(b as HTMLElement));
};

onMounted(() => { if (tutorial.value) highlightCode(); });
watch(tutorial, async () => { await nextTick(); highlightCode(); });
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
  background: var(--background-card);
  padding: 40px;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.article-header h1 {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-color-heading);
  margin-bottom: 15px;
  line-height: 1.2;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  color: var(--text-color-paragraph);
  font-size: 0.95rem;
  align-items: center;
}

.meta-item.badge {
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--primary);
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
}

.tutorial-tags {
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

.image-wrapper {
  width: 100%;
  margin-bottom: 40px;
  border-radius: var(--radius);
  overflow: hidden;
  box-shadow: var(--shadow);
}

.article-image {
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
  max-height: 400px;
}

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
    color: var(--text-color-heading);
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
    flex-shrink: 0;
}

.step-description {
    font-size: 1.1rem;
    line-height: 1.7;
    color: var(--text-color-paragraph);
    margin-bottom: 20px;
    padding-left: 50px;
}

.code-block {
    margin-left: 50px;
    background: #1e1e1e;
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
    overflow-x: auto;
}

.code-block code {
    font-family: 'Fira Code', 'Consolas', monospace;
    font-size: 0.9rem;
    line-height: 1.5;
}

.tutorial-footer {
    margin-top: 60px;
    text-align: center;
    border-top: 1px solid var(--timeline-border);
    padding-top: 30px;
}

.btn-back {
    color: var(--primary);
    padding: 10px 20px;
    border-radius: 8px;
    background: rgba(59, 130, 246, 0.1);
}

.btn-back:hover {
    background: var(--primary);
    color: white;
}

.not-found {
    text-align: center;
    padding: 50px 0;
}

.not-found i {
    color: var(--text-color-paragraph);
}

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
        padding-left: 0;
        font-size: 1rem;
    }
    
    .code-block {
        margin-left: 0;
    }
    
    .code-block code {
        font-size: 0.8rem;
    }
}
</style>