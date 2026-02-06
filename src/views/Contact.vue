<template>
  <section class="contact" style="padding-top: 180px;">
      <div class="container">
          <h2>Entre em Contato</h2>
          
          <div class="contact-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 40px;">
              <div class="contact-info">
                  <h3>Vamos Conversar!</h3>
                  <p>Estou sempre aberto a discutir novas oportunidades, projetos desafiadores ou colaborações.</p>
                  
                  <div class="contact-info-item" style="display: flex; align-items: center; gap: 20px; margin-bottom: 30px;">
                      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                          <i class="fas fa-map-marker-alt" style="color: white; font-size: 1.5rem;"></i>
                      </div>
                      <div>
                          <h4>Localização</h4>
                          <p>Olaria, Rio de Janeiro, RJ</p>
                      </div>
                  </div>
                  
                  <div class="contact-info-item" style="display: flex; align-items: center; gap: 20px; margin-bottom: 30px;">
                      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                          <i class="fas fa-phone-alt" style="color: white; font-size: 1.5rem;"></i>
                      </div>
                      <div>
                          <h4>Telefone</h4>
                          <p>+55 (21) 98189-1199</p>
                      </div>
                  </div>
                  
                  <div class="contact-info-item" style="display: flex; align-items: center; gap: 20px; margin-bottom: 30px;">
                      <div style="width: 60px; height: 60px; background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                          <i class="fas fa-envelope" style="color: white; font-size: 1.5rem;"></i>
                      </div>
                      <div>
                          <h4>Email</h4>
                          <p>contato@moisesfelix.com</p>
                      </div>
                  </div>
              </div>
              
              <div class="contact-form">
                  <form @submit.prevent="submitForm">
                      <div class="form-group">
                          <input type="text" class="form-control" v-model="form.name" placeholder="Seu Nome" required style="width: 100%; padding: 15px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius); color: white; margin-bottom: 25px;">
                      </div>
                      
                      <div class="form-group">
                          <input type="email" class="form-control" v-model="form.email" placeholder="Seu Email" required style="width: 100%; padding: 15px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius); color: white; margin-bottom: 25px;">
                      </div>
                      
                      <div class="form-group">
                          <input type="text" class="form-control" v-model="form.subject" placeholder="Assunto" required style="width: 100%; padding: 15px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius); color: white; margin-bottom: 25px;">
                      </div>
                      
                      <div class="form-group">
                          <textarea class="form-control" rows="6" v-model="form.message" placeholder="Sua Mensagem" required style="width: 100%; padding: 15px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: var(--radius); color: white; margin-bottom: 25px;"></textarea>
                      </div>
                      
                      <button type="submit" class="btn" style="width: 100%;">
                          <i class="fas fa-paper-plane"></i> Enviar Mensagem
                      </button>
                  </form>
              </div>
          </div>
      </div>
  </section>
</template>

<script setup>
import { ref, inject } from 'vue';

const showToast = inject('showToast');

const form = ref({
    name: '',
    email: '',
    subject: '',
    message: ''
});

const submitForm = () => {
    showToast({
        type: 'success',
        title: 'Sucesso!',
        message: 'Mensagem enviada com sucesso! Entrarei em contato em breve.'
    });
    form.value = {
        name: '',
        email: '',
        subject: '',
        message: ''
    };
};
</script>