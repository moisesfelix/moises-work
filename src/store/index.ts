import { createStore, Store } from 'vuex';
import db from '../db.json';

// Defina os tipos para o seu estado
interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
  tags: string[];
}

interface Article {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
}

interface Tutorial {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
}

interface Skill {
  name: string;
  level: number;
}

interface Experience {
  company: string;
  role: string;
  period: string;
  description: string;
}

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
