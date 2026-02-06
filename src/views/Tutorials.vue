<template>
  <div class="tutorials-container">
    <h2>Tutorials</h2>
    <div v-if="tutorials.length">
      <Tutorial
        v-for="tutorial in tutorials"
        :key="tutorial.id"
        :tutorial="tutorial"
      />
    </div>
    <div v-else>
      <p>No tutorials available at the moment.</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Tutorial from './Tutorial.vue';

const tutorials = ref([
  {
    id: 1,
    title: 'Getting Started with Vue 3',
    description: 'A comprehensive guide to start your journey with Vue 3, covering the basics of components, reactivity, and the Composition API.',
    link: 'https://vuejs.org/guide/introduction.html',
    tags: ['Vue 3', 'JavaScript', 'Frontend']
  },
  {
    id: 2,
    title: 'Interactive Data Visualization with D3.js',
    description: 'Learn how to create beautiful and interactive data visualizations for the web using the powerful D3.js library.',
    link: 'https://d3js.org/',
    tags: ['D3.js', 'Data Visualization', 'JavaScript']
  },
  {
    id: 3,
    title: 'Building a REST API with Node.js and Express',
    description: 'A step-by-step tutorial on building a robust RESTful API using Node.js and the Express framework.',
    link: 'https://expressjs.com/en/starter/hello-world.html',
    tags: ['Node.js', 'Express', 'Backend', 'API']
  }
]);
</script>

<style scoped>
.tutorials-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}
</style>
