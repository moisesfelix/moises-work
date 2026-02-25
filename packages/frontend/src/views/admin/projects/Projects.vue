<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Gerenciar Projetos</h1>
      <p class="page-subtitle">Adicione, edite e gerencie seus projetos.</p>
    </div>
    <div class="card">
      <!-- Ações de topo sempre visíveis -->
      <div class="card-header-actions" style="padding: 20px; border-bottom: 1px solid #eee; display: flex; gap: 10px;">
        <button @click="openAIModal" class="btn btn-primary btn-ai">
            <span class="sparkle">✨</span> Gerar com IA
        </button>
        <button @click="openAddProjectDialog" class="btn btn-secondary">
            + Manual
        </button>
      </div>

      <div v-if="projects.length > 0" class="table-responsive">
        <table class="custom-table">
          <thead>
            <tr>
              <th width="10%">Imagem</th>
              <th width="20%">Título</th>
              <th width="15%">Categoria</th>
              <th width="35%">Descrição</th>
              <th width="20%" class="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="project in projects" :key="project.id">
              <td>
                <div class="thumb-container">
                  <img :src="project.image || placeholderImage" alt="Thumb" class="table-thumb" />
                </div>
              </td>
              <td class="font-medium">{{ project.title }}</td>
              <td>
                <span class="badge">{{ project.category || 'Geral' }}</span>
              </td>
              <td class="text-muted">{{ truncateText(project.description, 60) }}</td>
              <td class="actions-cell">
                <button @click="openShareModal(project)" class="btn-icon share" title="Compartilhar">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                      <polyline points="16 6 12 2 8 6" />
                      <line x1="12" y1="2" x2="12" y2="15" />
                   </svg>
                </button>
                <button @click="openEditProjectDialog(project)" class="btn-icon edit" title="Editar">
                  Editar
                </button>
                <button @click="deleteProject(project)" class="btn-icon delete" title="Excluir">
                  Excluir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <p>Nenhum projeto encontrado.</p>
        <p style="font-size: 0.9rem; margin-top: 5px;">Comece adicionando seu primeiro projeto acima.</p>
      </div>
    </div>

    <transition name="fade">
      <div v-if="showProjectDialog" class="modal-overlay" @click.self="closeProjectDialog">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ editingProject ? 'Editar Projeto' : 'Novo Projeto' }}</h2>
            <button class="close-btn" @click="closeProjectDialog">&times;</button>
          </div>

          <div class="modal-body">

            <div class="form-group">
              <label for="githubUrl">URL do Repositório GitHub</label>
              <div style="display: flex; gap: 10px;">
                  <input type="text" id="githubUrl" v-model="projectForm.githubUrl" placeholder="https://github.com/..." />
                  <button type="button" class="btn btn-secondary" @click="processGithubRepoBasic" :disabled="isProcessingGithub || !projectForm.githubUrl">
                      {{ isProcessingGithub ? '...' : 'Auto-Preencher' }}
                  </button>
              </div>
              <p class="form-hint">O auto-preencher manual apenas copia título, descrição e tags do GitHub (Grátis).</p>
            </div>

            <div class="form-group">
              <label>Imagem do Projeto</label>

              <div class="image-upload-area">
                <div v-if="projectForm.image" class="preview-container">
                  <img :src="projectForm.image" alt="Preview" class="image-preview" />
                  <button @click="removeImage" class="btn-remove-image" title="Remover imagem">&times;</button>
                </div>

                <div v-else class="upload-placeholder" @click="fileInput?.click()">
                  <span v-if="!isUploading">+ Carregar Imagem</span>
                  <span v-else>Enviando...</span>
                </div>

                <input type="file" ref="fileInput" @change="handleImageUpload" accept="image/*"
                  style="display: none;" />
              </div>
              <p v-if="uploadError" class="error-text">{{ uploadError }}</p>
            </div>

            <div class="form-group">
              <label for="title">Título</label>
              <input type="text" id="title" v-model="projectForm.title" placeholder="Ex: E-commerce Vue.js" />
            </div>

            <div class="form-row">
              <div class="form-group half">
                <label for="category">Categoria</label>
                <input type="text" id="category" v-model="projectForm.category" placeholder="Ex: Web" />
              </div>
              <div class="form-group half">
                <label for="tags">Tags (separadas por vírgula)</label>
                <input type="text" id="tags" v-model="projectForm.tags" placeholder="Vue, Firebase" />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group half">
                <label for="articleUrl">URL do Artigo Relacionado</label>
                <input type="text" id="articleUrl" v-model="projectForm.articleUrl" placeholder="https://..." />
              </div>
              <div class="form-group half">
                <label for="tutorialUrl">URL do Tutorial Relacionado</label>
                <input type="text" id="tutorialUrl" v-model="projectForm.tutorialUrl" placeholder="https://..." />
              </div>
            </div>

            <div class="form-group">
              <label for="description">Descrição</label>
              <textarea id="description" v-model="projectForm.description" rows="4"></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button @click="closeProjectDialog" class="btn btn-secondary">Cancelar</button>
            <button @click="saveProject" class="btn btn-primary" :disabled="isUploading">
              {{ isUploading ? 'Aguarde...' : 'Salvar' }}
            </button>
          </div>
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
              Gerar com IA (Avançado)
            </h2>
            <button class="close-btn" @click="closeAIModal">&times;</button>
          </div>

          <form @submit.prevent="generateProjectWithAI" class="modal-body">
            <div class="form-group">
              <label for="ai-url">URL do Repositório GitHub</label>
              <input id="ai-url" v-model="aiForm.githubUrl" placeholder="https://github.com/..." required />
              <p class="form-hint">A IA analisará o código, commits e README para criar um post completo.</p>
            </div>

            <div class="ai-features">
              <h3><span class="sparkle">✨</span> O que a IA fará:</h3>
              <ul>
                <li>Análise profunda do código e arquitetura</li>
                <li>Geração de imagem de capa exclusiva</li>
                <li>Tags e categorias automáticas</li>
                <li>Resumo executivo profissional</li>
              </ul>
              <div class="cost-badge">Custo: 4 Créditos</div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeAIModal"
                :disabled="isProcessingGithub">Cancelar</button>
              <button type="submit" class="btn btn-primary btn-ai" :disabled="isProcessingGithub">
                <span v-if="isProcessingGithub" class="spinner"></span>
                {{ isProcessingGithub ? 'Analisando...' : 'Gerar Magic' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <ShareModal 
      v-if="showShareModal"
      :is-open="showShareModal"
      :item="sharingProject"
      type="project"
      @close="closeShareModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, inject } from "vue";
import { usePortfoliosStore } from "@/stores/portfolios";
import { storageService }      from "@/services/storage.service";
import { v4 as uuidv4 }        from "uuid";
import { GitHubRepoSDK, GithubUtils } from "@/sdk/GitHubSDK";
import { AppSDK } from "@/sdk/AppSDK";
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user";
import ShareModal from "@/components/ShareModal.vue";

const sdk = inject('sdk') as AppSDK;
const authStore = useAuthStore();
const userStore = useUserStore();
const portfoliosStore  = usePortfoliosStore();
const projects         = computed(() => portfoliosStore.projects);
const showProjectDialog = ref(false);
const showAIModal      = ref(false);
const showShareModal   = ref(false);
const editingProject   = ref<any>(null);
const sharingProject   = ref<any>(null);
const isUploading      = ref(false);
const isProcessingGithub = ref(false);
const uploadError      = ref<string | null>(null);
const placeholderImage = "https://via.placeholder.com/50";
const fileInput        = ref<HTMLInputElement | null>(null);

const aiForm = ref({ githubUrl: "" });

const projectForm = ref({
  id: null as string | null, title: "", description: "", image: "",
  tags: "", category: "", githubUrl: "", articleUrl: "", tutorialUrl: "",
});

onMounted(() => portfoliosStore.fetchPortfolioData());

const truncateText = (text: string, length: number) => !text ? "" : text.length > length ? text.substring(0, length) + "..." : text;

const openShareModal = (project: any) => { sharingProject.value = project; showShareModal.value = true; };
const closeShareModal = () => { showShareModal.value = false; sharingProject.value = null; };

const handleImageUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (!file.type.startsWith("image/")) { uploadError.value = "Selecione apenas imagens."; return; }
  isUploading.value = true; uploadError.value = null;
  try { projectForm.value.image = await storageService.uploadImage(file, "projects"); }
  catch { uploadError.value = "Falha ao enviar imagem."; }
  finally { isUploading.value = false; }
};

// --- MÉTODOS DE PROCESSAMENTO GITHUB ---

// 1. Processamento Básico (Auto-Preencher - Grátis/Simples)
const processGithubRepoBasic = async () => {
    if (!projectForm.value.githubUrl) return;
    
    const repoInfo = GithubUtils.parseUrl(projectForm.value.githubUrl);
    if (!repoInfo) {
        alert("URL do GitHub inválida.");
        return;
    }

    isProcessingGithub.value = true;
    try {
        const ghSdk = new GitHubRepoSDK(repoInfo.owner, repoInfo.repo);
        const [info, languages] = await Promise.all([
            ghSdk.getRepoInfo(),
            ghSdk.getLanguages()
        ]);
        
        projectForm.value.title = info.name;
        projectForm.value.description = info.description || "";
        projectForm.value.tags = Object.keys(languages).slice(0, 5).join(", ");
        
        alert("Dados básicos importados com sucesso!");
    } catch (error: any) {
        console.error(error);
        alert(`Erro ao buscar dados: ${error.message}`);
    } finally {
        isProcessingGithub.value = false;
    }
};

// 2. Processamento Avançado com IA (Consome Créditos)
const openAIModal = () => { aiForm.value.githubUrl = ""; showAIModal.value = true; };
const closeAIModal = () => { if (!isProcessingGithub.value) showAIModal.value = false; };

const generateProjectWithAI = async () => {
    const repoInfo = GithubUtils.parseUrl(aiForm.value.githubUrl);
    if (!repoInfo) { alert("URL inválida."); return; }

    const canUse = sdk.credits.canUse({ 
        credits: userStore.credits, 
        dailyCredits: userStore.dailyCredits, 
        isDailyPlanActive: false 
    }, 'generate_project');

    if (!canUse.canExecute) {
        alert("Créditos insuficientes para geração com IA.");
        return;
    }

    isProcessingGithub.value = true;
    try {
        const ghSdk = new GitHubRepoSDK(repoInfo.owner, repoInfo.repo);
        
        // Coleta dados brutos do GitHub
        const [info, readme, languages, commits] = await Promise.all([
            ghSdk.getRepoInfo(),
            ghSdk.getReadme(),
            ghSdk.getLanguages(),
            ghSdk.getCommits({ per_page: 15 })
        ]);

        // Chama Backend IA
        const analysis = await sdk.gen.call('analyze_github_project', {
            repoName: info.name,
            description: info.description || '',
            languages: languages,
            readme: readme.decoded || '',
            commits: commits.map((c: any) => ({ message: c.commit.message }))
        });

        // Prepara formulário com dados enriquecidos
        projectForm.value.githubUrl = aiForm.value.githubUrl;
        projectForm.value.title = analysis.title;
        projectForm.value.description = analysis.description;
        projectForm.value.category = analysis.category;
        projectForm.value.tags = Array.isArray(analysis.tags) ? analysis.tags.join(', ') : analysis.tags;

        // Gera Imagem
        if (analysis.imagePrompt) {
            try {
                const imgRes = await sdk.gen.call('generate_image', { prompt: analysis.imagePrompt });
                projectForm.value.image = `data:image/jpeg;base64,${imgRes.imageBase64}`;
            } catch (e) {
                console.error("Erro na imagem IA:", e);
            }
        }
        
        closeAIModal();
        openAddProjectDialog(); // Abre o form já preenchido
        alert("Projeto gerado com sucesso pela IA!");

    } catch (error: any) {
        console.error(error);
        alert(`Erro na geração IA: ${error.message}`);
    } finally {
        isProcessingGithub.value = false;
    }
};

const removeImage = () => { projectForm.value.image = ""; };

const openAddProjectDialog  = () => { 
    // Se não estiver vindo do fluxo de IA (projectForm vazio), reseta. 
    // Se veio da IA (já tem titulo), mantém.
    if (!projectForm.value.title) {
        editingProject.value = null; 
        resetForm(); 
    }
    showProjectDialog.value = true; 
};

const openEditProjectDialog = (p: any) => { editingProject.value = p; projectForm.value = { ...p, tags: p.tags ? p.tags.join(", ") : "" }; showProjectDialog.value = true; };
const closeProjectDialog    = () => { showProjectDialog.value = false; editingProject.value = null; resetForm(); };
const resetForm = () => { isUploading.value = false; isProcessingGithub.value = false; uploadError.value = null; projectForm.value = { id: null, title: "", description: "", image: "", tags: "", category: "", githubUrl: "", articleUrl: "", tutorialUrl: "" }; };

const saveProject = async () => {
  const data: any = { ...projectForm.value, tags: projectForm.value.tags ? projectForm.value.tags.split(",").map((t) => t.trim()) : [] };
  let list = [...projects.value];
  if (editingProject.value) {
    const idx = list.findIndex((p: any) => p.id === data.id);
    if (idx !== -1) list[idx] = data;
  } else {
    data.id = uuidv4();
    list.push(data);
  }
  await portfoliosStore.saveData({ type: "projects", data: list });
  closeProjectDialog();
};

const deleteProject = async (project: any) => {
  if (confirm("Excluir este projeto?")) {
    if (project.image) try { await storageService.deleteImage(project.image); } catch {}
    await portfoliosStore.saveData({ type: "projects", data: projects.value.filter((p: any) => p.id !== project.id) });
  }
};
</script>

<style scoped>
/* Variáveis */
:root {
  --primary-color: #5b5fab;
  --bg-light: #f5f7fb;
  --danger-color: #e74c3c;
}

.page-container {
  padding: 20px;
  background-color: var(--bg-light);
  min-height: 100vh;
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* Header & Card styles (mantidos do anterior) */
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

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* Tabela */
.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.custom-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
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

.badge {
  background-color: #eef2ff;
  color: #5b5fab;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

/* Thumbs na Tabela */
.thumb-container {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  overflow: hidden;
  background-color: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Buttons */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
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
  background-color: #a0a2cf;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #e0e0e0;
  color: #333;
  margin-right: 10px;
}

.btn-icon {
  background: none;
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  margin-left: 5px;
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

/* Upload Area Styles (NOVO) */
.image-upload-area {
  width: 100%;
  margin-bottom: 5px;
}

.upload-placeholder {
  width: 100%;
  height: 150px;
  border: 2px dashed #ddd;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #fafafa;
  transition: all 0.2s;
  color: #666;
  font-weight: 500;
}

.upload-placeholder:hover {
  border-color: #5b5fab;
  color: #5b5fab;
  background-color: #f0f1fa;
}

.preview-container {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #ddd;
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Ajusta a imagem dentro da caixa sem distorcer */
}

.btn-remove-image {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: 0.2s;
}

.btn-remove-image:hover {
  background-color: #e74c3c;
}

.error-text {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 5px;
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

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-ai {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
}

.cost-badge {
    margin-top: 10px;
    display: inline-block;
    background: #fff;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 11px;
    color: #764ba2;
    font-weight: bold;
    border: 1px solid #764ba2;
}

.sparkle { margin-right: 5px; }

/* Modal e Form Layout */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  width: 90%;
  max-width: 500px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  overflow-y: auto;
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
}

.close-btn {
  border: none;
  background: none;
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

input[type="text"],
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

input[type="text"]:focus,
textarea:focus {
  border-color: #5b5fab;
  outline: none;
  box-shadow: 0 0 0 3px rgba(91, 95, 171, 0.1);
}

.actions-cell {
  text-align: right;
  white-space: nowrap;
}

.text-right {
  text-align: right;
}

.text-muted {
  color: #777;
  font-size: 13px;
}

.font-medium {
  font-weight: 500;
}
</style>