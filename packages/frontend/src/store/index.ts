import { createStore, Store } from 'vuex';
import db from '../db.json';
import type { Project, Article, Tutorial, Skill, Experience } from 'shared';

// Defina os tipos para o seu estado
interface State {
  projects: Project[];
  articles: Article[];
  tutorials: Tutorial[];
  skills: Skill[];
  experiences: Experience[];
}


const store: Store<State> = createStore({
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
    getArticleBySlug: (state) => (slug: string) => {
        return state.articles.find(article => article.slug === slug);
    },
    getTutorialBySlug: (state) => (slug: string) => {
        return state.tutorials.find(tutorial => tutorial.slug === slug);
    },
    getLatestArticles: (state) => (limit: number = 3) => {
        return state.articles.slice(0, limit);
    }
  }
})

export default store
