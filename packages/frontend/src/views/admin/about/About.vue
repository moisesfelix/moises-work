<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Gerenciar Sobre</h1>
      <p class="page-subtitle">Atualize sua foto, título e descrição profissional.</p>
    </div>
    <div class="card">
      <div v-if="loading" class="loading-state">
        <div class="spinner-large"></div>
        <p>Carregando informações...</p>
      </div>

      <div v-else class="card-content">
        <button class="btn btn-primary" @click="openAIModal">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          Gerar com IA
        </button>
    

        <form @submit.prevent="saveAboutData" class="about-form">
          <div class="form-group">
            <label>Sua Foto</label>
            <div class="image-upload-area">
              <div v-if="aboutForm.image" class="preview-container">
                <img :src="aboutForm.image" alt="Preview" class="image-preview" />
                <button type="button" @click="removeImage" class="btn-remove-image" title="Remover imagem">&times;</button>
              </div>
              <div v-else class="upload-placeholder" @click="triggerFileInput">
                <span v-if="!isUploading">+ Carregar Foto</span>
                <span v-else>Enviando...</span>
              </div>
              <input type="file" ref="fileInput" @change="handleImageUpload" accept="image/*" style="display: none;" />
            </div>
            <p v-if="uploadError" class="error-text">{{ uploadError }}</p>
          </div>

          <div class="form-group">
            <label for="title">Título Principal</label>
            <input type="text" id="title" v-model="aboutForm.title" required placeholder="Ex: Olá, eu sou..." />
          </div>

          <div class="form-group">
            <label for="description">Sua Descrição</label>
            <textarea id="description" v-model="aboutForm.description" required rows="12" placeholder="Fale um pouco sobre você, suas paixões e sua carreira..."></textarea>
          </div>

          <div class="form-footer">
            <button type="submit" class="btn btn-primary btn-save" :disabled="isUploading || saving">
              <span v-if="saving" class="spinner"></span>
              {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- AI Modal -->
    <transition name="fade">
      <div v-if="showAIModal" class="modal-overlay" @click.self="closeAIModal">
        <div class="modal-content ai-modal">
          <div class="modal-header">
            <h2 class="ai-title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              Gerar Descrição com IA
            </h2>
            <button class="close-btn" @click="closeAIModal">&times;</button>
          </div>
          
          <form @submit.prevent="generateAIDescription" class="modal-body">
            <div class="form-group">
              <label for="ai-prompt">Pontos Chave</label>
              <textarea id="ai-prompt" v-model="aiPrompt" rows="5" placeholder="Ex: Desenvolvedor Full-Stack apaixonado por criar soluções inovadoras. Experiência com Vue.js, Node.js e Firebase. Buscando novos desafios..."></textarea>
              <p class="form-hint">Forneça alguns pontos e a IA criará uma descrição profissional.</p>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeAIModal" :disabled="generating">Cancelar</button>
              <button type="submit" class="btn btn-primary btn-ai" :disabled="generating">
                <span v-if="generating" class="spinner"></span>
                {{ generating ? 'Gerando...' : 'Gerar Descrição' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { usePortfoliosStore }  from "@/stores/portfolios";
import { useUiStore }          from "@/stores/ui";
import { storageService }      from "@/services/storage.service";
import { apiGeminiService }    from "@/services/api.gemini.service";

const portfoliosStore = usePortfoliosStore();
const uiStore         = useUiStore();
const loading         = computed(() => uiStore.isLoading);
const fileInput       = ref<HTMLInputElement | null>(null);

const aboutForm = ref({ title: "", description: "", image: "" });

const isUploading  = ref(false);
const saving       = ref(false);
const uploadError  = ref<string | null>(null);
const showAIModal  = ref(false);
const aiPrompt     = ref("");
const generating   = ref(false);

onMounted(async () => {
  await portfoliosStore.fetchData("about");
  if (portfoliosStore.about) aboutForm.value = { ...portfoliosStore.about };
});

const triggerFileInput = () => fileInput.value?.click();

const handleImageUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  isUploading.value = true;
  uploadError.value = null;
  try {
    aboutForm.value.image = await storageService.uploadImage(file, "about");
  } catch {
    uploadError.value = "Falha no upload da imagem.";
  } finally {
    isUploading.value = false;
  }
};

const removeImage    = () => { aboutForm.value.image = ""; };

const saveAboutData  = async () => {
  saving.value = true;
  try {
    await portfoliosStore.saveData({ type: "about", data: aboutForm.value });
    alert("Informações salvas com sucesso!");
  } catch {
    alert("Erro ao salvar as informações.");
  } finally {
    saving.value = false;
  }
};

const openAIModal  = () => { aiPrompt.value = aboutForm.value.description; showAIModal.value = true; };
const closeAIModal = () => { if (!generating.value) showAIModal.value = false; };

const generateAIDescription = async () => {
  if (!aiPrompt.value.trim()) { alert("Por favor, forneça alguns pontos chave."); return; }
  generating.value = true;
  try {
    const prompt = `Com base nestes pontos: "${aiPrompt.value}", gere uma descrição profissional e atrativa para a seção "Sobre Mim" de um portfólio de desenvolvedor. Tom profissional e inspirador. 2 a 4 parágrafos.`;
    aboutForm.value.description = await apiGeminiService.generateText(prompt);
    closeAIModal();
  } catch {
    alert("Erro ao gerar descrição com a IA.");
  } finally {
    generating.value = false;
  }
};
</script>

<style scoped>
/* Estilos gerais reutilizados de Articles.vue para consistência */
.page-container {
  padding: 20px;
  background-color: #f5f7fb;
  min-height: 100vh;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}
.page-title {
  font-size: 24px;
  font-weight: 600;
}
.page-subtitle { color: #888; font-size: 14px; }
.header-actions { display: flex; gap: 10px; }

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}
.card-content { padding: 30px; }

.loading-state { padding: 50px; text-align: center; }

.btn {
  padding: 10px 20px; border-radius: 6px; cursor: pointer;
  font-size: 14px; font-weight: 500; display: inline-flex;
  align-items: center; gap: 6px; transition: 0.2s;
  border: 1px solid transparent;
}
.btn-primary { background-color: #5b5fab; color: white; }
.btn-primary:hover { background-color: #4a4e94; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-secondary { background-color: #e0e0e0; color: #333; }
.btn-ai { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }

.form-group { margin-bottom: 20px; }
label { display: block; margin-bottom: 8px; font-weight: 600; font-size: 14px; }
input, textarea {
  width: 100%; padding: 12px; border: 1px solid #ddd;
  border-radius: 6px; font-size: 14px;
}
textarea { resize: vertical; }

.form-footer {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  text-align: right;
}

.btn-save { min-width: 150px; justify-content: center; }

.image-upload-area { margin-bottom: 10px; }
.upload-placeholder {
  width: 150px; height: 150px; border-radius: 50%;
  border: 2px dashed #ddd; display: flex; align-items: center; justify-content: center;
  cursor: pointer; background-color: #fafafa; color: #666; font-weight: 500; margin: 0 auto;
}
.preview-container {
  position: relative; width: 150px; height: 150px;
  border-radius: 50%; overflow: hidden; margin: 0 auto; border: 2px solid #5b5fab;
}
.image-preview { width: 100%; height: 100%; object-fit: cover; }
.btn-remove-image {
  position: absolute; top: 5px; right: 5px;
  background: rgba(0,0,0,0.5); color: white; border: none; width: 24px; height: 24px;
  border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;
}
.error-text { color: #e74c3c; text-align: center; font-size: 12px; margin-top: 8px; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.modal-content {
  background: white; width: 90%; max-width: 500px; border-radius: 10px;
}
.modal-header { padding: 20px; display: flex; justify-content: space-between; align-items: center; }
.ai-title { display: flex; align-items: center; gap: 8px; font-size: 18px; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; }
.modal-body { padding: 20px; }
.modal-footer { padding: 20px; display: flex; justify-content: flex-end; gap: 10px; background-color: #f9f9f9; }
.form-hint { font-size: 12px; color: #999; margin-top: 4px; }

.spinner {
  width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white; border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.spinner-large {
  width: 40px; height: 40px; border: 4px solid #eee;
  border-top-color: #5b5fab; border-radius: 50%;
  animation: spin 1s linear infinite; margin: 0 auto 15px auto;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>