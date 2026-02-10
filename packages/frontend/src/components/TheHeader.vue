<template>
    <header>
        <div class="container header-container">
            <router-link to="/" class="logo">
                <i class="fas fa-code"></i>
                moises.work
            </router-link>
            
            <div class="nav-wrapper">
                <nav :class="{ active: mobileMenuActive }">
                    <ul>
                        <li><router-link to="/" @click="closeMobileMenu"><i class="fas fa-home"></i> Início</router-link></li>
                        <li><router-link to="/sobre" @click="closeMobileMenu"><i class="fas fa-user"></i> Sobre</router-link></li>
                        <li><router-link to="/experiencia" @click="closeMobileMenu"><i class="fas fa-briefcase"></i> Experiência</router-link></li>
                        <li><router-link to="/habilidades" @click="closeMobileMenu"><i class="fas fa-cogs"></i> Habilidades</router-link></li>
                        <li><router-link to="/portfolio" @click="closeMobileMenu"><i class="fas fa-folder-open"></i> Portfólio</router-link></li>
                        <li><router-link to="/blog" @click="closeMobileMenu"><i class="fas fa-newspaper"></i> Blog</router-link></li>
                        <li><router-link to="/tutoriais" @click="closeMobileMenu"><i class="fas fa-book-open"></i> Tutoriais</router-link></li>
                        <li><router-link to="/contato" @click="closeMobileMenu"><i class="fas fa-envelope"></i> Contato</router-link></li>
                    </ul>
                </nav>
                <ThemeSwitcher />
                <div v-if="isLoggedIn" class="admin-menu">
                    <button @click="toggleAdminDropdown" class="avatar-btn">
                        <img :src="user?.photoURL || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp'" alt="User Avatar" class="avatar">
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
                        <li><a @click="logout"><i class="fas fa-sign-out-alt"></i> Sair</a></li>
                    </ul>
                </div>
                <button class="mobile-menu-btn" @click="toggleMobileMenu" aria-label="Menu">
                    <i :class="mobileMenuIcon"></i>
                </button>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import ThemeSwitcher from './ThemeSwitcher.vue';
import { useRouter } from 'vue-router';

const mobileMenuActive = ref(false);
const adminDropdownActive = ref(false);
const isLoggedIn = ref(false);
const user = ref<User | null>(null);
const mobileMenuIcon = computed(() => mobileMenuActive.value ? 'fas fa-times' : 'fas fa-bars');
const auth = getAuth();
const router = useRouter();

onMounted(() => {
    onAuthStateChanged(auth, (currentUser) => {
        isLoggedIn.value = !!currentUser;
        user.value = currentUser;
    });
});

const toggleMobileMenu = () => {
    mobileMenuActive.value = !mobileMenuActive.value;
    document.body.style.overflow = mobileMenuActive.value ? 'hidden' : 'auto';
};

const closeMobileMenu = () => {
    mobileMenuActive.value = false;
    document.body.style.overflow = 'auto';
};

const toggleAdminDropdown = () => {
    adminDropdownActive.value = !adminDropdownActive.value;
};

const closeAdminDropdown = () => {
    adminDropdownActive.value = false;
};

const logout = async () => {
  await signOut(auth);
  closeAdminDropdown();
  router.push('/');
};
</script>


<style scoped>
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

nav ul {
    display: flex;
    list-style: none;
    gap: 1.5rem;
}

nav ul li a {
    font-weight: 500;
    position: relative;
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--text-color-body);
    text-decoration: none;
    transition: color 0.2s;
}

nav ul li a:hover,
nav ul li a.router-link-active {
    color: var(--primary);
}


@media (max-width: 992px) {
    .mobile-menu-btn {
        display: block;
    }
    
    nav {
        position: fixed;
        top: 0;
        right: -100%;
        width: 80%;
        max-width: 300px;
        height: 100vh;
        background: var(--background-body);
        padding: 6rem 2rem 2rem;
        transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: -5px 0 20px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    nav.active {
        right: 0;
    }
    
    nav ul {
        flex-direction: column;
        gap: 1.5rem;
        text-align: center;
    }

    nav ul li a {
        font-size: 1.2rem;
    }
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