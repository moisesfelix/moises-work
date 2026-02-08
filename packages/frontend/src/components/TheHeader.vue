<template>
    <header>
        <div class="container header-container">
            <router-link to="/" class="logo">
                <i class="fas fa-code"></i>
                Moisés<span>Felix</span>
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
                <button class="mobile-menu-btn" @click="toggleMobileMenu" aria-label="Menu">
                    <i :class="mobileMenuIcon"></i>
                </button>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ThemeSwitcher from './ThemeSwitcher.vue';

const mobileMenuActive = ref(false);
const mobileMenuIcon = computed(() => mobileMenuActive.value ? 'fas fa-times' : 'fas fa-bars');

const toggleMobileMenu = () => {
    mobileMenuActive.value = !mobileMenuActive.value;
    document.body.style.overflow = mobileMenuActive.value ? 'hidden' : 'auto';
};

const closeMobileMenu = () => {
    mobileMenuActive.value = false;
    document.body.style.overflow = 'auto';
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
</style>