import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { getAuth } from 'firebase/auth';
import UnifiedLayout from '@/layouts/UnifiedLayout.vue';

// Public Views
import Home from '@/views/portfolio/Home.vue';
import About from '@/views/portfolio/About.vue';
import Experience from '@/views/portfolio/Experience.vue';
import Skills from '@/views/portfolio/Skills.vue';
import Portfolio from '@/views/portfolio/Portfolio.vue';
import Blog from '@/views/portfolio/Blog.vue';
import Article from '@/views/portfolio/Article.vue';
import PublicTutorials from '@/views/portfolio/Tutorials.vue';
import Tutorial from '@/views/portfolio/Tutorial.vue';
import Contact from '@/views/portfolio/Contact.vue';

// Admin Views
import Login from '@/views/auth/Login.vue';
import Dashboard from '@/views/admin/dashboard/Dashboard.vue';
import AdminProjects from '@/views/admin/projects/Projects.vue';
import AdminArticles from '@/views/admin/articles/Articles.vue';
import AdminTutorials from '@/views/admin/tutorials/Tutorials.vue';
import AdminExperiences from '@/views/admin/experiences/Experiences.vue';
import AdminSkills from '@/views/admin/skills/Skills.vue';
import AdminAbout from '@/views/admin/about/About.vue';
import AdminContact from '@/views/admin/contact/Contact.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: UnifiedLayout, // Use UnifiedLayout as the parent
    children: [
      // Public Routes
      { path: '', component: Home, name: 'Home' },
      { path: 'sobre', component: About, name: 'About' },
      { path: 'experiencia', component: Experience, name: 'Experience' },
      { path: 'habilidades', component: Skills, name: 'Skills' },
      { path: 'portfolio', component: Portfolio, name: 'Portfolio' },
      { path: 'blog', component: Blog, name: 'Blog' },
      { path: 'artigo/:slug', component: Article, name: 'Article' },
      { path: 'tutoriais', component: PublicTutorials, name: 'PublicTutorials' },
      { path: 'tutorial/:slug', component: Tutorial, name: 'Tutorial' },
      { path: 'contato', component: Contact, name: 'Contact' },
      { 
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { requiresAuth: false }
      }
    ]
  },
  {
    path: '/admin',
    component: UnifiedLayout, // Use UnifiedLayout as the parent
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: Dashboard,
        meta: { title: 'Dashboard' }
      },
      {
        path: 'about',
        name: 'AdminAbout',
        component: AdminAbout,
        meta: { title: 'Sobre' }
      },
      {
        path: 'projects',
        name: 'AdminProjects',
        component: AdminProjects,
        meta: { title: 'Projetos' }
      },
      {
        path: 'articles',
        name: 'AdminArticles',
        component: AdminArticles,
        meta: { title: 'Artigos' }
      },
      {
        path: 'tutorials',
        name: 'AdminTutorials',
        component: AdminTutorials,
        meta: { title: 'Tutoriais' }
      },
      {
        path: 'experiences',
        name: 'AdminExperiences',
        component: AdminExperiences,
        meta: { title: 'Experiências' }
      },
      {
        path: 'skills',
        name: 'AdminSkills',
        component: AdminSkills,
        meta: { title: 'Habilidades' }
      },
      {
        path: 'contact',
        name: 'AdminContact',
        component: AdminContact,
        meta: { title: 'Contato' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  }
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  if (requiresAuth) {
    const auth = getAuth();
    const user = auth.currentUser; // Get the current user synchronously

    if (user) {
      next(); // User is authenticated, proceed to the route
    } else {
      // User is not authenticated, redirect to login, preserving the current path
      next({
        path: '/login',
        query: { redirectedFrom: to.fullPath },
      });
    }
  } else {
    next(); // Non-protected route, proceed
  }
});

export default router
