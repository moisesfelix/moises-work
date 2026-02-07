<template>
  <div>
    <h1>Projects</h1>

    <button @click="openAddProjectDialog">Add Project</button>

    <div v-if="projects.length > 0">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="project in projects" :key="project.id">
            <td>{{ project.title }}</td>
            <td>{{ project.description }}</td>
            <td>
              <button @click="openEditProjectDialog(project)">Edit</button>
              <button @click="deleteProject(project)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p>No projects available.</p>
    </div>

    <!-- Add/Edit Project Dialog -->
    <div v-if="showProjectDialog">
      <div class="dialog">
        <h2>{{ editingProject ? 'Edit Project' : 'Add Project' }}</h2>
        <label for="title">Title:</label>
        <input type="text" id="title" v-model="projectForm.title" />

        <label for="description">Description:</label>
        <textarea id="description" v-model="projectForm.description"></textarea>

        <label for="image">Image URL:</label>
        <input type="text" id="image" v-model="projectForm.image" />

        <label for="tags">Tags (comma-separated):</label>
        <input type="text" id="tags" v-model="projectForm.tags" />

        <label for="category">Category:</label>
        <input type="text" id="category" v-model="projectForm.category" />

        <button @click="saveProject">Save</button>
        <button @click="closeProjectDialog">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';
import { mapState, mapActions } from 'vuex';

export default {
  name: 'Projects',
  data() {
    return {
      showProjectDialog: false,
      editingProject: null,
      projectForm: {
        id: null,
        title: '',
        description: '',
        image: '',
        tags: '',
        category: ''
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
    openAddProjectDialog() {
      this.editingProject = null;
      this.projectForm = {
        id: null,
        title: '',
        description: '',
        image: '',
        tags: '',
        category: ''
      };
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
      this.projectForm = {
        id: null,
        title: '',
        description: '',
        image: '',
        tags: '',
        category: ''
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
      if (confirm('Are you sure you want to delete this project?')) {
        const updatedProjects = this.projects.filter(p => p.id !== project.id);
        await this.$store.dispatch('saveData', { type: 'projects', data: updatedProjects });
      }
    }
  }
};
</script>

<style scoped>
.dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog > div {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input[type="text"],
textarea {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
