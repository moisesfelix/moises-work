<template>
  <div class="container">
    <h1>Skills</h1>
    <button @click="openDialog(null)">Add Skill</button>

    <div v-if="skills && Object.keys(skills).length > 0">
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Value</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(value, name) in skills" :key="name">
            <td>{{ name }}</td>
            <td>{{ value }}</td>
            <td class="actions">
              <button @click="openDialog(name, value)">Edit</button>
              <button @click="handleDelete(name)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else>No skills available.</p>

    <!-- Add/Edit Dialog -->
    <div v-if="showDialog" class="dialog-overlay">
      <div class="dialog-content">
        <h2>{{ isEditing ? 'Edit Skill' : 'Add Skill' }}</h2>
        <form @submit.prevent="handleSave">
          <label for="name">Name:</label>
          <input type="text" id="name" v-model="form.name" required />

          <label for="value">Value:</label>
          <input type="number" id="value" v-model.number="form.value" required />

          <div class="dialog-actions">
            <button type="submit">Save</button>
            <button type="button" @click="closeDialog">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import { ref, set } from 'firebase/database';
import { db } from '@/firebase/config';

export default {
  name: 'Skills',
  data() {
    return {
      showDialog: false,
      isEditing: false,
      form: {
        name: '',
        value: null,
      },
    };
  },
  computed: {
    ...mapState(['skills']),
  },
  mounted() {
    this.fetchAllData();
  },
  methods: {
    ...mapActions(['fetchAllData', 'saveSkill', 'deleteSkill']),

    openDialog(name = null, value = null) {
      if (name) {
        this.isEditing = true;
        this.form = { name, value };
      } else {
        this.isEditing = false;
        this.form = { name: '', value: null };
      }
      this.showDialog = true;
    },

    closeDialog() {
      this.showDialog = false;
    },

    async handleSave() {
      if (this.isEditing) {
        await this.saveSkill({ oldName: this.editingName, name: this.form.name, value: this.form.value });
      } else {
        await this.saveSkill({ name: this.form.name, value: this.form.value });
      }
      this.closeDialog();
    },

    async handleDelete(name) {
      if (confirm('Are you sure you want to delete this skill?')) {
        await this.deleteSkill(name);
      }
    },
  },
};
</script>

<style scoped>
.container {
  padding: 2rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.data-table th, .data-table td {
  border: 1px solid #ddd;
  padding: 8px;
}

.actions button {
  margin-right: 5px;
}

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
}

.dialog-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  min-width: 300px;
}

.dialog-actions {
  margin-top: 1rem;
  text-align: right;
}
</style>