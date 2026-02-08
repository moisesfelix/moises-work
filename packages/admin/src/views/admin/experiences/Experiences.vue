<template>
  <div>
    <Experiences />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Experiences from '@/components/Experiences.vue';

export default defineComponent({
  name: 'ExperiencesView',
  components: {
    Experiences,
  },
});
</script>
