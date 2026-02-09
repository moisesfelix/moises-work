<template>
  <div class="page-container">
    <header class="page-header">
      <div>
        <h1 class="page-title">Projetos</h1>
        <p class="page-subtitle">Gerencie os projetos exibidos no portfólio</p>
      </div>
      <button @click="openAddProjectDialog" class="btn btn-primary">
        + Novo Projeto
      </button>
    </header>

    <div class="card">
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
        <button @click="openAddProjectDialog" class="btn btn-outline">
          Começar agora
        </button>
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
              <label>Imagem do Projeto</label>

              <div class="image-upload-area">
                <div v-if="projectForm.image" class="preview-container">
                  <img :src="projectForm.image" alt="Preview" class="image-preview" />
                  <button @click="removeImage" class="btn-remove-image" title="Remover imagem">&times;</button>
                </div>

                <div v-else class="upload-placeholder" @click="$refs.fileInput.click()">
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

            <div class="form-group">
              <label for="githubUrl">URL do Repositório GitHub</label>
              <input type="text" id="githubUrl" v-model="projectForm.githubUrl" placeholder="https://github.com/..." />
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
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';
import { mapState, mapActions } from 'vuex';
// IMPORTANTE: Ajuste o caminho abaixo para onde você salvou o arquivo storage.service.ts
import { storageService } from '@/services/storage.service';

export default {
  name: 'Projects',
  data() {
    return {
      showProjectDialog: false,
      editingProject: null,
      isUploading: false,
      uploadError: null,
      placeholderImage: 'https://via.placeholder.com/50',
      projectForm: {
        id: null,
        title: '',
        description: '',
        image: '',
        tags: '',
        category: '',
        githubUrl: '',
        articleUrl: '',
        tutorialUrl: ''
      }
    };
  },
  computed: {
    ...mapState(['projects'])
  },
  mounted() {
    this.fetchAllData();
  },
  methods: {
    ...mapActions(['fetchAllData']),

    truncateText(text, length) {
      if (!text) return '';
      return text.length > length ? text.substring(0, length) + '...' : text;
    },

    // --- Lógica de Upload ---
    async handleImageUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Validação simples de tipo
      if (!file.type.startsWith('image/')) {
        this.uploadError = "Por favor, selecione apenas arquivos de imagem.";
        return;
      }

      this.isUploading = true;
      this.uploadError = null;

      try {
        // Usa o serviço fornecido para enviar para a pasta 'projects'
        const downloadURL = await storageService.uploadImage(file, 'projects');
        this.projectForm.image = downloadURL;
      } catch (error) {
        console.error("Erro no upload:", error);
        this.uploadError = "Falha ao enviar imagem. Tente novamente.";
      } finally {
        this.isUploading = false;
        // Limpa o input para permitir selecionar o mesmo arquivo novamente se necessário
        event.target.value = '';
      }
    },

    async removeImage() {
      // Opcional: Se quiser deletar do storage imediatamente ao remover do form
      // Mas cuidado: se o usuário clicar em "Cancelar" no modal, a imagem foi deletada sem querer.
      // Por segurança, apenas limpamos o campo URL aqui.
      this.projectForm.image = '';
    },
    // ------------------------

    openAddProjectDialog() {
      this.editingProject = null;
      this.resetForm();
      this.showProjectDialog = true;
    },
    openEditProjectDialog(project) {
      this.editingProject = project;
      this.projectForm = { ...project, tags: project.tags ? project.tags.join(', ') : '' };
      this.showProjectDialog = true;
    },
    closeProjectDialog() {
      this.showProjectDialog = false;
      this.editingProject = null;
      this.resetForm();
    },
    resetForm() {
      this.isUploading = false;
      this.uploadError = null;
      this.projectForm = {
        id: null,
        title: '',
        description: '',
        image: '',
        tags: '',
        category: '',
        githubUrl: '',
        articleUrl: '',
        tutorialUrl: ''
      };
    },
    async saveProject() {
      const projectData = { ...this.projectForm, tags: this.projectForm.tags ? this.projectForm.tags.split(',').map(tag => tag.trim()) : [] };
      let updatedProjects = [...this.projects];

      if (this.editingProject) {
        const index = updatedProjects.findIndex(p => p.id === projectData.id);
        if (index !== -1) {
          updatedProjects[index] = projectData;
        }
      } else {
        projectData.id = uuidv4();
        updatedProjects.push(projectData);
      }

      await this.$store.dispatch('saveData', { type: 'projects', data: updatedProjects });
      this.closeProjectDialog();
    },
    async deleteProject(project) {
      if (confirm('Tem certeza que deseja excluir este projeto?')) {
        // Tenta deletar a imagem do storage antes de deletar o dado (limpeza)
        if (project.image) {
          try {
            await storageService.deleteImage(project.image);
          } catch (e) {
            console.warn('Não foi possível deletar a imagem do storage, prosseguindo com a exclusão do registro.');
          }
        }

        const updatedProjects = this.projects.filter(p => p.id !== project.id);
        await this.$store.dispatch('saveData', { type: 'projects', data: updatedProjects });
      }
    }
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