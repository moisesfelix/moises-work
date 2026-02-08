<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h1 class="page-title">Habilidades</h1>
        <p class="page-subtitle">Gerencie suas categorias e habilidades</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-primary" @click="openAddCategoryDialog">
          + Nova Categoria
        </button>
      </div>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="spinner-large"></div>
    </div>

    <div v-else class="skills-grid">
      <div v-for="(tools, category) in skills" :key="category" class="card">
        <div class="card-header">
          <h3>{{ category }}</h3>
          <div class="card-actions">
            <button @click="openAddToolDialog(category)" class="btn-icon add" title="Adicionar Ferramenta">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            </button>
            <button @click="deleteCategory(category)" class="btn-icon delete" title="Excluir Categoria">
               <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
        <div class="card-body">
          <ul v-if="tools && tools.length > 0" class="tools-list">
            <li v-for="(tool, index) in tools" :key="index">
              <span class="tool-name">{{ tool.name }}</span>
              <div class="progress-bar">
                <div class="progress" :style="{ width: tool.percent + '%' }"></div>
              </div>
              <span class="tool-level">{{ tool.percent }}%</span>
              <div class="tool-actions">
                <button @click="openEditToolDialog(category, tool)" class="btn-icon edit" title="Editar">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </button>
                <button @click="deleteTool(category, tool.name)" class="btn-icon delete" title="Excluir">
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </li>
          </ul>
          <p v-else class="empty-tools">Nenhuma ferramenta adicionada.</p>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <transition name="fade">
      <div v-if="showCategoryDialog" class="modal-overlay" @click.self="closeDialogs">
        <div class="modal-content">
          <div class="modal-header"><h2>Nova Categoria de Habilidade</h2></div>
          <form @submit.prevent="saveCategory" class="modal-body">
            <div class="form-group">
              <label for="categoryName">Nome da Categoria</label>
              <input id="categoryName" v-model="categoryForm.name" required placeholder="Ex: Frontend" />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeDialogs">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar</button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div v-if="showToolDialog" class="modal-overlay" @click.self="closeDialogs">
        <div class="modal-content">
          <div class="modal-header"><h2>{{ toolForm.isEditing ? 'Editar Ferramenta' : 'Nova Ferramenta' }} em {{ toolForm.category }}</h2></div>
          <form @submit.prevent="saveTool" class="modal-body">
            <div class="form-group">
              <label for="toolName">Nome da Ferramenta</label>
              <input id="toolName" v-model="toolForm.name" required placeholder="Ex: Vue.js" />
            </div>
            <div class="form-group">
              <label for="toolLevel">Nível de Proficiência ({{ toolForm.percent }}%)</label>
              <input type="range" id="toolLevel" v-model.number="toolForm.percent" min="0" max="100" />
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeDialogs">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar</button>
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

const store = useStore();
const skills = computed(() => store.state.skills);
const loading = computed(() => store.state.loading);

const showCategoryDialog = ref(false);
const showToolDialog = ref(false);

const categoryForm = ref({ name: '' });
const toolForm = ref({
  category: '',
  name: '',
  percent: 80,
  isEditing: false,
  originalName: ''
});

onMounted(() => {
  store.dispatch('fetchAllData');
});

const openAddCategoryDialog = () => {
  categoryForm.value.name = '';
  showCategoryDialog.value = true;
};

const saveCategory = async () => {
  if (!categoryForm.value.name) return;
  const newSkills = { ...skills.value, [categoryForm.value.name]: [] }; // Use array
  await store.dispatch('saveData', { type: 'skills', data: newSkills });
  closeDialogs();
};

const deleteCategory = async (category: string) => {
  if (confirm(`Tem certeza que deseja excluir a categoria "${category}" e todas as suas ferramentas?`)) {
    const newSkills = { ...skills.value };
    delete newSkills[category];
    await store.dispatch('saveData', { type: 'skills', data: newSkills });
  }
};

const openAddToolDialog = (category: string) => {
  toolForm.value = {
    category,
    name: '',
    percent: 80,
    isEditing: false,
    originalName: ''
  };
  showToolDialog.value = true;
};

const openEditToolDialog = (category: string, tool: {name: string, percent: number}) => {
  toolForm.value = {
    category,
    name: tool.name,
    percent: tool.percent,
    isEditing: true,
    originalName: tool.name
  };
  showToolDialog.value = true;
};

const saveTool = async () => {
  const { category, name, percent, isEditing, originalName } = toolForm.value;
  if (!category || !name) return;

  const newSkills = { ...skills.value };
  const tools = newSkills[category] ? [...newSkills[category]] : [];

  if (isEditing) {
    const toolIndex = tools.findIndex(t => t.name === originalName);
    if (toolIndex !== -1) {
      tools[toolIndex] = { name, percent };
    }
  } else {
    tools.push({ name, percent });
  }

  newSkills[category] = tools;

  await store.dispatch('saveData', { type: 'skills', data: newSkills });
  closeDialogs();
};

const deleteTool = async (category: string, toolName: string) => {
  if (confirm(`Excluir a ferramenta "${toolName}" da categoria "${category}"?`)) {
    const newSkills = { ...skills.value };
    const tools = newSkills[category].filter((t: {name: string}) => t.name !== toolName);
    newSkills[category] = tools;
    await store.dispatch('saveData', { type: 'skills', data: newSkills });
  }
};

const closeDialogs = () => {
  showCategoryDialog.value = false;
  showToolDialog.value = false;
};
</script>

<style scoped>
/* General Styles */
.page-container { padding: 20px; background-color: #f5f7fb; min-height: 100vh; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
.page-title { font-size: 24px; font-weight: 600; }
.page-subtitle { color: #888; font-size: 14px; }
.header-actions { display: flex; gap: 10px; }
.loading-state { text-align: center; padding-top: 50px; }
.spinner-large { width: 40px; height: 40px; border: 4px solid rgba(0,0,0,0.1); border-top-color: #5b5fab; border-radius: 50%; animation: spin 1s linear infinite; margin: auto; }

/* Grid */
.skills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }

/* Card */
.card { background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.card-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #eee; }
.card-header h3 { margin: 0; font-size: 16px; font-weight: 600; }
.card-actions { display: flex; gap: 5px; }
.card-body { padding: 20px; }
.empty-tools { color: #888; text-align: center; margin: 0; }

/* Tools List */
.tools-list { list-style: none; margin: 0; padding: 0; }
.tools-list li { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
.tool-name { font-weight: 500; flex: 1; }
.progress-bar { width: 100px; height: 8px; background-color: #e0e0e0; border-radius: 4px; overflow: hidden; }
.progress { height: 100%; background-color: #5b5fab; border-radius: 4px 0 0 4px; transition: width 0.3s; }
.tool-level { font-size: 12px; font-weight: 600; min-width: 35px; text-align: right; }
.tool-actions { display: flex; gap: 5px; }

/* Buttons */
.btn { padding: 10px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; border: 1px solid transparent; }
.btn-primary { background-color: #5b5fab; color: white; }
.btn-secondary { background-color: #e0e0e0; color: #333; }
.btn-icon { background: none; padding: 4px; border-radius: 4px; border: none; cursor: pointer; margin-left: 5px; color: #888; }
.btn-icon:hover { color: #333; }
.btn-icon.add { color: #27ae60; }
.btn-icon.edit { color: #5b5fab; }
.btn-icon.delete { color: #e74c3c; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
.modal-content { background: white; width: 90%; max-width: 450px; border-radius: 10px; }
.modal-header { padding: 20px; font-size: 18px; font-weight: 600; border-bottom: 1px solid #eee; }
.modal-body { padding: 20px; }
.modal-footer { padding: 20px; display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #eee; }
.form-group { margin-bottom: 20px; }
label { display: block; margin-bottom: 8px; font-weight: 600; }
input[type="text"], input[type="email"], input[type="url"] { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; }
input[type="range"] { width: 100%; }

@keyframes spin { to { transform: rotate(360deg); } }
</style>
