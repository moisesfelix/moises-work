<template>
  <div class="contact-page">
    <div class="container">
      <div class="header">
        <h1>Vamos Conversar?</h1>
        <p class="subtitle">Estou disponível para novos projetos e oportunidades. Entre em contato!</p>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Carregando informações...</p>
      </div>

      <div v-else-if="contactInfo" class="contact-grid">
        <!-- Email Card -->
        <a v-if="contactInfo.email" :href="'mailto:' + contactInfo.email" class="contact-card email">
          <div class="icon-wrapper">
            <i class="fas fa-envelope"></i>
          </div>
          <div class="card-content">
            <h3>Email</h3>
            <p>{{ contactInfo.email }}</p>
            <span class="action-text">Enviar mensagem <i class="fas fa-arrow-right"></i></span>
          </div>
        </a>

        <!-- WhatsApp Card -->
        <a v-if="contactInfo.whatsapp" :href="contactInfo.whatsapp" target="_blank" rel="noopener noreferrer" class="contact-card whatsapp">
          <div class="icon-wrapper">CContactontact
            <i class="fab fa-whatsapp"></i>
          </div>
          <div class="card-content">
            <h3>WhatsApp</h3>
            <p>Converse comigo agora</p>
            <span class="action-text">Iniciar conversa <i class="fas fa-arrow-right"></i></span>
          </div>
        </a>

        <!-- LinkedIn Card -->
        <a v-if="contactInfo.linkedin" :href="contactInfo.linkedin" target="_blank" rel="noopener noreferrer" class="contact-card linkedin">
          <div class="icon-wrapper">
            <i class="fab fa-linkedin-in"></i>
          </div>
          <div class="card-content">
            <h3>LinkedIn</h3>
            <p>Veja meu perfil profissional</p>
            <span class="action-text">Conectar <i class="fas fa-arrow-right"></i></span>
          </div>
        </a>

        <!-- GitHub Card -->
        <a v-if="contactInfo.github" :href="contactInfo.github" target="_blank" rel="noopener noreferrer" class="contact-card github">
          <div class="icon-wrapper">
            <i class="fab fa-github"></i>
          </div>
          <div class="card-content">
            <h3>GitHub</h3>
            <p>Explore meus repositórios</p>
            <span class="action-text">Seguir <i class="fas fa-arrow-right"></i></span>
          </div>
        </a>

        <!-- Phone Card (Optional, if needed) -->
        <a v-if="contactInfo.phone" :href="'tel:' + contactInfo.phone" class="contact-card phone">
          <div class="icon-wrapper">
            <i class="fas fa-phone-alt"></i>
          </div>
          <div class="card-content">
            <h3>Telefone</h3>
            <p>{{ contactInfo.phone }}</p>
            <span class="action-text">Ligar <i class="fas fa-arrow-right"></i></span>
          </div>
        </a>
      </div>

      <div v-else class="empty-state">
        <i class="fas fa-exclamation-circle"></i>
        <p>Nenhuma informação de contato disponível no momento.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { usePortfoliosStore } from "@/stores/portfolios";
import { useUiStore }         from "@/stores/ui";

const portfoliosStore = usePortfoliosStore();
const uiStore         = useUiStore();
const loading         = computed(() => uiStore.isLoading);
const contactInfo     = computed(() => portfoliosStore.contact);
</script>

<style scoped>
.contact-page {
  padding: 120px 20px 60px;
  min-height: 80vh;
  background-color: var(--background-color-primary);
  color: var(--text-primary-color);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  text-align: center;
  margin-bottom: 60px;
}

.header h1 {
  font-size: 3rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--primary-color, #3b82f6), var(--secondary-color, #8b5cf6));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 1.2rem;
  color: var(--text-secondary-color);
  max-width: 600px;
  margin: 0 auto;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  padding: 20px;
}

.contact-card {
  background: var(--card-bg, #ffffff);
  border-radius: 20px;
  padding: 30px;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  position: relative;
  overflow: hidden;
}

.contact-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
  border-color: transparent;
}

.icon-wrapper {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: var(--bg-soft, #f3f4f6);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  font-size: 1.8rem;
  transition: all 0.3s ease;
}

.contact-card:hover .icon-wrapper {
  transform: scale(1.1);
  color: white;
}

.card-content h3 {
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: var(--text-primary-color);
}

.card-content p {
  color: var(--text-secondary-color);
  margin-bottom: 20px;
  font-size: 0.95rem;
}

.action-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--primary-color, #3b82f6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0.8;
  transition: opacity 0.3s;
}

.contact-card:hover .action-text {
  opacity: 1;
}

/* Card Specific Colors on Hover */
.email:hover .icon-wrapper { background: linear-gradient(135deg, #ef4444, #dc2626); }
.whatsapp:hover .icon-wrapper { background: linear-gradient(135deg, #22c55e, #16a34a); }
.linkedin:hover .icon-wrapper { background: linear-gradient(135deg, #0077b5, #005582); }
.github:hover .icon-wrapper { background: linear-gradient(135deg, #333333, #111111); }
.phone:hover .icon-wrapper { background: linear-gradient(135deg, #3b82f6, #2563eb); }

/* Dark Mode Support (assuming variables exist) */
@media (prefers-color-scheme: dark) {
  .contact-card {
    background: var(--card-bg-dark, #1f2937);
    border-color: rgba(255,255,255,0.1);
  }
}

.loading-state, .empty-state {
  text-align: center;
  padding: 60px;
  color: var(--text-secondary-color);
}

.spinner {
  border: 4px solid rgba(0,0,0,0.1);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border-left-color: var(--primary-color, #3b82f6);
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

/* Responsiveness */
@media (max-width: 640px) {
  .header h1 { font-size: 2.2rem; }
  .contact-grid { grid-template-columns: 1fr; }
}
</style>
