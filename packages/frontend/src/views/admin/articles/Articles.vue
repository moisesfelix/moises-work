<template>
  <div>
    <h2>Gerenciar Artigos</h2>
    <Articles/>
    
    <!-- O conteúdo de gerenciamento de artigos virá aqui -->
  </div>
</template>

<script>
import { defineComponent } from 'vue';

import Articles from '@/components/admin/Articles.vue';
export default defineComponent({
  name: 'ArticlesView',
  components: {
    Articles
  }
});
</script>
