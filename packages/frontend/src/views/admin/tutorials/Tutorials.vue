<template>
  <div>
    <h2>Gerenciar Tutoriais</h2>
    <Tutorials />
  </div>
</template>

<script lang="ts">
import Tutorials from '@/components/admin/Tutorials.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'TutorialsView',
  components: {
    Tutorials
  }
});
</script>
