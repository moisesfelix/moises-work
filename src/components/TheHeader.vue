<template>
    <header>
        <div class="container header-container">
            <router-link to="/" class="logo">
                <i class="fas fa-code"></i>
                Moisés<span>Felix</span>
            </router-link>
            
            <button class="mobile-menu-btn" @click="toggleMobileMenu" aria-label="Menu">
                <i :class="mobileMenuIcon"></i>
            </button>
            
            <nav :class="{ active: mobileMenuActive }">
                <ul>
                    <li><router-link to="/" @click="closeMobileMenu"><i class="fas fa-home"></i> Início</router-link></li>
                    <li><router-link to="/sobre" @click="closeMobileMenu"><i class="fas fa-user"></i> Sobre</router-link></li>
                    <li><router-link to="/experiencia" @click="closeMobileMenu"><i class="fas fa-briefcase"></i> Experiência</router-link></li>
                    <li><router-link to="/habilidades" @click="closeMobileMenu"><i class="fas fa-code"></i> Habilidades</router-link></li>
                    <li><router-link to="/portfolio" @click="closeMobileMenu"><i class="fas fa-folder"></i> Portfólio</router-link></li>
                    <li><router-link to="/blog" @click="closeMobileMenu"><i class="fas fa-newspaper"></i> Blog</router-link></li>
                    <li><router-link to="/tutoriais" @click="closeMobileMenu"><i class="fas fa-graduation-cap"></i> Tutoriais</router-link></li>
                    <li><router-link to="/contato" @click="closeMobileMenu"><i class="fas fa-envelope"></i> Contato</router-link></li>
                </ul>
            </nav>
        </div>
    </header>
</template>

<script setup>
import { ref, computed } from 'vue';

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
    background-color: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(10px);
    padding: 20px 0;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.logo {
    font-size: 1.8rem;
    font-weight: 700;
    color: white;
    display: flex;
    align-items: center;
    gap: 10px;
}

.logo span {
    color: var(--primary);
}

.mobile-menu-btn {
    display: none;
    background: none;
    border: none;
    color: white;
    font-size: 1.5rem;
    cursor: pointer;
}

@media (max-width: 768px) {
    .mobile-menu-btn {
        display: block;
    }
    
    nav {
        position: fixed;
        top: 0;
        right: -100%;
        width: 80%;
        height: 100vh;
        background: rgba(15, 23, 42, 0.98);
        padding: 100px 30px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: -5px 0 20px rgba(0,0,0,0.5);
    }
    
    nav.active {
        right: 0;
    }
    
    nav ul {
        flex-direction: column;
        gap: 30px;
    }
}

nav ul {
    display: flex;
    list-style: none;
    gap: 2rem;
}

nav ul li a {
    font-weight: 500;
    position: relative;
    display: flex;
    align-items: center;
    gap: 5px;
    color: inherit;
    text-decoration: none;
}

nav ul li a.router-link-active {
    color: var(--primary);
}
</style>