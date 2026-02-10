<template>
  <div>
    <h2>Gerenciar Projetos</h2>
    <Projects/>
    
    <!-- O conteúdo de gerenciamento de projetos virá aqui -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Projects from '@/components/admin/Projects.vue';
export default defineComponent({
  name: 'ProjectsView',
  components: {
    Projects
  }
});
</script>
