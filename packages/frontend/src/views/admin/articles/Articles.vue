<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Gerenciar Artigos</h1>
      <p class="page-subtitle">Crie, edite e gerencie seus artigos e posts de blog.</p>
    </div>
    <div class="card">
      <div v-if="loading" class="loading-state">
        <div class="spinner-large"></div>
        <p>Carregando artigos...</p>
      </div>

      <div v-else-if="articles.length > 0" class="table-responsive">
        <div class="header-actions">
          <button class="btn btn-primary" @click="openAIModal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            Gerar com IA
          </button>
          <button class="btn btn-secondary" @click="openAddArticleDialog">
            + Manual
          </button>
        </div>
        <table class="custom-table">
          <thead>
            <tr>
              <th width="10%">Capa</th>
              <th width="25%">Título</th>
              <th width="15%">Categoria</th>
              <th width="35%">Resumo</th>
              <th width="15%" class="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="article in articles" :key="article.id">
              <td>
                <div class="thumb-container">
                  <img :src="article.image || placeholderImage" alt="Capa" class="table-thumb" />
                </div>
              </td>
              <td class="font-medium">
                {{ article.title }}
                <div class="meta-mini">{{ article.date }} • {{ article.readTime || '5 min' }}</div>
              </td>
              <td>
                <span class="badge">{{ article.category || 'Geral' }}</span>
              </td>
              <td class="text-muted">{{ truncateText(article.description || article.excerpt, 60) }}</td>
              <td class="actions-cell">
                <button @click="navigateToArticle(article)" class="btn-icon view" title="Ver Publicado">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
                <button @click="openShareModal(article)" class="btn-icon share" title="Compartilhar">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                   </svg>
                </button>
                <button @click="openEditArticleDialog(article)" class="btn-icon edit" title="Editar">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                    </path>
                  </svg>
                </button>
                <button @click="handleDeleteArticle(article)" class="btn-icon delete" title="Excluir">
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
        <p>Nenhum artigo encontrado.</p>
        <button @click="openAIModal" class="btn btn-outline">Criar primeiro artigo</button>
      </div>
    </div>

    <transition name="fade">
      <div v-if="showArticleDialog" class="modal-overlay" @click.self="closeArticleDialog">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ editingArticle ? 'Editar Artigo' : 'Novo Artigo' }}</h2>
            <button class="close-btn" @click="closeArticleDialog">&times;</button>
          </div>

          <form @submit.prevent="saveArticle" class="modal-body">

            <div class="form-group">
              <label>Capa do Artigo</label>
              <div class="image-upload-area">
                <div v-if="articleForm.image" class="preview-container">
                  <img :src="articleForm.image" alt="Preview" class="image-preview" />
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
              <input type="text" id="title" v-model="articleForm.title" required placeholder="Título do artigo" />
            </div>

            <div class="form-group">
              <label for="slug">Título</label>
              <input type="text" id="slug" v-model="articleForm.slug" required placeholder="TSlugo" />
            </div>

            <div class="form-row">
              <div class="form-group half">
                <label for="category">Categoria</label>
                <input type="text" id="category" v-model="articleForm.category" placeholder="Ex: Tecnologia" />
              </div>
              <div class="form-group half">
                <label for="readTime">Tempo de Leitura</label>
                <input type="text" id="readTime" v-model="articleForm.readTime" placeholder="Ex: 5 min" />
              </div>
            </div>

            <div class="form-group">
              <label for="tags">Tags (separadas por vírgula)</label>
              <input type="text" id="tags" v-model="articleForm.tags" placeholder="Ex: nodejs, backend, tutorial" />
            </div>

            <div class="form-group">
              <label for="content">Conteúdo</label>
              <textarea id="content" v-model="articleForm.content" required rows="5"></textarea>
            </div>

            <div class="form-group">
              <label for="description">Resumo</label>
              <textarea id="description" v-model="articleForm.description" required rows="5"></textarea>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeArticleDialog">Cancelar</button>
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
              Gerar Artigo com IA
            </h2>
            <button class="close-btn" @click="closeAIModal">&times;</button>
          </div>

          <form @submit.prevent="generateArticle" class="modal-body">
            <div class="form-group">
              <label for="ai-topic">Tópico do Artigo</label>
              <input id="ai-topic" v-model="aiForm.topic" placeholder="Ex: Introdução ao Vue 3" required />
              <p class="form-hint">Descreva sobre o que será o artigo</p>
            </div>

            <div class="form-row">
              <div class="form-group half">
                <label for="ai-category">Categoria</label>
                <select id="ai-category" v-model="aiForm.category" required>
                  <option value="">Selecione...</option>
                  <option value="Tecnologia">Tecnologia</option>
                  <option value="Educação">Educação</option>
                  <option value="Programação">Programação</option>
                  <option value="Web Development">Web Development</option>
                </select>
              </div>
              <div class="form-group half">
                <label for="ai-tone">Tom</label>
                <select id="ai-tone" v-model="aiForm.tone">
                  <option value="profissional">Profissional</option>
                  <option value="casual">Casual</option>
                  <option value="técnico">Técnico</option>
                </select>
              </div>
            </div>

            <div class="ai-features">
              <h3><span class="sparkle">✨</span> O que a IA fará:</h3>
              <ul>
                <li>Conteúdo original e estruturado</li>
                <li>Geração de imagem de capa</li>
                <li>Formatação HTML automática</li>
              </ul>
              <div class="cost-badge">Custo: 2 Créditos</div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeAIModal"
                :disabled="generating">Cancelar</button>
              <button type="submit" class="btn btn-primary btn-ai" :disabled="generating">
                <span v-if="generating" class="spinner"></span>
                {{ generating ? generatingStatus : 'Gerar Magic' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <ShareModal 
      v-if="showShareModal"
      :is-open="showShareModal"
      :item="sharingArticle"
      type="article"
      @close="closeShareModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from "vue";
import { usePortfoliosStore } from "@/stores/portfolios";
import { useUiStore }         from "@/stores/ui";
import { useAiStore }         from "@/stores/ai";
import { useUserStore }       from "@/stores/user";
import { storageService }     from "@/services/storage.service";
import { v4 as uuidv4 }       from "uuid";
import { AppSDK } from "@/sdk/AppSDK";
import ShareModal from "@/components/ShareModal.vue";

const sdk = inject('sdk') as AppSDK;
const portfoliosStore    = usePortfoliosStore();
const uiStore            = useUiStore();
const aiStore            = useAiStore();
const userStore          = useUserStore();
const articles           = computed(() => portfoliosStore.articles || []);
const activeSlug         = computed(() => portfoliosStore.activePortfolioSlug);
const loading            = computed(() => uiStore.isLoading);
const showAIModal        = ref(false);
const showArticleDialog  = ref(false);
const showShareModal     = ref(false);
const editingArticle     = ref<any>(null);
const sharingArticle     = ref<any>(null);
const generating         = ref(false);
const generatingStatus   = ref("");
const isUploading        = ref(false);
const uploadError        = ref<string | null>(null);
const fileInput          = ref<HTMLInputElement | null>(null);
const placeholderImage   = "https://via.placeholder.com/50";

const aiForm = ref({ topic: "", category: "", length: "medium", tone: "profissional e educativo" });

const articleForm = ref({
  id: null as string | null, title: "", description: "", content: "",
  category: "", readTime: "", image: "", date: "", tags: "", slug: "",
});

onMounted(() => portfoliosStore.fetchPortfolioData());

const handleImageUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) { uploadError.value = "Selecione apenas imagens."; return; }
  isUploading.value = true; uploadError.value = null;
  try { articleForm.value.image = await storageService.uploadImage(file, "articles"); }
  catch { uploadError.value = "Erro ao enviar imagem."; }
  finally { isUploading.value = false; }
};
const removeImage = () => { articleForm.value.image = ""; };

const truncateText = (text: string, length: number) => !text ? "" : text.length > length ? text.substring(0, length) + "..." : text;

const navigateToArticle = (article: any) => {
  if (activeSlug.value && article.slug) {
    window.open(`/${activeSlug.value}/artigo/${article.slug}`, '_blank');
  } else {
    alert("Não foi possível abrir o artigo. Verifique se o slug existe.");
  }
};

const openAIModal  = () => { aiForm.value = { topic: "", category: "", length: "medium", tone: "profissional" }; showAIModal.value = true; };
const closeAIModal = () => { if (!generating.value) showAIModal.value = false; };

const openShareModal = (article: any) => { sharingArticle.value = article; showShareModal.value = true; };
const closeShareModal = () => { showShareModal.value = false; sharingArticle.value = null; };

const generateArticle = async () => {
  const cost = sdk.credits.getCost('generate_article');
  
  // Use userStore.credits e dailyCredits diretamente se estiverem disponíveis
  const userState = { 
        credits: userStore.credits, 
        dailyCredits: userStore.dailyCredits, 
        isDailyPlanActive: userStore.isDailyPlanActive || false
  };

  const canUse = sdk.credits.canUse(userState, 'generate_article');

  if (!canUse.canExecute) {
      alert("Créditos insuficientes. Verifique seus créditos diários ou regulares.");
      return;
  }

    generating.value = true;
    try {
        generatingStatus.value = "Gerando texto...";
        
        // Removemos a dedução manual via SDK no frontend.
        // A API backend agora é responsável por verificar e debitar os créditos atomicamente.
        /*
        const auth = await import('firebase/auth').then(m => m.getAuth());
        if (auth.currentUser) {
            await sdk.credits.deduct(auth.currentUser.uid, cost, canUse.type);
        } else {
             throw new Error("Usuário não autenticado.");
        }
        */

        try {
             // Chama a API real
            await aiStore.generateArticleWithAI(aiForm.value);
            closeAIModal();
        } catch (apiError: any) {
            console.error("Erro na API:", apiError);
            // Não precisa estornar manualmente, a API só debita se tiver sucesso
            /*
            if (auth.currentUser) {
                await sdk.credits.add(auth.currentUser.uid, cost, canUse.type);
            }
            */
            throw new Error(apiError.message || "Erro desconhecido na geração");
        }

    } catch (e: any) { 
        alert("Erro: " + e.message); 
    } finally { 
        generating.value = false; 
    }
};

const openAddArticleDialog  = () => { editingArticle.value = null; resetForm(); showArticleDialog.value = true; };
const openEditArticleDialog = (a: any) => { editingArticle.value = a; articleForm.value = { ...a, tags: a.tags ? a.tags.join(", ") : "" }; showArticleDialog.value = true; };
const closeArticleDialog    = () => { showArticleDialog.value = false; editingArticle.value = null; resetForm(); };
const resetForm = () => { uploadError.value = null; isUploading.value = false; articleForm.value = { id: null, title: "", description: "", category: "", readTime: "", image: "", content: "", slug: "", date: new Date().toLocaleDateString("pt-BR"), tags: "" }; };

const saveArticle = async () => {
  const data: any = { ...articleForm.value, tags: articleForm.value.tags ? articleForm.value.tags.split(",").map((t) => t.trim()) : [] };
  let list = [...articles.value];
  if (editingArticle.value) {
    const idx = list.findIndex((a: any) => a.id === data.id);
    if (idx !== -1) list[idx] = data;
  } else {
    data.id   = uuidv4();
    data.date = new Date().toLocaleDateString("pt-BR");
    list.push(data);
  }
  await portfoliosStore.saveData({ type: "articles", data: list });
  closeArticleDialog();
};

const handleDeleteArticle = async (article: any) => {
  if (confirm(`Excluir "${article.title}"?`)) {
    if (article.image?.includes("firebase")) try { await storageService.deleteImage(article.image); } catch {}
    await portfoliosStore.saveData({ type: "articles", data: articles.value.filter((a: any) => a.id !== article.id) });
  }
};
</script>

<style scoped>
/* =========================================
   ESTILOS GERAIS (ADMIN THEME)
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

.text-muted {
  color: #777;
  font-size: 13px;
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

.btn-icon.share {
  color: #2ecc71;
  background-color: #eafaf1;
}

.btn-icon.view {
  color: #3498db;
  background-color: #ebf5fb;
}

/* =========================================
   UPLOAD AREA (IGUAL AO PROJECTS)
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
   MODAL & FORM
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

/* Responsividade Mobile */
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