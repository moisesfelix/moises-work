<template>
  <div class="article-page">
      <div class="container">
          <div v-if="tutorial">
              <div class="article-header">
                  <h1>{{ tutorial.title }}</h1>
                  <div class="article-meta">
                      <span><i class="fas fa-clock"></i> {{ tutorial.duration }}</span>
                      <span><i class="fas fa-signal"></i> {{ tutorial.difficulty }}</span>
                      <span>{{ tutorial.category }}</span>
                  </div>
              </div>
              
              <img :src="tutorial.image" :alt="tutorial.title" class="article-image">
              
              <div class="tutorial-steps">
                  <div v-for="(step, index) in tutorial.steps" :key="index" class="tutorial-step">
                      <h4>
                          <span style="background: var(--primary); color: white; width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; margin-right: 10px;">
                              {{ index + 1 }}
                          </span>
                          {{ step.title }}
                      </h4>
                      <p>{{ step.content }}</p>
                      
                      <div v-if="step.code" class="code-block">
                          <div class="code-header">
                              <span class="code-language">javascript</span>
                              <button class="copy-btn" @click="copyCode(step.code, index)">
                                  <i :class="copiedStepIndex === index ? 'fas fa-check' : 'far fa-copy'"></i>
                                  {{ copiedStepIndex === index ? 'Copiado!' : 'Copiar' }}
                              </button>
                          </div>
                          <pre><code class="hljs">{{ step.code }}</code></pre>
                      </div>
                  </div>
              </div>
              
              <div style="margin-top: 50px; text-align: center;">
                  <router-link to="/tutoriais" class="btn">
                      <i class="fas fa-arrow-left"></i> Voltar para Tutoriais
                  </router-link>
              </div>
          </div>
          <div v-else>
              <p>Tutorial não encontrado.</p>
          </div>
      </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import hljs from 'highlight.js';

const store = useStore();
const route = useRoute();

const copiedStepIndex = ref(null);

const tutorial = computed(() => store.getters.getTutorialBySlug(route.params.slug));

const copyCode = async (code, index) => {
    try {
        await navigator.clipboard.writeText(code);
        copiedStepIndex.value = index;
        // You might want to use a toast notification here
        console.log('Código copiado para a área de transferência!');
        
        setTimeout(() => {
            copiedStepIndex.value = null;
        }, 2000);
    } catch (err) {
        console.error('Erro ao copiar:', err);
    }
};

onMounted(() => {
    if (tutorial.value) {
        // It's better to let a directive handle this, but for this case, we'll do it manually.
        document.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
    }
});
</script>