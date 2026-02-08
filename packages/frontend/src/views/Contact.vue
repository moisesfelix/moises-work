<template>
  <div class="contact-page">
    <div class="container">
      <h1>Contato</h1>
      <p class="subtitle">Entre em contato comigo através dos canais abaixo.</p>

      <div v-if="loading" class="loading-state">
        <p>Carregando informações de contato...</p>
      </div>

      <div v-else-if="contactInfo" class="contact-methods">
        <div class="contact-card" v-if="contactInfo.email">
          <a :href="'mailto:' + contactInfo.email" target="_blank">
            <i class="icon-email"></i>
            <h2>Email</h2>
            <p>{{ contactInfo.email }}</p>
          </a>
        </div>

        <div class="contact-card" v-if="contactInfo.whatsapp">
          <a :href="contactInfo.whatsapp" target="_blank">
            <i class="icon-whatsapp"></i>
            <h2>WhatsApp</h2>
            <p>{{ contactInfo.phone }}</p>
          </a>
        </div>

        <div class="contact-card" v-if="contactInfo.phone">
          <a :href="'tel:' + contactInfo.phone">
            <i class="icon-phone"></i>
            <h2>Telefone</h2>
            <p>{{ contactInfo.phone }}</p>
          </a>
        </div>

        <div class="contact-card" v-if="contactInfo.linkedin">
          <a :href="contactInfo.linkedin" target="_blank">
            <i class="icon-linkedin"></i>
            <h2>LinkedIn</h2>
            <p>{{ contactInfo.linkedin.replace('https://www.linkedin.com/in/', '') }}</p>
          </a>
        </div>

        <div class="contact-card" v-if="contactInfo.github">
          <a :href="contactInfo.github" target="_blank">
            <i class="icon-github"></i>
            <h2>GitHub</h2>
            <p>{{ contactInfo.github.replace('https://github.com/', '') }}</p>
          </a>
        </div>
      </div>
      <div v-else class="empty-state">
        <p>Nenhuma informação de contato disponível.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const loading = computed(() => store.state.loading);
const contactInfo = computed(() => store.state.contact);

onMounted(() => {
  store.dispatch('fetchPortfolioData');
});
</script>

<style scoped>
.contact-page {
  padding: 60px 20px;
  background-color: var(--background-color-primary);
  color: var(--text-primary-color);
  text-align: center;
}

.container {
  max-width: 960px;
  margin: 0 auto;
}

h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.2rem;
  color: var(--text-secondary-color);
  margin-bottom: 40px;
}

.contact-methods {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  text-align: left;
}

.contact-card {
  background-color: var(--background-color-secondary);
  border-radius: 10px;
  padding: 30px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.contact-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.contact-card a {
  text-decoration: none;
  color: inherit;
  display: block;
}

.contact-card i {
  font-size: 2.5rem;
  margin-bottom: 15px;
  color: var(--accent-color);
  display: block;
}

.contact-card h2 {
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.contact-card p {
  font-size: 1rem;
  color: var(--text-secondary-color);
  word-break: break-all;
}

/* You would need to have an icon font setup for these to work */
/* Example using pseudo-elements */
.icon-email::before { content: '📧'; }
.icon-whatsapp::before { content: '💬'; }
.icon-phone::before { content: '📞'; }
.icon-linkedin::before { content: '💼'; }
.icon-github::before { content: '💻'; }
</style>
