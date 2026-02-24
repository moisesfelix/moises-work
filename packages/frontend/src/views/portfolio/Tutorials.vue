<template>
  <section class="blog" style="padding-top: 180px;">
      <div class="container">
          <h2>Tutoriais</h2>
          
          <div class="blog-grid">
              <div v-for="tutorial in tutorials" :key="tutorial.id" class="blog-item">
                  <div class="portfolio-img">
                      <img :src="tutorial.image" :alt="tutorial.title">
                      <div class="blog-category">{{ tutorial.category }}</div>
                  </div>
                  <div class="portfolio-info" style="padding: 25px;">
                      <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                          <span><i class="fas fa-clock"></i> {{ tutorial.duration }}</span>
                          <span><i class="fas fa-signal"></i> {{ tutorial.difficulty }}</span>
                      </div>
                      <h3>{{ tutorial.title }}</h3>
                      <p>{{ tutorial.excerpt }}</p>
                      <router-link :to="`/${route.params.slug}/tutorial/${tutorial.slug}`" class="btn" style="margin-top: 20px; padding: 10px 25px;">
                          <i class="fas fa-play-circle"></i> Começar Tutorial
                      </router-link>
                  </div>
              </div>
          </div>
      </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { usePortfoliosStore } from "@/stores/portfolios";

const route = useRoute();
const portfoliosStore = usePortfoliosStore();
const tutorials       = computed(() => portfoliosStore.tutorials);
</script>