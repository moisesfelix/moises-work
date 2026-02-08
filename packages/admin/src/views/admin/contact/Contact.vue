<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h1 class="page-title">Informações de Contato</h1>
        <p class="page-subtitle">Gerencie suas informações de contato</p>
      </div>
    </header>

    <div class="card">
      <div v-if="loading" class="loading-state">
        <div class="spinner-large"></div>
        <p>Carregando...</p>
      </div>
      <form v-else @submit.prevent="saveContactInfo" class="form-container">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" v-model="contactForm.email" placeholder="seu-email@example.com" />
        </div>
        <div class="form-group">
          <label for="phone">Telefone</label>
          <input type="text" id="phone" v-model="contactForm.phone" placeholder="+55 (11) 99999-9999" />
        </div>
        <div class="form-group">
          <label for="whatsapp">WhatsApp</label>
          <input type="text" id="whatsapp" v-model="contactForm.whatsapp" placeholder="Link do WhatsApp" />
        </div>
        <div class="form-group">
          <label for="linkedin">LinkedIn</label>
          <input type="url" id="linkedin" v-model="contactForm.linkedin" placeholder="Link do seu LinkedIn" />
        </div>
        <div class="form-group">
          <label for="github">GitHub</label>
          <input type="url" id="github" v-model="contactForm.github" placeholder="Link do seu GitHub" />
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Salvar Alterações</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const loading = computed(() => store.state.loading);

const contactForm = ref({
  email: '',
  phone: '',
  whatsapp: '',
  linkedin: '',
  github: ''
});

onMounted(async () => {
  await store.dispatch('fetchAllData');
  if (store.state.contact) {
    contactForm.value = { ...store.state.contact };
  }
});

const saveContactInfo = async () => {
  await store.dispatch('saveData', { type: 'contact', data: contactForm.value });
  alert('Informações de contato salvas com sucesso!');
};
</script>

<style scoped>
.page-container {
  padding: 20px;
  background-color: #f5f7fb;
  min-height: 100vh;
}
.page-header {
  margin-bottom: 25px;
}
.page-title {
  font-size: 24px;
  font-weight: 600;
}
.page-subtitle {
  color: #888;
  font-size: 14px;
}
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  padding: 30px;
}
.form-container {
  max-width: 600px;
  margin: 0 auto;
}
.form-group {
  margin-bottom: 20px;
}
label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}
input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}
.form-actions {
  text-align: right;
  margin-top: 30px;
}
.btn {
  padding: 12px 25px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid transparent;
}
.btn-primary {
  background-color: #5b5fab;
  color: white;
}
.loading-state {
  text-align: center;
  padding: 50px;
}
.spinner-large {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0,0,0,0.1);
  border-top-color: #5b5fab;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
