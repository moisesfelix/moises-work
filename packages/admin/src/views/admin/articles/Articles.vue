<template>
  <div>
    <h2>Gerenciar Artigos</h2>
    <Articles />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Articles from '@/components/Articles.vue';
export default defineComponent({
  name: 'ArticlesView',
  components: {
    Articles,
  },
});
</script>
