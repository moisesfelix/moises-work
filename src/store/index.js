import { createStore } from 'vuex'
import db from '../db.json' with { type: 'json' }

const store = createStore({
  state() {
    return {
      projects: db.projects,
      articles: db.articles,
      tutorials: db.tutorials,
      skills: db.skills,
      experiences: db.experiences
    }
  },
  getters: {
    getArticleBySlug: (state) => (slug) => {
        return state.articles.find(article => article.slug === slug);
    },
    getTutorialBySlug: (state) => (slug) => {
        return state.tutorials.find(tutorial => tutorial.slug === slug);
    },
    getLatestArticles: (state) => (limit = 3) => {
        return state.articles.slice(0, limit);
    }
  }
})

export default store
