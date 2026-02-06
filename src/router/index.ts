import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '@/views/Home.vue'
import About from '@/views/About.vue'
import Experience from '@/views/Experience.vue'
import Skills from '@/views/Skills.vue'
import Portfolio from '@/views/Portfolio.vue'
import Blog from '@/views/Blog.vue'
import Article from '@/views/Article.vue'
import Tutorials from '@/views/Tutorials.vue'
import Tutorial from '@/views/Tutorial.vue'
import Contact from '@/views/Contact.vue'

const routes: Array<RouteRecordRaw> = [
  { path: '/', component: Home },
  { path: '/sobre', component: About },
  { path: '/experiencia', component: Experience },
  { path: '/habilidades', component: Skills },
  { path: '/portfolio', component: Portfolio },
  { path: '/blog', component: Blog },
  { path: '/artigo/:slug', component: Article },
  { path: '/tutoriais', component: Tutorials },
  { path: '/tutorial/:slug', component: Tutorial },
  { path: '/contato', component: Contact }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
      return { top: 0, behavior: 'smooth' };
  }
})

export default router