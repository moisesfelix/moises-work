<template>
  <div>
    <h2>Gerenciar Sobre</h2>
    <About />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import About from '@/components/About.vue';
export default defineComponent({
  name: 'AboutView',
  components: {
    About,
  },
});
</script>
