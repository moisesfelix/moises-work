<template>
    <header>
        <div class="container header-container">
            <router-link :to="slug ? `/${slug}` : '/'" class="logo">
                <i class="fas fa-code"></i>
                <span v-if="slug && portfolioTitle">{{ portfolioTitle }}</span>
                <span v-else>moises.work</span>
            </router-link>
            
            <div class="nav-wrapper">
                <nav :class="{ active: mobileMenuActive }">
                    <ul v-if="slug">
                        <li><router-link :to="`/${slug}`" @click="closeMobileMenu"><i class="fas fa-home"></i> Início</router-link></li>
                        <li><router-link :to="`/${slug}/sobre`" @click="closeMobileMenu"><i class="fas fa-user"></i> Sobre</router-link></li>
                        <li><router-link :to="`/${slug}/experiencia`" @click="closeMobileMenu"><i class="fas fa-briefcase"></i> Experiência</router-link></li>
                        <li><router-link :to="`/${slug}/habilidades`" @click="closeMobileMenu"><i class="fas fa-cogs"></i> Habilidades</router-link></li>
                        <li><router-link :to="`/${slug}/projetos`" @click="closeMobileMenu"><i class="fas fa-folder-open"></i> Projetos</router-link></li>
                        <li><router-link :to="`/${slug}/blog`" @click="closeMobileMenu"><i class="fas fa-newspaper"></i> Blog</router-link></li>
                        <li><router-link :to="`/${slug}/tutoriais`" @click="closeMobileMenu"><i class="fas fa-book-open"></i> Tutoriais</router-link></li>
                        <li><router-link :to="`/${slug}/contato`" @click="closeMobileMenu"><i class="fas fa-envelope"></i> Contato</router-link></li>
                        <li v-if="!isLoggedIn"><router-link to="/login" @click="closeMobileMenu"><i class="fab fa-google"></i> Login</router-link></li>
                    </ul>
                     <ul v-else>
                         <li><router-link to="/" @click="closeMobileMenu"><i class="fas fa-home"></i> Início</router-link></li>
                        <li v-if="!isLoggedIn"><router-link to="/login" @click="closeMobileMenu"><i class="fab fa-google"></i> Login</router-link></li>
                    </ul>
                </nav>
                <ThemeSwitcher />
                
                <div v-if="isLoggedIn" class="user-actions">
                    <router-link to="/admin/credits" class="credits-badge" title="Meus Créditos">
                        <span class="credits-icon">💎</span>
                        <span class="credits-value">{{ userStore.credits }}</span>
                    </router-link>

                    <div class="admin-menu">
                        <button @click="toggleAdminDropdown" class="avatar-btn">
                            <img v-if="user?.photoURL" :src="user.photoURL" alt="User Avatar" class="avatar">
                            <i v-else class="fas fa-user-circle avatar-placeholder"></i>
                        </button>
                    <ul v-if="adminDropdownActive" class="admin-dropdown">
                        <li><router-link to="/admin/dashboard" @click="closeAdminDropdown"><i class="fas fa-tachometer-alt"></i> Dashboard</router-link></li>
                        <li><router-link to="/admin/about" @click="closeAdminDropdown"><i class="fas fa-user"></i> Sobre</router-link></li>
                        <li><router-link to="/admin/projects" @click="closeAdminDropdown"><i class="fas fa-project-diagram"></i> Projetos</router-link></li>
                        <li><router-link to="/admin/articles" @click="closeAdminDropdown"><i class="fas fa-newspaper"></i> Artigos</router-link></li>
                        <li><router-link to="/admin/tutorials" @click="closeAdminDropdown"><i class="fas fa-book-open"></i> Tutoriais</router-link></li>
                        <li><router-link to="/admin/experiences" @click="closeAdminDropdown"><i class="fas fa-briefcase"></i> Experiências</router-link></li>
                        <li><router-link to="/admin/skills" @click="closeAdminDropdown"><i class="fas fa-cogs"></i> Habilidades</router-link></li>
                        <li><router-link to="/admin/contact" @click="closeAdminDropdown"><i class="fas fa-envelope"></i> Contato</router-link></li>
                        <li><router-link to="/admin/roadmap" @click="closeAdminDropdown"><i class="fas fa-rocket"></i> Trajetória</router-link></li> <!-- NOVO -->
                        <li><router-link to="/admin/credits" @click="closeAdminDropdown"><i class="fas fa-coins"></i> Créditos</router-link></li>
                        <li><a @click="logout"><i class="fas fa-sign-out-alt"></i> Sair</a></li>
                    </ul>
                </div>
                </div>
                <div v-else class="login-menu">
                    <router-link to="/login" class="btn btn-outline"><i class="fab fa-google"></i> Entrar</router-link>
                </div>
                <button class="mobile-menu-btn" @click="toggleMobileMenu" aria-label="Menu" v-if="slug">
                    <i :class="mobileMenuIcon"></i>
                </button>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import ThemeSwitcher from "./ThemeSwitcher.vue";
import { useRouter, useRoute } from "vue-router";
import { usePortfoliosStore } from "@/stores/portfolios";
import { useUserStore } from "@/stores/user";

const mobileMenuActive    = ref(false);
const adminDropdownActive = ref(false);
const isLoggedIn          = ref(false);
const user                = ref<User | null>(null);
const auth                = getAuth();
const router              = useRouter();
const route               = useRoute();
const portfoliosStore     = usePortfoliosStore();
const userStore           = useUserStore();

const slug           = computed(() => route.params.slug as string);
const portfolioTitle = computed(() => portfoliosStore.about?.title || "Meu Portfólio");
const mobileMenuIcon = computed(() => (mobileMenuActive.value ? "fas fa-times" : "fas fa-bars"));

onMounted(() => {
  onAuthStateChanged(auth, (u) => {
    isLoggedIn.value = !!u;
    user.value       = u;
  });
});

const toggleMobileMenu = () => {
  mobileMenuActive.value        = !mobileMenuActive.value;
  document.body.style.overflow  = mobileMenuActive.value ? "hidden" : "auto";
};
const closeMobileMenu  = () => { mobileMenuActive.value = false; document.body.style.overflow = "auto"; };
const toggleAdminDropdown = () => { adminDropdownActive.value = !adminDropdownActive.value; };
const closeAdminDropdown  = () => { adminDropdownActive.value = false; };
const logout = async () => { await signOut(auth); closeAdminDropdown(); router.push("/"); };
</script>

<style scoped>
/* Estilos mantidos iguais aos originais */
header {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    background-color: var(--background-header);
    backdrop-filter: blur(10px);
    padding: 1rem 0;
    border-bottom: var(--border-header);
    transition: background-color 0.3s ease, border-bottom 0.3s ease;
    min-height: var(--header-height);
    display: flex;
    align-items: center;
}

.header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-color-heading);
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 1001;
}

.logo span {
    color: var(--primary);
}

.nav-wrapper {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.mobile-menu-btn {
    display: none;
    background: none;
    border: none;
    color: var(--text-color-heading);
    font-size: 1.5rem;
    cursor: pointer;
    z-index: 1001;
}

.nav-wrapper:has(nav) .mobile-menu-btn {
    display: block;
}

.btn-outline {
    padding: 0.5rem 1rem;
    border: 1px solid var(--primary);
    color: var(--primary);
    border-radius: 4px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
}
.btn-outline:hover {
    background-color: var(--primary);
    color: white;
}

.admin-dropdown li a {
    display: flex;
}

nav {
    position: fixed;
    top: 0;
    right: -100%;
    width: 280px;
    height: 100vh;
    background: var(--background-body);
    padding: 6rem 2rem 2rem;
    transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: -5px 0 20px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: auto;
    z-index: 999;
}

nav.active {
    right: 0;
}

nav ul {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
    width: 100%;
}

nav ul li a {
    font-size: 1.2rem;
    display: block;
    padding: 10px;
}

@media (max-width: 992px) {
    /* Styles are now unified for all sizes as per request */
}
.user-actions {
    display: flex;
    align-items: center;
    gap: 15px;
}

.credits-badge {
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba(91, 95, 171, 0.1);
    color: #5b5fab;
    padding: 5px 12px;
    border-radius: 20px;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.9rem;
    transition: 0.2s;
    border: 1px solid rgba(91, 95, 171, 0.2);
}

.credits-badge:hover {
    background: rgba(91, 95, 171, 0.2);
    transform: translateY(-1px);
}

.admin-menu {
    position: relative;
}

.avatar-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    border-radius: 50%;
}

.avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
}

.avatar-placeholder {
    font-size: 40px;
    color: var(--text-color-body);
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: var(--background-secondary);
}

.admin-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background: var(--background-body);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    list-style: none;
    padding: 0.5rem;
    margin-top: 0.5rem;
    min-width: 200px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.admin-dropdown li a {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0.5rem 1rem;
    color: var(--text-color-body);
    text-decoration: none;
    transition: background-color 0.2s;
}

.admin-dropdown li a:hover {
    background-color: var(--background-secondary);
}
</style>
