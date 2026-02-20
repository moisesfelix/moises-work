<template>
  <section class="experience" style="padding-top: 180px;">
      <div class="container">
          <h2>Experiência Profissional</h2>
          
          <div class="timeline">
              <div v-for="exp in experiences" :key="exp.id" class="timeline-item">
                  <div class="timeline-content">
                      <span class="timeline-date"><i class="fas fa-calendar"></i> {{ exp.date }}</span>
                      <h3>{{ exp.title }}</h3>
                      <h4>{{ exp.company }}</h4>
                      <p>{{ exp.description }}</p>
                      <div class="tech-tags">
                          <span v-for="tag in exp.tags" :key="tag" class="tech-tag">{{ tag }}</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { usePortfoliosStore } from "@/stores/portfolios";

const portfoliosStore = usePortfoliosStore();
const experiences     = computed(() => portfoliosStore.experiences);
</script>
