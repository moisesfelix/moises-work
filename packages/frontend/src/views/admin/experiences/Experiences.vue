<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="page-title">Gerenciar Experiências</h1>
      <p class="page-subtitle">Adicione, edite e remova suas experiências profissionais.</p>
    </div>
    <div class="card">
      <div v-if="loading" class="loading-state">
        <div class="spinner-large"></div>
        <p>Carregando experiências...</p>
      </div>

      <div v-else-if="experiences.length > 0" class="table-responsive">
            <div class="header-actions">
        <button class="btn btn-primary" @click="openAddExperienceDialog">
          + Adicionar Experiência
        </button>
      </div>
        <table class="custom-table">
          <thead>
            <tr>
              <th width="20%">Data</th>
              <th width="25%">Título</th>
              <th width="20%">Empresa</th>
              <th width="25%">Descrição</th>
              <th width="10%" class="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="exp in experiences" :key="exp.id">
              <td>{{ exp.date }}</td>
              <td class="font-medium">{{ exp.title }}</td>
              <td>{{ exp.company }}</td>
              <td class="text-muted">{{ truncateText(exp.description, 60) }}</td>
              <td class="actions-cell">
                <button @click="navigateToExperience()" class="btn-icon view" title="Ver Publicado">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
                <button @click="openEditExperienceDialog(exp)" class="btn-icon edit" title="Editar">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </button>
                <button @click="handleDeleteExperience(exp)" class="btn-icon delete" title="Excluir">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-else class="empty-state">
        <p>Nenhuma experiência encontrada.</p>
        <button @click="openAddExperienceDialog" class="btn btn-outline">Adicionar primeira experiência</button>
      </div>
    </div>

    <transition name="fade">
      <div v-if="showExperienceDialog" class="modal-overlay" @click.self="closeExperienceDialog">
        <div class="modal-content">
          <div class="modal-header">
            <h2>{{ editingExperience ? 'Editar Experiência' : 'Nova Experiência' }}</h2>
            <button class="close-btn" @click="closeExperienceDialog">&times;</button>
          </div>
          
          <form @submit.prevent="saveExperience" class="modal-body">
            <div class="form-group">
              <label for="date">Data</label>
              <input type="text" id="date" v-model="experienceForm.date" required placeholder="Ex: 2020 - Presente" />
            </div>

            <div class="form-group">
              <label for="title">Título</label>
              <input type="text" id="title" v-model="experienceForm.title" required placeholder="Ex: Desenvolvedor Full-Stack" />
            </div>
            
            <div class="form-group">
              <label for="company">Empresa</label>
              <input type="text" id="company" v-model="experienceForm.company" required placeholder="Ex: Google" />
            </div>

            <div class="form-group">
              <div class="label-container">
                <label for="description">Descrição</label>
                <div class="ai-switch">
                  <span>Gerar com IA</span>
                  <label class="switch">
                    <input type="checkbox" v-model="aiEnabled">
                    <span class="slider round"></span>
                  </label>
                </div>
              </div>
              <div v-if="aiEnabled" class="ai-input-group">
                <input type="text" v-model="aiPrompt" placeholder="Digite os pontos chave da experiência..." />
                <button type="button" @click="generateDescription" class="btn btn-ai-generate" :disabled="generating">
                  <span v-if="generating" class="spinner"></span>
                  {{ generating ? '' : 'Gerar' }}
                </button>
              </div>
              <textarea id="description" v-model="experienceForm.description" required rows="5"></textarea>
            </div>

            <div class="form-group">
              <label for="tags">Tags (separadas por vírgula)</label>
              <input type="text" id="tags" v-model="tagsInput" placeholder="Ex: Vue.js, Node.js, Firebase" />
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeExperienceDialog">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { usePortfoliosStore } from "@/stores/portfolios";
import { useUiStore }         from "@/stores/ui";
import { apiGeminiService }   from "@/services/api.gemini.service";
import { v4 as uuidv4 }       from "uuid";

const portfoliosStore = usePortfoliosStore();
const uiStore         = useUiStore();
const experiences     = computed(() => portfoliosStore.experiences || []);
const activeSlug      = computed(() => portfoliosStore.activePortfolioSlug);
const loading         = computed(() => uiStore.isLoading);

const showExperienceDialog = ref(false);
const editingExperience    = ref<any>(null);
const tagsInput            = ref("");
const aiEnabled            = ref(false);
const aiPrompt             = ref("");
const generating           = ref(false);

const experienceForm = ref({
  id:          null as string | null,
  date:        "",
  title:       "",
  company:     "",
  description: "",
  tags:        [] as string[],
});

onMounted(() => portfoliosStore.fetchPortfolioData());
watch(editingExperience, (v) => { tagsInput.value = v?.tags ? v.tags.join(", ") : ""; });

const openAddExperienceDialog  = () => { editingExperience.value = null; resetForm(); showExperienceDialog.value = true; };
const openEditExperienceDialog = (exp: any) => { editingExperience.value = exp; experienceForm.value = { ...exp }; showExperienceDialog.value = true; };
const closeExperienceDialog    = () => { showExperienceDialog.value = false; editingExperience.value = null; resetForm(); };
const resetForm = () => { tagsInput.value = ""; aiEnabled.value = false; aiPrompt.value = ""; experienceForm.value = { id: null, date: "", title: "", company: "", description: "", tags: [] }; };

const saveExperience = async () => {
  experienceForm.value.tags = tagsInput.value.split(",").map((t) => t.trim()).filter(Boolean);
  const data = { ...experienceForm.value };
  let list   = [...experiences.value];
  if (editingExperience.value) {
    const idx = list.findIndex((e: any) => e.id === data.id);
    if (idx !== -1) list[idx] = data;
  } else {
    data.id = uuidv4();
    list.push(data);
  }
  await portfoliosStore.saveData({ type: "experiences", data: list });
  closeExperienceDialog();
};

const handleDeleteExperience = async (exp: any) => {
  if (confirm(`Excluir "${exp.title}"?`)) {
    await portfoliosStore.saveData({ type: "experiences", data: experiences.value.filter((e: any) => e.id !== exp.id) });
  }
};

const generateDescription = async () => {
  if (!aiPrompt.value.trim()) { alert("Insira um prompt para a IA."); return; }
  generating.value = true;
  try {
    const result = await apiGeminiService.generateText(
      `Redator de currículos profissional. Com base em: "${aiPrompt.value}", escreva uma descrição concisa (máximo 2 frases, sem Markdown).`
    );
    experienceForm.value.description = result.replace(/[*#_]/g, "").trim();
  } catch { alert("Falha ao gerar descrição."); }
  finally   { generating.value = false; }
};

const navigateToExperience = () => {
  if (activeSlug.value) {
    window.open(`/${activeSlug.value}/experiencia`, '_blank');
  } else {
    alert("Não foi possível abrir a experiência. Verifique se o slug existe.");
  }
};

const truncateText = (text: string, length: number) => !text ? "" : text.length > length ? text.substring(0, length) + "..." : text;
</script>

<style scoped>
/* Estilos gerais reutilizados para consistência */
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
  overflow: hidden;
}

.table-responsive { width: 100%; overflow-x: auto; }
.custom-table { width: 100%; border-collapse: collapse; }

.custom-table th {
  background-color: #f8f9fa;
  color: #555;
  font-weight: 600;
  text-align: left;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  font-size: 13px;
}

.custom-table td {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  vertical-align: middle;
}

.btn {
  padding: 10px 20px; border-radius: 6px; cursor: pointer;
  font-size: 14px; font-weight: 500;
  display: inline-flex; align-items: center; gap: 6px;
  border: 1px solid transparent;
}
.btn-primary { background-color: #5b5fab; color: white; }
.btn-secondary { background-color: #e0e0e0; color: #333; }

.btn-icon {
  background: none; padding: 6px; border-radius: 4px;
  border: none; cursor: pointer; margin-left: 5px;
}
.btn-icon.edit { color: #5b5fab; }
.btn-icon.delete { color: #e74c3c; }

.btn-icon.view {
  color: #3498db;
  background-color: #ebf5fb;
}

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.modal-content {
  background: white; width: 90%; max-width: 550px;
  border-radius: 10px;
}
.modal-header { padding: 20px; display: flex; justify-content: space-between; }
.modal-header h2 { margin: 0; font-size: 18px; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; }
.modal-body { padding: 20px; }
.modal-footer { padding: 20px; display: flex; justify-content: flex-end; gap: 10px; }

.form-group { margin-bottom: 15px; }
label { display: block; margin-bottom: 6px; font-weight: 600; }
input, textarea {
  width: 100%; padding: 10px; border: 1px solid #ddd;
  border-radius: 6px;
}

.label-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.ai-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.switch {
  position: relative;
  display: inline-block;
  width: 34px;
  height: 20px;
}

.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 12px;
  width: 12px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #5b5fab;
}

input:checked + .slider:before {
  transform: translateX(14px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.ai-input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.ai-input-group input {
  flex: 1;
}

.btn-ai-generate {
  padding: 0 15px;
  background-color: #5b5fab;
  color: white;
  height: 38px;
}
.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>