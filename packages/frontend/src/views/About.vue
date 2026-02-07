<template>
  <section class="about" id="about">
    <div class="container">
      <h2>Sobre Mim</h2>
      <div class="about-content">
        <div class="about-image">
          <img src="https://media.licdn.com/dms/image/v2/D4D03AQFq7OqKaCPTkQ/profile-displayphoto-scale_400_400/B4DZwbgAV5J0Ag-/0/1769987904145?e=1772064000&v=beta&t=J-IL4IkEeiYzI7qeo6buqKaj0sM-k1kB0AVlpFo26zY" alt="Moisés Felix">
        </div>
        <div class="about-text">
          <h3>Desenvolvedor FullStack & Professor</h3>
          <p>Com mais de 5 anos de experiência em desenvolvimento web e mobile, atuei em projetos desafiadores que vão desde e-commerces até sistemas complexos com integração de IA e machine learning.</p>
          <p>Minha paixão por tecnologia vai além do código - adoro compartilhar conhecimento através do ensino de programação e pensamento computacional para jovens e adultos, capacitando a próxima geração de inovadores.</p>
          <div class="about-buttons">
             <a href="#contact" class="btn">Vamos Conversar</a>
             <a href="/path-to-your-cv.pdf" class="btn btn-secondary" target="_blank">Download CV</a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.about {
  padding-top: 10rem;
}

.about-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  margin-top: 4rem;
}

.about-image {
  width: 250px;
  height: 250px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid var(--primary);
  box-shadow: 0 0 40px rgba(59, 130, 246, 0.3);
  flex-shrink: 0;
}

.about-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.about-text {
  text-align: center;
}

.about-text h3 {
  font-size: 1.8rem;
  color: var(--light);
  margin-bottom: 1rem;
}

.about-text p {
  max-width: 60ch;
  margin-left: auto;
  margin-right: auto;
}

.about-buttons {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

/* Layout para telas maiores */
@media (min-width: 768px) {
  .about-content {
    flex-direction: row;
    align-items: flex-start;
  }
  
  .about-text {
    text-align: left;
  }

  .about-text p {
    margin-left: 0;
    margin-right: 0;
  }

  .about-buttons {
    justify-content: flex-start;
  }
}
</style>
