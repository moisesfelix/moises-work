<template>
  <div>
    <h1>Articles</h1>

    <button @click="openAddArticleDialog">Add Article</button>

    <div v-if="articles.length > 0">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="article in articles" :key="article.id">
            <td>{{ article.title }}</td>
            <td>{{ article.description }}</td>
            <td>
              <button @click="openEditArticleDialog(article)">Edit</button>
              <button @click="handleDeleteArticle(article)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else>
      <p>No articles available.</p>
    </div>

    <!-- Add/Edit Article Dialog -->
    <div v-if="showArticleDialog" class="dialog-overlay">
      <div class="dialog-content">
        <h2>{{ editingArticle ? 'Edit Article' : 'Add Article' }}</h2>
        <form @submit.prevent="saveArticle">
          <div>
            <label for="title">Title:</label>
            <input type="text" id="title" v-model="articleForm.title" required />
          </div>

          <div>
            <label for="description">Description:</label>
            <textarea id="description" v-model="articleForm.description" required></textarea>
          </div>

          <div>
            <button type="submit">Save</button>
            <button type="button" @click="closeArticleDialog">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { v4 as uuidv4 } from 'uuid';
import { mapState, mapActions } from 'vuex';

export default {
  name: 'Articles',
  data() {
    return {
      showArticleDialog: false,
      editingArticle: null,
      articleForm: {
        id: null,
        title: '',
        description: ''
      }
    };
  },
  computed: {
    ...mapState(['articles'])
  },
  mounted() {
    this.fetchAllData();
  },
  methods: {
    ...mapActions(['fetchAllData']),
    openAddArticleDialog() {
      this.editingArticle = null;
      this.articleForm = {
        id: null,
        title: '',
        description: ''
      };
      this.showArticleDialog = true;
    },
    openEditArticleDialog(article) {
      this.editingArticle = article;
      this.articleForm = { ...article };
      this.showArticleDialog = true;
    },
    closeArticleDialog() {
      this.showArticleDialog = false;
      this.editingArticle = null;
      this.articleForm = {
        id: null,
        title: '',
        description: ''
      };
    },
    async saveArticle() {
      const articleData = { ...this.articleForm };
      let updatedArticles = [...this.articles];

      if (this.editingArticle) {
        const index = updatedArticles.findIndex(a => a.id === articleData.id);
        if (index !== -1) {
          updatedArticles[index] = articleData;
        }
      } else {
        articleData.id = uuidv4();
        updatedArticles.push(articleData);
      }
      
      await this.$store.dispatch('saveData', { type: 'articles', data: updatedArticles });
      this.closeArticleDialog();
    },
    async handleDeleteArticle(article) {
      if (confirm(`Are you sure you want to delete "${article.title}"?`)) {
        const updatedArticles = this.articles.filter(a => a.id !== article.id);
        await this.$store.dispatch('saveData', { type: 'articles', data: updatedArticles });
      }
    }
  }
};
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

button {
  margin-right: 5px;
  cursor: pointer;
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

.dialog-content div {
    margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input[type="text"],
textarea {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
