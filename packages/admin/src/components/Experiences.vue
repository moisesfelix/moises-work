<template>
  <div>
    <h1>Experiences</h1>
    <p>Manage your experiences here.</p>

    <button @click="openAddExperienceDialog">Add Experience</button>

    <div v-if="experiences.length > 0">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Company</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="experience in experiences" :key="experience.id">
            <td>{{ experience.title }}</td>
            <td>{{ experience.company }}</td>
            <td>{{ experience.description }}</td>
            <td>
              <button @click="openEditExperienceDialog(experience)">Edit</button>
              <button @click="deleteExperience(experience)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p>No experiences available.</p>
    </div>

    <!-- Add/Edit Experience Dialog -->
    <div v-if="showExperienceDialog" class="dialog-overlay">
      <div class="dialog">
        <h2>{{ editingExperience ? 'Edit Experience' : 'Add Experience' }}</h2>
        <label for="title">Title:</label>
        <input type="text" id="title" v-model="experienceForm.title" />

        <label for="company">Company:</label>
        <input type="text" id="company" v-model="experienceForm.company" />

        <label for="description">Description:</label>
        <textarea id="description" v-model="experienceForm.description"></textarea>

        <button @click="saveExperience">Save</button>
        <button @click="closeExperienceDialog">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';
import { mapState, mapActions } from 'vuex';

export default {
  name: 'Experiences',
  data() {
    return {
      showExperienceDialog: false,
      editingExperience: null,
      experienceForm: {
        id: null,
        title: '',
        company: '',
        description: ''
      }
    };
  },
  computed: {
    ...mapState(['experiences'])
  },
  mounted() {
    this.fetchAllData();
  },
  methods: {
    ...mapActions(['fetchAllData']),
    openAddExperienceDialog() {
      this.editingExperience = null;
      this.experienceForm = {
        id: null,
        title: '',
        company: '',
        description: ''
      };
      this.showExperienceDialog = true;
    },
    openEditExperienceDialog(experience) {
      this.editingExperience = experience;
      this.experienceForm = { ...experience };
      this.showExperienceDialog = true;
    },
    closeExperienceDialog() {
      this.showExperienceDialog = false;
      this.editingExperience = null;
      this.experienceForm = {
        id: null,
        title: '',
        company: '',
        description: ''
      };
    },
    async saveExperience() {
      const experienceData = { ...this.experienceForm };
      let updatedExperiences = [...this.experiences];

      if (this.editingExperience) {
        const index = updatedExperiences.findIndex(e => e.id === experienceData.id);
        if (index !== -1) {
          updatedExperiences[index] = experienceData;
        }
      } else {
        experienceData.id = uuidv4();
        updatedExperiences.push(experienceData);
      }
      
      await this.$store.dispatch('saveData', { type: 'experiences', data: updatedExperiences });
      this.closeExperienceDialog();
    },
    async deleteExperience(experience) {
      if (confirm('Are you sure you want to delete this experience?')) {
        const updatedExperiences = this.experiences.filter(e => e.id !== experience.id);
        await this.$store.dispatch('saveData', { type: 'experiences', data: updatedExperiences });
      }
    }
  }
};
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  min-width: 400px;
  max-width: 500px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input[type="text"],
textarea {
  width: 100%;
  padding: 8px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

button {
  margin-right: 10px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  opacity: 0.9;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th,
td {
  border: 1px solid #ddd;
  padding: 12px;
  text-align: left;
}

th {
  background-color: #f4f4f4;
  font-weight: bold;
}

tr:nth-child(even) {
  background-color: #f9f9f9;
}

tr:hover {
  background-color: #f5f5f5;
}
</style>