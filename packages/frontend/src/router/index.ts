import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import { getAuth } from 'firebase/auth';
import UnifiedLayout from '@/layouts/UnifiedLayout.vue';
import PortfolioLayout from '@/layouts/PortfolioLayout.vue';
import LandingPage from '@/views/LandingPage.vue';

// Public Views (Portfolio Specific)
import Home from '@/views/portfolio/Home.vue';
import About from '@/views/portfolio/About.vue';
import Experience from '@/views/portfolio/Experience.vue';
import Skills from '@/views/portfolio/Skills.vue';
import Projects from '@/views/portfolio/Projects.vue'; // RENOMEADO
import Project from '@/views/portfolio/Project.vue';   // NOVO
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
import AdminRoadmap from '@/views/admin/roadmap/Roadmap.vue';
import AdminCredits from '@/views/admin/credits/Credits.vue'; // NOVA
import NexusSprint from '@/views/admin/nexus-sprint/NexusSprint.vue';
import AnalysisList from '@/views/admin/nexus-sprint/AnalysisList.vue';
import AnalysisDetails from '@/views/admin/nexus-sprint/AnalysisDetails.vue';


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: LandingPage,
    name: 'LandingPage'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false },
    beforeEnter: async (to, from, next) => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        next('/admin/dashboard');
      } else {
        next();
      }
    }
  },
  {
    path: '/admin',
    component: UnifiedLayout,
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
      },
      {
        path: 'roadmap',
        name: 'AdminRoadmap',
        component: AdminRoadmap,
        meta: { title: 'Trajetória' }
      },
      {
        path: 'credits',
        name: 'AdminCredits',
        component: () => import('@/views/admin/credits/Credits.vue'),
        meta: { title: 'Créditos & Planos' }
      },
      {
        path: 'nexus-sprint',
        name: 'AdminNexusSprint',
        component: NexusSprint,
        meta: { title: 'Nexus Sprint' }
      },
      {
        path: 'nexus-sprint/list',
        name: 'AdminNexusSprintList',
        component: AnalysisList,
        meta: { title: 'Nexus Sprint Analyses' }
      },
      {
        path: 'nexus-sprint/:id',
        name: 'AdminNexusSprintDetails',
        component: AnalysisDetails,
        meta: { title: 'Nexus Sprint Analysis Details' }
      },
    ]
  },
  // Portfolio Routes (Dynamic Slug)
  {
    path: '/:slug',
    component: PortfolioLayout,
    children: [
      { path: '', component: Home, name: 'PortfolioHome' },
      { path: 'sobre', component: About, name: 'PortfolioAbout' },
      { path: 'experiencia', component: Experience, name: 'PortfolioExperience' },
      { path: 'habilidades', component: Skills, name: 'PortfolioSkills' },
      { path: 'projetos', component: Projects, name: 'PortfolioProjects' },
      { path: 'projeto/:id', component: Project, name: 'PortfolioProject' }, // NOVA ROTA
      { path: 'blog', component: Blog, name: 'PortfolioBlog' },
      { path: 'artigo/:articleSlug', component: Article, name: 'PortfolioArticle' },
      { path: 'tutoriais', component: PublicTutorials, name: 'PortfolioTutorials' },
      { path: 'tutorial/:tutorialSlug', component: Tutorial, name: 'PortfolioTutorial' },
      { path: 'contato', component: Contact, name: 'PortfolioContact' },
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
    const user = auth.currentUser;

    if (user) {
      next();
    } else {
      next({
        path: '/login',
        query: { redirectedFrom: to.fullPath },
      });
    }
  } else {
    next();
  }
});

export default router
