import { createRouter, createWebHistory } from 'vue-router';

// Import your components here
import Dashboard from '../components/Dashboard.vue';
import Projects from '../components/Projects.vue';
import Articles from '../components/Articles.vue';
import Tutorials from '../components/Tutorials.vue';
import Skills from '../components/Skills.vue';
import Experiences from '../components/Experiences.vue';

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/projects', name: 'Projects', component: Projects },
  { path: '/articles', name: 'Articles', component: Articles },
  { path: '/tutorials', name: 'Tutorials', component: Tutorials },
  { path: '/skills', name: 'Skills', component: Skills },
  { path: '/experiences', name: 'Experiences', component: Experiences },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;
