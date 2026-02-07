<template>
  <div class="container">
    <h2 class="title">Gerenciar Tutoriais</h2>
    
    <div class="form-container">
      <form @submit.prevent="saveTutorial">
        <input type="hidden" v-model="form.id">
        
        <div class="form-group">
          <label for="title">Título</label>
          <input id="title" v-model="form.title" placeholder="Título do Tutorial" required>
        </div>

        <div class="form-group">
          <label for="slug">Slug</label>
          <input id="slug" v-model="form.slug" placeholder="amigavel-url-slug" required>
        </div>

        <div class="form-group">
          <label for="category">Categoria</label>
          <input id="category" v-model="form.category" placeholder="Ex: Vue.js, Firebase">
        </div>

        <div class="form-group">
          <label for="duration">Duração</label>
          <input id="duration" v-model="form.duration" placeholder="Ex: 2h 30m">
        </div>

        <div class="form-group">
          <label for="difficulty">Dificuldade</label>
          <input id="difficulty" v-model="form.difficulty" placeholder="Ex: Iniciante, Intermediário">
        </div>

        <div class="form-group">
          <label for="image">URL da Imagem</label>
          <input id="image" v-model="form.image" placeholder="https://exemplo.com/imagem.png">
        </div>

        <div class="form-group">
          <label for="excerpt">Resumo</label>
          <textarea id="excerpt" v-model="form.excerpt" placeholder="Um breve resumo do tutorial"></textarea>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Salvar Tutorial</button>
          <button type="button" class="btn btn-secondary" @click="resetForm">Cancelar</button>
        </div>
      </form>
    </div>

    <hr class="separator">

    <h3 class="subtitle">Tutoriais Existentes</h3>
    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Categoria</th>
            <th>Dificuldade</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="tutorials.length === 0">
            <td colspan="4">Nenhum tutorial encontrado.</td>
          </tr>
          <tr v-for="tutorial in tutorials" :key="tutorial.id">
            <td>{{ tutorial.title }}</td>
            <td>{{ tutorial.category }}</td>
            <td>{{ tutorial.difficulty }}</td>
            <td>
              <button class="btn btn-sm btn-info" @click="editTutorial(tutorial)">Editar</button>
              <button class="btn btn-sm btn-danger" @click="deleteTutorial(tutorial.id)">Excluir</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore();
const tutorials = computed(() => store.state.tutorials || []);

const initialFormState = {
  id: null,
  title: '',
  slug: '',
  category: '',
  duration: '',
  difficulty: '',
  image: '',
  excerpt: ''
};

const form = ref({ ...initialFormState });

const saveTutorial = () => {
  const tutorialData = { ...form.value };
  
  // Use a copy of the tutorials array from the store
  let updatedTutorials = [...(tutorials.value || [])];
  
  if (tutorialData.id) {
    // Editing existing tutorial
    const index = updatedTutorials.findIndex(t => t.id === tutorialData.id);
    if (index !== -1) {
      updatedTutorials[index] = tutorialData;
    }
  } else {
    // Adding new tutorial
    tutorialData.id = Date.now().toString(); // simple unique id
    updatedTutorials.push(tutorialData);
  }
  
  store.dispatch('saveData', { type: 'tutorials', data: updatedTutorials })
    .then(() => {
      resetForm();
    })
    .catch(error => {
      console.error("Erro ao salvar o tutorial:", error);
    });
};

const editTutorial = (tutorial) => {
  form.value = { ...tutorial };
};

const deleteTutorial = (id) => {
  if (confirm('Tem certeza de que deseja excluir este tutorial?')) {
    const updatedTutorials = (tutorials.value || []).filter(t => t.id !== id);
    store.dispatch('saveData', { type: 'tutorials', data: updatedTutorials })
      .catch(error => {
        console.error("Erro ao excluir o tutorial:", error);
      });
  }
};

const resetForm = () => {
  form.value = { ...initialFormState };
};

// Fetch data when component is mounted
onMounted(() => {
  store.dispatch('fetchAllData');
});
</script>

<style scoped>
.container {
  padding: 2rem;
  font-family: sans-serif;
}
.title, .subtitle {
  color: #333;
}
.form-container, .table-container {
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}
.form-group {
  margin-bottom: 1rem;
}
.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}
.form-group input, .form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.form-actions {
  margin-top: 1.5rem;
}
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin-right: 0.5rem;
}
.btn-primary {
  background-color: #007bff;
  color: white;
}
.btn-secondary {
  background-color: #6c757d;
  color: white;
}
.btn-info {
  background-color: #17a2b8;
  color: white;
}
.btn-danger {
  background-color: #dc3545;
  color: white;
}
.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}
.separator {
  margin: 2rem 0;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  text-align: left;
  padding: 0.75rem;
  border-bottom: 1px solid #ddd;
}
th {
  background-color: #f8f9fa;
}
</style>
