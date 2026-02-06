<template>
  <a :href="tutorial.link" target="_blank" rel="noopener noreferrer" class="tutorial-card">
    <div class="tutorial-info">
      <h3>{{ tutorial.title }}</h3>
      <p>{{ tutorial.description }}</p>
      <div class="tutorial-tags">
        <span v-for="tag in tutorial.tags" :key="tag" class="tech-tag">{{ tag }}</span>
      </div>
    </div>
  </a>
</template>

<script setup>
defineProps({
  tutorial: {
    type: Object,
    required: true
  }
});
</script>

<style scoped>
.tutorial-card {
  display: block;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  text-decoration: none;
  color: inherit;
  transition: box-shadow 0.3s ease;
}

.tutorial-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.tutorial-info h3 {
  margin-top: 0;
}

.tutorial-tags {
  margin-top: 10px;
}

.tech-tag {
  display: inline-block;
  background-color: #f0f0f0;
  color: #333;
  padding: 5px 10px;
  border-radius: 15px;
  margin-right: 5px;
  font-size: 0.8rem;
}
</style>
