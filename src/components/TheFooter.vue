<template>
    <footer>
        <div class="container">
            <div class="footer-content">
                <div>
                    <div class="logo" style="margin-bottom: 20px;">Moisés<span>Felix</span></div>
                    <p>Desenvolvedor FullStack & Professor apaixonado por transformar ideias em soluções digitais.</p>
                </div>
                
                <div class="footer-links">
                    <div>
                        <h4>Links Rápidos</h4>
                        <ul>
                            <li><router-link to="/">Início</router-link></li>
                            <li><router-link to="/sobre">Sobre</router-link></li>
                            <li><router-link to="/portfolio">Portfólio</router-link></li>
                            <li><router-link to="/blog">Artigos</router-link></li>
                        </ul>
                    </div>
                </div>
                
                <div>
                    <h4>Newsletter</h4>
                    <div class="newsletter-form">
                        <input type="email" v-model="newsletterEmail" placeholder="Seu email" @keyup.enter="subscribeNewsletter">
                        <button class="btn" @click="subscribeNewsletter" style="padding: 12px 20px;">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="copyright">
                <p>&copy; 2024 Moisés Felix. Todos os direitos reservados.</p>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue';

const newsletterEmail = ref('');
const showToast = inject('showToast') as (message: string) => void;

const subscribeNewsletter = () => {
    if (newsletterEmail.value) {
        showToast('Obrigado por se inscrever na newsletter!');
        newsletterEmail.value = '';
    }
};
</script>

<style scoped>
.logo {
    font-size: 1.8rem;
    font-weight: 700;
    color: white;
}
.logo span {
    color: var(--primary);
}
</style>