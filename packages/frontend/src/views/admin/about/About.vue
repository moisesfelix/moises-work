<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Gerenciar Sobre</h1>
      <p class="page-subtitle">Atualize sua foto, título, descrição e persona da IA</p>
    </div>

    <div class="card">
      <div v-if="loading" class="loading-state">
        <div class="spinner-large"></div>
        <p>Carregando informações...</p>
      </div>

      <form v-else @submit.prevent="saveAboutData" class="about-form">
        <!-- Foto -->
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

        <!-- Título -->
        <div class="form-group">
          <label for="title">Título Principal</label>
          <input id="title" v-model="aboutForm.title" required placeholder="Ex: Olá, eu sou..." />
        </div>

        <!-- Descrição -->
        <div class="form-group">
          <div class="label-with-action">
            <label for="description">Sua Descrição</label>
            <button 
              type="button" 
              @click="openAIModal" 
              class="btn-text-action" 
              :disabled="generating || (!aboutForm.persona && !customPersona)"
              title="Gerar descrição baseada na Persona e Título"
            >
               <span v-if="generating">Gerando...</span>
               <span v-else>✨ Gerar com IA</span>
            </button>
          </div>
          <textarea id="description" v-model="aboutForm.description" required rows="12" placeholder="Fale um pouco sobre você..."></textarea>
        </div>

        <!-- Nova seção: Persona da IA -->
        <div class="form-group">
          <label>Persona da IA (como a IA deve se comportar)</label>
          <select v-model="selectedPersonaOption">
            <option value="Desenvolvedor FullStack e Professor">Desenvolvedor FullStack e Professor</option>
            <option value="Professora de História">Professora de História</option>
            <option value="Cozinheira Profissional">Cozinheira Profissional</option>
            <option value="Músico e Compositor">Músico e Compositor</option>
            <option value="Designer Gráfico">Designer Gráfico</option>
            <option value="">Personalizado (digite abaixo)</option>
          </select>

          <input v-if="selectedPersonaOption === ''" 
                 v-model="customPersona" 
                 placeholder="Ex: Astrônoma Amadora e Divulgadora Científica" 
                 class="custom-persona-input" />
          <p class="form-hint">Essa persona será usada em todas as gerações de conteúdo (artigos, tutoriais, roadmap...)</p>
        </div>

        <div class="form-footer">
          <button type="submit" class="btn btn-primary btn-save" :disabled="isUploading || saving">
            <span v-if="saving" class="spinner"></span>
            {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
        </div>
      </form>
    </div>

    <!-- AI Modal -->
    <transition name="fade">
      <div v-if="showAIModal" class="modal-overlay" @click.self="closeAIModal">
        <div class="modal-content ai-modal">
          <div class="modal-header">
            <h2 class="ai-title">
              Gerar Descrição com IA
            </h2>
            <button class="close-btn" @click="closeAIModal">&times;</button>
          </div>
          
          <form @submit.prevent="generateAIDescription" class="modal-body">
            <div class="form-group">
              <label for="ai-prompt">Pontos Chave / Contexto Adicional</label>
              <textarea 
                id="ai-prompt" 
                v-model="aiPrompt" 
                rows="5" 
                placeholder="Ex: Sou apaixonado por resolver problemas complexos. Tenho experiência com liderança técnica. Gosto de contribuir com código open-source...">
              </textarea>
              <p class="form-hint">A IA usará sua <strong>Persona</strong> selecionada + estes pontos para criar a descrição.</p>
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
import { ref, computed, onMounted, watch } from 'vue';
import { usePortfoliosStore } from '@/stores/portfolios';
import { useUiStore } from '@/stores/ui';
import { storageService } from '@/services/storage.service';
import { apiGeminiService } from '@/services/api.gemini.service';

const portfoliosStore = usePortfoliosStore();
const uiStore = useUiStore();

const loading = computed(() => uiStore.isLoading);
const fileInput = ref<HTMLInputElement | null>(null);
const isUploading = ref(false);
const uploadError = ref<string | null>(null);
const saving = ref(false);
const generating = ref(false);
const showAIModal = ref(false);
const aiPrompt = ref("");

const aboutForm = ref({
  title: '',
  description: '',
  image: '',
  persona: 'Desenvolvedor FullStack e Professor'
});

const selectedPersonaOption = ref('Desenvolvedor FullStack e Professor');
const customPersona = ref('');

onMounted(async () => {
  await portfoliosStore.fetchData('about');
  if (portfoliosStore.about) {
    aboutForm.value = { ...portfoliosStore.about };
    if (aboutForm.value.persona) {
      const predefined = [
        'Desenvolvedor FullStack e Professor',
        'Professora de História',
        'Cozinheira Profissional',
        'Músico e Compositor',
        'Designer Gráfico'
      ];
      if (predefined.includes(aboutForm.value.persona)) {
        selectedPersonaOption.value = aboutForm.value.persona;
      } else {
        selectedPersonaOption.value = '';
        customPersona.value = aboutForm.value.persona;
      }
    }
  }
});

watch([selectedPersonaOption, customPersona], () => {
  if (selectedPersonaOption.value === '') {
    aboutForm.value.persona = customPersona.value.trim() || 'Desenvolvedor FullStack e Professor';
  } else {
    aboutForm.value.persona = selectedPersonaOption.value;
  }
});

const triggerFileInput = () => fileInput.value?.click();

const handleImageUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  isUploading.value = true;
  uploadError.value = null;
  try {
    aboutForm.value.image = await storageService.uploadImage(file, 'about');
  } catch {
    uploadError.value = 'Falha no upload da imagem.';
  } finally {
    isUploading.value = false;
  }
};

const removeImage = () => { aboutForm.value.image = ''; };

const openAIModal = () => {
  aiPrompt.value = ''; // Limpa ou pode pré-preencher se quiser
  showAIModal.value = true;
};

const closeAIModal = () => {
  if (!generating.value) showAIModal.value = false;
};

const generateAIDescription = async () => {
  const currentPersona = selectedPersonaOption.value === '' ? customPersona.value : selectedPersonaOption.value;
  
  if (!currentPersona) {
    uiStore.triggerToast({ message: 'Defina uma persona antes de gerar a descrição.', type: 'warning' });
    return;
  }

  // Se o usuário não digitar nada, usamos um texto genérico para não falhar, 
  // mas o ideal é que ele digite algo.
  const userContext = aiPrompt.value.trim() || "Descreva minha trajetória profissional e paixão pela área.";

  generating.value = true;
  try {
    const prompt = `Escreva uma descrição profissional e engajadora para a seção "Sobre Mim" de um portfólio.
    
    Contexto Obrigatório:
    - Persona (Estilo/Tom): ${currentPersona}
    - Título Atual: ${aboutForm.value.title || 'Não definido'}
    - Detalhes Específicos fornecidos pelo usuário: "${userContext}"
    
    Diretrizes:
    - Escreva em primeira pessoa.
    - O tom deve refletir a Persona citada, mas incorporando os detalhes específicos fornecidos.
    - Tamanho aproximado: 3 a 4 parágrafos curtos.
    - Seja autêntico.`;
    
    const generatedText = await apiGeminiService.generateText(prompt);
    
    if (generatedText) {
      aboutForm.value.description = generatedText;
      uiStore.triggerToast({ message: 'Descrição gerada com sucesso!', type: 'success' });
      closeAIModal();
    }
  } catch (error) {
    console.error('Erro ao gerar descrição:', error);
    uiStore.triggerToast({ message: 'Erro ao gerar descrição com IA.', type: 'error' });
  } finally {
    generating.value = false;
  }
};

const saveAboutData = async () => {
  saving.value = true;
  try {
    await portfoliosStore.saveData({ type: 'about', data: aboutForm.value });
    localStorage.setItem('userPersona', aboutForm.value.persona);
    uiStore.triggerToast({ message: 'Informações salvas com sucesso!', type: 'success' });
  } catch {
    uiStore.triggerToast({ message: 'Erro ao salvar informações.', type: 'error' });
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
/* (mesmo estilo do original) */
.page-container { padding:20px; background:#f5f7fb; min-height:100vh; }
.page-header { margin-bottom:25px; }
.page-title { font-size:24px; font-weight:600; margin-bottom:5px; }
.page-subtitle { color:#888; font-size:14px; }
.card { background:white; border-radius:8px; box-shadow:0 2px 10px rgba(0,0,0,0.05); padding:30px; }
.loading-state { text-align:center; padding:50px; }
.form-group { margin-bottom:20px; }
.label-with-action { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.label-with-action label { margin-bottom: 0; }
.btn-text-action { background: none; border: none; color: #5b5fab; cursor: pointer; font-size: 13px; font-weight: 600; padding: 4px 8px; border-radius: 4px; transition: background 0.2s; }
.btn-text-action:hover:not(:disabled) { background: #eef0ff; }
.btn-text-action:disabled { color: #999; cursor: not-allowed; }
label { display:block; margin-bottom:8px; font-weight:600; color:#333; }
input, textarea, select { width:100%; padding:12px; border:1px solid #ddd; border-radius:6px; font-size:14px; }
textarea { resize:vertical; }
.custom-persona-input { margin-top:8px; }
.form-hint { font-size:12px; color:#999; margin-top:4px; }
.form-footer { text-align:right; margin-top:20px; border-top:1px solid #eee; padding-top:20px; }
.btn { padding:12px 25px; border-radius:6px; cursor:pointer; font-size:14px; font-weight:500; border:1px solid transparent; }
.btn-primary { background-color:#5b5fab; color:white; }
.btn-primary:hover:not(:disabled) { background-color:#4a4e94; }
.btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
.spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:white; border-radius:50%; animation:spin 0.8s linear infinite; display:inline-block; margin-right:8px; }
.spinner-large { width:40px; height:40px; border:4px solid #eee; border-top-color:#5b5fab; border-radius:50%; animation:spin 1s linear infinite; margin:0 auto 15px; }
@keyframes spin { to { transform:rotate(360deg); } }
.image-upload-area { margin-bottom:5px; }
.upload-placeholder { width:150px; height:150px; border-radius:50%; border:2px dashed #ddd; display:flex; align-items:center; justify-content:center; cursor:pointer; background:#fafafa; color:#666; font-weight:500; margin:0 auto; }
.preview-container { position:relative; width:150px; height:150px; border-radius:50%; overflow:hidden; margin:0 auto; border:2px solid #5b5fab; }
.image-preview { width:100%; height:100%; object-fit:cover; }
.btn-remove-image { position:absolute; top:5px; right:5px; background:rgba(0,0,0,0.5); color:white; border:none; width:24px; height:24px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; }
.error-text { color:#e74c3c; font-size:12px; margin-top:8px; text-align:center; }

/* Modal Styles */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.modal-content {
  background: white; width: 90%; max-width: 500px; border-radius: 10px;
}
.modal-header { padding: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; }
.ai-title { display: flex; align-items: center; gap: 8px; font-size: 18px; margin: 0; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #666; }
.modal-body { padding: 20px; }
.modal-footer { padding: 20px; display: flex; justify-content: flex-end; gap: 10px; background-color: #f9f9f9; border-bottom-left-radius: 10px; border-bottom-right-radius: 10px; }
.btn-secondary { background-color: #e0e0e0; color: #333; }
.btn-ai { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
