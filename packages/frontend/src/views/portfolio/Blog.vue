<template>
  <section class="blog" style="padding-top: 180px;">
      <div class="container">
          <h2>Artigos & Tutoriais</h2>
          
          <div class="blog-grid">
              <div v-for="article in articles" :key="article.id" class="blog-item">
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
                      <router-link :to="'/artigo/' + article.slug" class="btn" style="margin-top: 20px; padding: 10px 25px;">
                          <i class="fas fa-book-open"></i> Ler Artigo
                      </router-link>
                  </div>
              </div>
          </div>
      </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const articles = computed(() => store.state.portfolios.articles);
</script>