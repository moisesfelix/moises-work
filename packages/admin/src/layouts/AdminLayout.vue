<template>
  <div class="admin-layout">
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#gradient)" />
            <path d="M16 8L8 24h16L16 8z" fill="white" />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                <stop offset="0%" stop-color="#667eea" />
                <stop offset="100%" stop-color="#764ba2" />
              </linearGradient>
            </defs>
          </svg>
          <h2 v-if="!sidebarCollapsed">Admin</h2>
        </div>
        <button class="collapse-btn" @click="toggleSidebar">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 5l-7 7 7 7V5z" v-if="!sidebarCollapsed" />
            <path d="M10 5l7 7-7 7V5z" v-else />
          </svg>
        </button>
      </div>
      
      <nav class="sidebar-nav">
        <router-link to="/admin/dashboard" exact-active-class="active" class="nav-item">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>
          <span v-if="!sidebarCollapsed">Dashboard</span>
        </router-link>
        
        <router-link to="/admin/projects" active-class="active" class="nav-item">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/>
          </svg>
          <span v-if="!sidebarCollapsed">Projetos</span>
        </router-link>
        
        <router-link to="/admin/articles" active-class="active" class="nav-item">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z"/>
            <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
          </svg>
          <span v-if="!sidebarCollapsed">Artigos</span>
        </router-link>
        
        <router-link to="/admin/tutorials" active-class="active" class="nav-item">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
          </svg>
          <span v-if="!sidebarCollapsed">Tutoriais</span>
        </router-link>
        
        <router-link to="/admin/experiences" active-class="active" class="nav-item">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"/>
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"/>
          </svg>
          <span v-if="!sidebarCollapsed">Experiências</span>
        </router-link>
        
        <router-link to="/admin/skills" active-class="active" class="nav-item">
          <svg class="nav-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"/>
          </svg>
          <span v-if="!sidebarCollapsed">Habilidades</span>
        </router-link>
      </nav>
      
      <div class="sidebar-footer">
        <div class="user-info" v-if="!sidebarCollapsed">
          <div class="user-avatar">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
              <path d="M16 14a6 6 0 100-12 6 6 0 000 12zM16 16c-6.627 0-12 3.373-12 7.5V28h24v-4.5c0-4.127-5.373-7.5-12-7.5z"/>
            </svg>
          </div>
          <div class="user-details">
            <p class="user-name">Admin</p>
            <p class="user-role">Administrator</p>
          </div>
        </div>
        <button class="logout-btn" @click="logout" :title="sidebarCollapsed ? 'Logout' : ''">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.414l-4.293 4.293a1 1 0 01-1.414 0L6 9.414l1.414-1.414L9 9.586 12.586 6 14 7.414z"/>
          </svg>
          <span v-if="!sidebarCollapsed">Sair</span>
        </button>
      </div>
    </aside>
    
    <main class="main-content">
      <header class="main-header">
        <div class="header-left">
          <h1>{{ pageTitle }}</h1>
          <p class="breadcrumb">{{ breadcrumb }}</p>
        </div>
        <div class="header-right">
          <div class="search-box">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
            </svg>
            <input type="text" placeholder="Buscar..." />
          </div>
          <button class="notification-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
            </svg>
            <span class="notification-badge">3</span>
          </button>
        </div>
      </header>
      
      <div class="content-wrapper">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getAuth, signOut } from 'firebase/auth';

const route = useRoute();
const router = useRouter();
const sidebarCollapsed = ref(false);

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    'Dashboard': 'Dashboard',
    'Projects': 'Gerenciar Projetos',
    'Articles': 'Gerenciar Artigos',
    'Tutorials': 'Gerenciar Tutoriais',
    'Experiences': 'Gerenciar Experiências',
    'Skills': 'Gerenciar Habilidades',
  };
  return titles[route.name as string] || 'Dashboard';
});

const breadcrumb = computed(() => {
  return `Admin / ${route.name}`;
});

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

const logout = async () => {
  const auth = getAuth();
  await signOut(auth);
  router.push('/login');
};
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  background: #f8fafc;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 260px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);
  position: relative;
  z-index: 100;
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo h2 {
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.collapse-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
  margin: 0.25rem 0.75rem;
  border-radius: 8px;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 0.875rem;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
}

.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  background: white;
  border-radius: 0 2px 2px 0;
}

.nav-icon {
  flex-shrink: 0;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.user-details {
  overflow: hidden;
}

.user-name {
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 6px;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-header {
  background: white;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-left h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.breadcrumb {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0.25rem 0 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: #94a3b8;
}

.search-box input {
  padding: 0.625rem 1rem 0.625rem 2.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  width: 240px;
  transition: all 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.notification-btn {
  position: relative;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  padding: 0.625rem;
  cursor: pointer;
  color: #475569;
  transition: all 0.2s;
}

.notification-btn:hover {
  background: #e2e8f0;
}

.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 0.625rem;
  font-weight: 700;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -260px;
    height: 100vh;
    z-index: 1000;
  }
  
  .sidebar.collapsed {
    left: 0;
  }
  
  .search-box {
    display: none;
  }
}

/* Scrollbar */
.sidebar-nav::-webkit-scrollbar,
.content-wrapper::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.content-wrapper::-webkit-scrollbar-track {
  background: #f8fafc;
}

.content-wrapper::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.content-wrapper::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
