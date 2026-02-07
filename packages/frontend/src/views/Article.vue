<template>
  <div class="article-page">
      <div class="container">
          <div v-if="article">
              <div class="article-header">
                  <h1>{{ article.title }}</h1>
                  <div class="article-meta">
                      <span><i class="fas fa-calendar"></i> {{ article.date }}</span>
                      <span><i class="far fa-clock"></i> {{ article.readTime }}</span>
                      <span>{{ article.category }}</span>
                  </div>
              </div>
              
              <img :src="article.image" :alt="article.title" class="article-image">
              
              <div class="article-content" v-html="article.content"></div>
              
              <div v-for="(codeBlock, index) in article.codeBlocks" :key="index" class="code-block">
                  <div class="code-header">
                      <span class="code-language">{{ codeBlock.language }}</span>
                      <button class="copy-btn" @click="copyCode(codeBlock.code, index)">
                          <i :class="copiedIndex === index ? 'fas fa-check' : 'far fa-copy'"></i>
                          {{ copiedIndex === index ? 'Copiado!' : 'Copiar' }}
                      </button>
                  </div>
                  <pre><code class="hljs">{{ codeBlock.code }}</code></pre>
              </div>
              
              <div style="margin-top: 50px; text-align: center;">
                  <router-link to="/blog" class="btn">
                      <i class="fas fa-arrow-left"></i> Voltar para Artigos
                  </router-link>
              </div>
          </div>
          <div v-else>
              <p>Artigo não encontrado.</p>
          </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import hljs from 'highlight.js';

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

onMounted(() => {
    if (article.value) {
        // It's better to let a directive handle this, but for this case, we'll do it manually.
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block as HTMLElement);
        });
    }
});
</script>