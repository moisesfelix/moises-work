<template>
  <div class="page-container">
    <div class="card">
      <div v-if="loading" class="loading-state">
        <div class="spinner-large"></div>
        <p>Carregando tutoriais...</p>
      </div>

      <div v-else-if="tutorials.length > 0" class="table-responsive">
        <div class="header-actions">
          <button class="btn btn-primary" @click="openAIModal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            Gerar Tutorial IA
          </button>
          <button class="btn btn-secondary" @click="openAddTutorialDialog">
            + Manual
          </button>
        </div>
        <table class="custom-table">
          <thead>
            <tr>
              <th width="10%">Capa</th>
              <th width="30%">Título</th>
              <th width="15%">Categoria</th>
              <th width="15%">Nível/Duração</th>
              <th width="15%">Status</th>
              <th width="15%" class="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tutorial in tutorials" :key="tutorial.id">
              <td>
                <div class="thumb-container">
                  <img :src="tutorial.image || placeholderImage" alt="Capa" class="table-thumb" />
                </div>
              </td>
              <td class="font-medium">
                {{ tutorial.title }}
                <div class="meta-mini">{{ tutorial.slug }}</div>
              </td>
              <td>
                <span class="badge">{{ tutorial.category || 'Geral' }}</span>
              </td>
              <td>
                <div class="info-tag">{{ tutorial.difficulty || 'N/A' }}</div>
                <div class="meta-mini">⏱ {{ tutorial.duration || '--' }}</div>
              </td>
              <td>
                <span class="status-dot active"></span> Publicado
              </td>
              <td class="actions-cell">
                <button @click="openEditTutorialDialog(tutorial)" class="btn-icon edit" title="Editar">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                    </path>
                  </svg>
                </button>
                <button @click="handleDeleteTutorial(tutorial)" class="btn-icon delete" title="Excluir">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                    </path>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state">
        <p>Nenhum tutorial encontrado.</p>
        <button @click="openAIModal" class="btn btn-outline">Criar com IA</button>
      </div>
    </div>

    <transition name="fade">
      <div v-if="showTutorialDialog" class="modal-overlay" @click.self="closeTutorialDialog">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ editingTutorial ? 'Editar Tutorial' : 'Novo Tutorial' }}</h2>
            <button class="close-btn" @click="closeTutorialDialog">&times;</button>
          </div>

          <form @submit.prevent="saveTutorial" class="modal-body">

            <div class="form-group">
              <label>Capa do Tutorial</label>
              <div class="image-upload-area">
                <div v-if="tutorialForm.image" class="preview-container">
                  <img :src="tutorialForm.image" alt="Preview" class="image-preview" />
                  <button type="button" @click="removeImage" class="btn-remove-image"
                    title="Remover imagem">&times;</button>
                </div>
                <div v-else class="upload-placeholder" @click="$refs.fileInput.click()">
                  <span v-if="!isUploading">+ Carregar Capa</span>
                  <span v-else>Enviando...</span>
                </div>
                <input type="file" ref="fileInput" @change="handleImageUpload" accept="image/*"
                  style="display: none;" />
              </div>
              <p v-if="uploadError" class="error-text">{{ uploadError }}</p>
            </div>

            <div class="form-group">
              <label for="title">Título</label>
              <input type="text" id="title" v-model="tutorialForm.title" required placeholder="Ex: Como usar Vue 3" />
            </div>

            <div class="form-row">
              <div class="form-group half">
                <label for="slug">Slug (URL)</label>
                <input type="text" id="slug" v-model="tutorialForm.slug" placeholder="como-usar-vue-3" />
              </div>
              <div class="form-group half">
                <label for="category">Categoria</label>
                <input type="text" id="category" v-model="tutorialForm.category" placeholder="Ex: Frontend" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group half">
                <label for="difficulty">Dificuldade</label>
                <select id="difficulty" v-model="tutorialForm.difficulty">
                  <option value="Iniciante">Iniciante</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                </select>
              </div>
              <div class="form-group half">
                <label for="duration">Duração Estimada</label>
                <input type="text" id="duration" v-model="tutorialForm.duration" placeholder="Ex: 45 min" />
              </div>
            </div>

            <div class="form-group">
              <label for="tags">Tags (separadas por vírgula)</label>
              <input type="text" id="tags" v-model="tutorialForm.tags" placeholder="Ex: vue, tutorial, iniciante" />
            </div>

            <div class="form-group">
              <label for="excerpt">Resumo</label>
              <textarea id="excerpt" v-model="tutorialForm.excerpt" rows="2"
                placeholder="Breve descrição..."></textarea>
            </div>

            <div class="form-group">
              <label for="content">Conteúdo / Passos (JSON ou HTML)</label>
              <textarea id="content" v-model="tutorialForm.steps" rows="5"
                placeholder="Conteúdo do tutorial..."></textarea>
              <p class="form-hint">Dica: A IA gera isso automaticamente estruturado.</p>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeTutorialDialog">Cancelar</button>
              <button type="submit" class="btn btn-primary" :disabled="isUploading">
                {{ isUploading ? 'Aguarde...' : 'Salvar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="showAIModal" class="modal-overlay" @click.self="closeAIModal">
        <div class="modal-content ai-modal">
          <div class="modal-header">
            <h2 class="ai-title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              Gerar Tutorial com IA
            </h2>
            <button class="close-btn" @click="closeAIModal">&times;</button>
          </div>

          <form @submit.prevent="generateTutorial" class="modal-body">
            <div class="form-group">
              <label for="ai-topic">O que você quer ensinar?</label>
              <input id="ai-topic" v-model="aiForm.topic" placeholder="Ex: Criar uma API com Node.js" required />
            </div>

            <div class="form-row">
              <div class="form-group half">
                <label for="ai-category">Categoria</label>
                <input id="ai-category" v-model="aiForm.category" placeholder="Ex: Backend" required />
              </div>
              <div class="form-group half">
                <label for="ai-difficulty">Nível</label>
                <select id="ai-difficulty" v-model="aiForm.difficulty">
                  <option value="Iniciante">Iniciante</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="ai-duration">Duração (Opcional)</label>
              <input id="ai-duration" v-model="aiForm.duration" placeholder="Ex: 30 min" />
            </div>

            <div class="ai-features">
              <h3><span class="sparkle">✨</span> A IA vai gerar:</h3>
              <ul>
                <li>Estrutura passo-a-passo detalhada</li>
                <li>Exemplos de código prático</li>
                <li>Imagem de capa exclusiva (Imagen 3)</li>
              </ul>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeAIModal"
                :disabled="generating">Cancelar</button>
              <button type="submit" class="btn btn-primary btn-ai" :disabled="generating">
                <span v-if="generating" class="spinner"></span>
                {{ generating ? generatingStatus : 'Gerar Tutorial' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { v4 as uuidv4 } from 'uuid';
import { storageService } from '@/services/storage.service';

const store = useStore();
const tutorials = computed(() => store.state.tutorials || []);
const loading = computed(() => store.state.loading);

// Flags de Estado
const showAIModal = ref(false);
const showTutorialDialog = ref(false);
const editingTutorial = ref<any>(null);
const generating = ref(false);
const generatingStatus = ref('');
const isUploading = ref(false);
const uploadError = ref<string | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const placeholderImage = 'https://via.placeholder.com/150';

// Forms
const aiForm = ref({
  topic: '',
  category: '',
  difficulty: 'Iniciante',
  duration: ''
});

const tutorialForm = ref({
  id: null as string | null,
  title: '',
  slug: '',
  category: '',
  duration: '',
  difficulty: 'Iniciante',
  image: '',
  excerpt: '',
  steps: '', // Pode ser string JSON ou HTML
  tags: ''
});

onMounted(() => {
  store.dispatch('fetchAllData');
});

// --- Upload Manual de Imagem ---
const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  if (!file.type.startsWith('image/')) {
    uploadError.value = "Apenas imagens são permitidas.";
    return;
  }

  isUploading.value = true;
  uploadError.value = null;

  try {
    const downloadURL = await storageService.uploadImage(file, 'tutorials');
    tutorialForm.value.image = downloadURL;
  } catch (error) {
    console.error("Erro upload:", error);
    uploadError.value = "Falha no envio da imagem.";
  } finally {
    isUploading.value = false;
    if (target) target.value = '';
  }
};

const removeImage = () => {
  tutorialForm.value.image = '';
};

// --- Modal IA ---
const openAIModal = () => {
  aiForm.value = { topic: '', category: '', difficulty: 'Iniciante', duration: '' };
  showAIModal.value = true;
};

const closeAIModal = () => {
  if (!generating.value) showAIModal.value = false;
};

const generateTutorial = async () => {
  generating.value = true;
  generatingStatus.value = 'Planejando conteúdo...';

  try {
    // Chama a action no Vuex (que deve usar geminiService.generateTutorial)
    await store.dispatch('generateTutorialWithAI', aiForm.value);

    closeAIModal();
    alert('Tutorial gerado com sucesso!');
  } catch (error: any) {
    alert('Erro ao gerar tutorial: ' + error.message);
  } finally {
    generating.value = false;
  }
};

// --- CRUD Manual ---
const openAddTutorialDialog = () => {
  editingTutorial.value = null;
  resetForm();
  showTutorialDialog.value = true;
};

const openEditTutorialDialog = (tutorial: any) => {
  editingTutorial.value = tutorial;
  // Clona o objeto para o form
  tutorialForm.value = {
    ...tutorial,
    // Se steps for objeto/array, converte para string para edição no textarea simples
    steps: typeof tutorial.steps === 'object' ? JSON.stringify(tutorial.steps, null, 2) : tutorial.steps,
    tags: tutorial.tags ? tutorial.tags.join(', ') : ''
  };
  showTutorialDialog.value = true;
};

const closeTutorialDialog = () => {
  showTutorialDialog.value = false;
  editingTutorial.value = null;
  resetForm();
};

const resetForm = () => {
  uploadError.value = null;
  isUploading.value = false;
  tutorialForm.value = {
    id: null,
    title: '',
    slug: '',
    category: '',
    duration: '',
    difficulty: 'Iniciante',
    image: '',
    excerpt: '',
    steps: '',
    tags: ''
  };
};

const saveTutorial = async () => {
  let updatedTutorials = [...tutorials.value];
  const formData = {
    ...tutorialForm.value,
    tags: tutorialForm.value.tags ? tutorialForm.value.tags.split(',').map(tag => tag.trim()) : []
  };

  // Tratamento básico para steps (se for JSON válido, parseia, senão salva string)
  try {
    formData.steps = JSON.parse(formData.steps);
  } catch (e) {
    // Mantém como string se não for JSON
  }

  if (editingTutorial.value) {
    const index = updatedTutorials.findIndex(t => t.id === formData.id);
    if (index !== -1) updatedTutorials[index] = formData;
  } else {
    formData.id = uuidv4();
    updatedTutorials.push(formData);
  }

  await store.dispatch('saveData', { type: 'tutorials', data: updatedTutorials });
  closeTutorialDialog();
};

const handleDeleteTutorial = async (tutorial: any) => {
  if (confirm(`Excluir o tutorial "${tutorial.title}"?`)) {
    // 1. Remove imagem do Firebase se existir
    if (tutorial.image && tutorial.image.includes('firebase')) {
      try {
        await storageService.deleteImage(tutorial.image);
      } catch (e) {
        console.warn('Erro ao deletar imagem', e);
      }
    }

    // 2. Remove dados
    const updatedTutorials = tutorials.value.filter((t: any) => t.id !== tutorial.id);
    await store.dispatch('saveData', { type: 'tutorials', data: updatedTutorials });
  }
};
</script>

<style scoped>
/* =========================================
   ESTILOS GERAIS (Admin Theme - Idêntico ao Articles)
   ========================================= */
:root {
  --primary-color: #5b5fab;
  --bg-light: #f5f7fb;
  --danger-color: #e74c3c;
  --text-dark: #333;
}

.page-container {
  padding: 20px;
  background-color: var(--bg-light);
  min-height: 100vh;
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.page-title {
  font-size: 24px;
  color: #1e1e2d;
  margin: 0;
  font-weight: 600;
}

.page-subtitle {
  color: #888;
  margin: 5px 0 0 0;
  font-size: 14px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* Card & Tabela */
.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
}

.custom-table th {
  background-color: #f8f9fa;
  color: #555;
  font-weight: 600;
  text-align: left;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  font-size: 13px;
  text-transform: uppercase;
}

.custom-table td {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  color: #444;
  vertical-align: middle;
  font-size: 14px;
}

/* Thumbnails */
.thumb-container {
  width: 60px;
  height: 40px;
  border-radius: 4px;
  background-color: #eee;
  overflow: hidden;
}

.table-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Badges & Meta */
.meta-mini {
  font-size: 11px;
  color: #999;
  margin-top: 3px;
}

.badge {
  background-color: #eef2ff;
  color: #5b5fab;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.info-tag {
  font-weight: 500;
  font-size: 12px;
  color: #666;
  background: #f0f0f0;
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  margin-bottom: 2px;
}

.status-dot {
  width: 8px;
  height: 8px;
  background-color: #2ecc71;
  border-radius: 50%;
  display: inline-block;
  margin-right: 5px;
}

.font-medium {
  font-weight: 500;
  color: #222;
}

.text-right {
  text-align: right;
}

.actions-cell {
  text-align: right;
  white-space: nowrap;
}

/* Botões */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: 0.2s;
}

.btn-primary {
  background-color: #5b5fab;
  color: white;
}

.btn-primary:hover {
  background-color: #4a4e94;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #d0d0d0;
}

.btn-outline {
  background: transparent;
  border: 1px solid #ddd;
  color: #666;
}

.btn-ai {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.btn-icon {
  background: none;
  padding: 6px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  margin-left: 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-icon.edit {
  color: #5b5fab;
  background-color: #f0f1fa;
}

.btn-icon.delete {
  color: #e74c3c;
  background-color: #fce8e6;
}

/* =========================================
   UPLOAD AREA 
   ========================================= */
.image-upload-area {
  margin-bottom: 5px;
}

.upload-placeholder {
  width: 100%;
  height: 140px;
  border: 2px dashed #ddd;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #fafafa;
  color: #666;
  font-weight: 500;
  transition: 0.2s;
}

.upload-placeholder:hover {
  border-color: #5b5fab;
  color: #5b5fab;
  background: #f0f1fa;
}

.preview-container {
  position: relative;
  width: 100%;
  height: 180px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #ddd;
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-image {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-text {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 5px;
}

/* =========================================
   MODALS
   ========================================= */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 550px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  background-color: #f9f9f9;
}

.form-group {
  margin-bottom: 15px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-group.half {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #555;
}

input,
select,
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  font-family: inherit;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #5b5fab;
  outline: none;
  box-shadow: 0 0 0 3px rgba(91, 95, 171, 0.1);
}

.form-hint {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* AI Features Box */
.ai-features {
  background: #f0f4ff;
  border-radius: 6px;
  padding: 15px;
  margin-top: 10px;
}

.ai-features h3 {
  font-size: 14px;
  color: #333;
  margin: 0 0 10px 0;
}

.ai-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ai-features li {
  font-size: 13px;
  color: #555;
  margin-bottom: 5px;
  position: relative;
  padding-left: 15px;
}

.ai-features li::before {
  content: "•";
  color: #5b5fab;
  position: absolute;
  left: 0;
  font-weight: bold;
}

/* Spinner */
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

.spinner-large {
  width: 40px;
  height: 40px;
  border: 4px solid #eee;
  border-top-color: #5b5fab;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* States */
.loading-state,
.empty-state {
  padding: 50px;
  text-align: center;
  color: #888;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    gap: 0;
  }

  .header-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>