import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import AdminLayout from '@/layouts/AdminLayout.vue';
import Login from '@/views/auth/Login.vue';
import Dashboard from '@/views/admin/dashboard/Dashboard.vue';
import Projects from '@/views/admin/projects/Projects.vue';
import Articles from '@/views/admin/articles/Articles.vue';
import Tutorials from '@/views/admin/tutorials/Tutorials.vue';
import Experiences from '@/views/admin/experiences/Experiences.vue';
import Skills from '@/views/admin/skills/Skills.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: 'Dashboard' }
      },
      {
        path: 'projects',
        name: 'Projects',
        component: Projects,
        meta: { title: 'Projetos' }
      },
      {
        path: 'articles',
        name: 'Articles',
        component: Articles,
        meta: { title: 'Artigos' }
      },
      {
        path: 'tutorials',
        name: 'Tutorials',
        component: Tutorials,
        meta: { title: 'Tutoriais' }
      },
      {
        path: 'experiences',
        name: 'Experiences',
        component: Experiences,
        meta: { title: 'Experiências' }
      },
      {
        path: 'skills',
        name: 'Skills',
        component: Skills,
        meta: { title: 'Habilidades' }
      }
    ]
  },
  {
    path: '/',
    redirect: '/admin/dashboard'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  if (requiresAuth) {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        next();
      } else {
        next('/login');
      }
    });
  } else {
    next();
  }
});

export default router;
