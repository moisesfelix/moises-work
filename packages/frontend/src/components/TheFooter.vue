<template>
    <footer class="main-footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <div class="logo">Moisés<span>Felix</span></div>
                    <p>Desenvolvedor FullStack & Professor apaixonado por transformar ideias em soluções digitais.</p>
                </div>
                
                <div class="footer-links">
                    <h4>Links Rápidos</h4>
                    <ul>
                        <li><router-link to="/">Início</router-link></li>
                        <li><router-link to="/sobre">Sobre</router-link></li>
                        <li><router-link to="/portfolio">Portfólio</router-link></li>
                        <li><router-link to="/blog">Artigos</router-link></li>
                    </ul>
                </div>
                
                <div class="footer-newsletter">
                    <h4>Newsletter</h4>
                    <p>Receba as últimas novidades e artigos.</p>
                    <div class="newsletter-form">
                        <input type="email" v-model="newsletterEmail" placeholder="Seu melhor email" @keyup.enter="subscribeNewsletter">
                        <button class="btn" @click="subscribeNewsletter">
                            <span>Inscrever</span>
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
.main-footer {
    background-color: var(--dark-light);
    padding-top: 4rem;
    padding-bottom: 2rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-content {
    display: grid;
    gap: 2.5rem;
    margin-bottom: 3rem;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.logo {
    font-size: 1.8rem;
    font-weight: 700;
    color: white;
    margin-bottom: 1rem;
}

.logo span {
    color: var(--primary);
}

.footer-brand p {
    max-width: 40ch;
    color: var(--gray);
}

.footer-links h4,
.footer-newsletter h4 {
    font-size: 1.2rem;
    color: var(--light);
    margin-bottom: 1rem;
}

.footer-links ul {
    list-style: none;
}

.footer-links li {
    margin-bottom: 0.5rem;
}

.footer-links a {
    color: var(--gray);
    transition: var(--transition);
}

.footer-links a:hover {
    color: var(--primary);
    padding-left: 5px;
}

.newsletter-form {
    display: flex;
    gap: 0.5rem;
}

.newsletter-form input {
    width: 100%;
    padding: 0.75rem;
    border-radius: var(--radius);
    border: 1px solid var(--dark);
    background-color: var(--dark);
    color: var(--light);
    outline: none;
    transition: var(--transition);
}

.newsletter-form input:focus {
    border-color: var(--primary);
}

.newsletter-form .btn {
    padding: 0.75rem 1.2rem;
    flex-shrink: 0;
}

.copyright {
    text-align: center;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 2rem;
    color: var(--gray);
}
</style>