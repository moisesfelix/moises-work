<template>
  <Teleport to="body">
    <div v-if="show" class="cv-modal-overlay" @click.self="closeModal">
      <div class="cv-modal-content">
        <div class="cv-header">
          <h2>Currículo Profissional</h2>
          <button @click="closeModal" class="btn-close" aria-label="Fechar">&times;</button>
        </div>

        <div id="cv-content" class="cv-preview">
          <!-- HEADER DO CV -->
          <div class="cv-top">
            <div class="cv-avatar-wrapper" v-if="avatarBase64 || about?.image">
              <img :src="avatarBase64 || about.image" :alt="about.title || 'Avatar'" class="cv-avatar-img" />
            </div>
            <div class="cv-info">
              <h1 class="cv-name">{{ about?.title || 'Seu Nome' }}</h1>
              <p class="cv-role">{{ about?.subtitle || 'Desenvolvedor Full Stack' }}</p>
              <div class="cv-contacts" v-if="contact">
                <span v-if="contact.email" class="cv-contact">📧 {{ contact.email }}</span>
                <span v-if="contact.phone" class="cv-contact">📱 {{ contact.phone }}</span>
                <span v-if="contact.linkedin" class="cv-contact">🔗 {{ contact.linkedin }}</span>
                <span v-if="contact.github" class="cv-contact">🐙 {{ contact.github }}</span>
              </div>
            </div>
          </div>

          <!-- SOBRE MIM -->
          <section class="cv-section" v-if="about?.description">
            <h3 class="cv-section-title">Sobre Mim</h3>
            <p class="cv-text">{{ about.description }}</p>
          </section>

          <!-- HABILIDADES -->
          <section class="cv-section" v-if="skills && Object.keys(skills).length > 0">
            <h3 class="cv-section-title">Habilidades Técnicas</h3>
            <div class="cv-skills-grid">
              <div v-for="(tools, category) in skills" :key="category" class="cv-skill-category">
                <h4 class="cv-skill-title">{{ category }}</h4>
                <ul class="cv-skill-list">
                  <li v-for="tool in tools" :key="tool.name" class="cv-skill-item">
                    <span>{{ tool.name }}</span>
                    <span v-if="tool.percent" class="cv-skill-percent">{{ tool.percent }}%</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <!-- EXPERIÊNCIAS -->
          <section class="cv-section" v-if="experiences && experiences.length > 0">
            <h3 class="cv-section-title">Experiência Profissional</h3>
            <div v-for="exp in experiences" :key="exp.id" class="cv-experience">
              <div class="cv-exp-header">
                <h4 class="cv-exp-title">{{ exp.role }}</h4>
                <span class="cv-exp-meta">{{ exp.company }} | {{ exp.period }}</span>
              </div>
              <p class="cv-text">{{ exp.description }}</p>
            </div>
          </section>

          <!-- PROJETOS -->
          <section class="cv-section" v-if="projects && projects.length > 0">
            <h3 class="cv-section-title">Projetos Recentes</h3>
            <div v-for="project in projects.slice(0, 4)" :key="project.id" class="cv-project">
              <h4 class="cv-project-title">{{ project.title }}</h4>
              <p class="cv-text">{{ project.description }}</p>
              <p v-if="project.technologies && project.technologies.length > 0" class="cv-tech">
                <strong>Tecnologias:</strong> {{ project.technologies.join(', ') }}
              </p>
            </div>
          </section>
        </div>

        <div class="cv-footer">
          <button @click="generatePDF" class="cv-btn cv-btn-primary" :disabled="generating">
            <span v-if="!generating">📥 Baixar Currículo PDF</span>
            <span v-else>⏳ Gerando PDF...</span>
          </button>
          <button @click="closeModal" class="cv-btn cv-btn-secondary">Fechar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { usePortfoliosStore } from "@/stores/portfolios";

const props = defineProps<{ show: boolean }>();
const emit  = defineEmits<{ close: [] }>();

const portfoliosStore = usePortfoliosStore();
const about       = computed(() => portfoliosStore.about);
const skills      = computed(() => portfoliosStore.skills);
const projects    = computed(() => portfoliosStore.projects);
const experiences = computed(() => portfoliosStore.experiences);
const contact     = computed(() => portfoliosStore.contact);

const generating     = ref(false);
const avatarBase64   = ref<string>("");
const closeModal     = () => emit("close");

const convertImageToBase64 = async (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img       = new Image();
    img.crossOrigin = "anonymous";
    img.src         = url + (url.includes("?") ? "&" : "?") + Date.now();
    img.onload  = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width  = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("Canvas context error");
        ctx.drawImage(img, 0, 0);
        avatarBase64.value = canvas.toDataURL("image/jpeg", 0.98);
        resolve();
      } catch (e) { reject(e); }
    };
    img.onerror = () => reject();
  });
};

watch(() => props.show, async (val) => {
  if (val && about.value?.image && !avatarBase64.value) {
    try { await convertImageToBase64(about.value.image); } catch (_) {}
  }
  if (!val) avatarBase64.value = "";
}, { immediate: true });

const loadHtml2Pdf = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).html2pdf) { resolve((window as any).html2pdf); return; }
    const script    = document.createElement("script");
    script.src      = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
    script.onload   = () => resolve((window as any).html2pdf);
    script.onerror  = reject;
    document.head.appendChild(script);
  });
};

const generatePDF = async () => {
  generating.value = true;
  try {
    const element = document.getElementById("cv-content");
    if (!element) throw new Error("Elemento não encontrado");
    const html2pdf = await loadHtml2Pdf();
    await html2pdf().set({
      margin: [10, 10, 10, 10],
      filename: `curriculo-${(about.value?.title || "profissional").toLowerCase().replace(/\s+/g, "-")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff" },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait", compress: true },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    }).from(element).save();
  } catch (error) {
    alert("Erro ao gerar o PDF. Tente novamente.");
  } finally {
    generating.value = false;
  }
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.cv-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  backdrop-filter: blur(8px);
  padding: 1rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.cv-modal-content {
  background: #ffffff;
  width: 100%;
  max-width: 900px;
  max-height: 95vh;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(60px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.cv-header {
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.cv-header h2 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
}

.btn-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  font-size: 2.2rem;
  cursor: pointer;
  color: white;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  line-height: 1;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.cv-preview {
  padding: 2.5rem;
  overflow-y: auto;
  background: white;
  color: #1f2937;
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
  line-height: 1.7;
  flex: 1;
}

.cv-preview::-webkit-scrollbar {
  width: 10px;
}

.cv-preview::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.cv-preview::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

.cv-top {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 2.5rem;
  padding-bottom: 2rem;
  border-bottom: 3px solid #667eea;
  page-break-inside: avoid;
}

.cv-avatar-wrapper {
  flex-shrink: 0;
}

.cv-avatar-img {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #667eea;
  box-shadow: 0 6px 12px rgba(102, 126, 234, 0.3);
  display: block;
}

.cv-info {
  flex: 1;
  min-width: 0;
}

.cv-name {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  color: #111827;
  font-weight: 700;
  line-height: 1.2;
}

.cv-role {
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
  color: #667eea;
  font-weight: 600;
}

.cv-contacts {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.cv-contact {
  display: inline-flex;
  align-items: center;
  font-size: 0.9rem;
  color: #4b5563;
  white-space: nowrap;
}

.cv-section {
  margin-bottom: 2.5rem;
  page-break-inside: avoid;
}

.cv-section-title {
  margin: 0 0 1.3rem 0;
  padding-bottom: 0.7rem;
  border-bottom: 2px solid #e5e7eb;
  color: #111827;
  text-transform: uppercase;
  font-size: 1.25rem;
  letter-spacing: 1.5px;
  font-weight: 700;
  position: relative;
}

.cv-section-title::before {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 70px;
  height: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.cv-text {
  margin: 0.5rem 0;
  color: #374151;
  text-align: justify;
  font-size: 1rem;
  line-height: 1.8;
}

.cv-skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.cv-skill-category {
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  padding: 1.3rem;
  border-radius: 10px;
  border-left: 4px solid #667eea;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  page-break-inside: avoid;
}

.cv-skill-title {
  margin: 0 0 1rem 0;
  color: #111827;
  font-size: 1.1rem;
  font-weight: 600;
}

.cv-skill-list {
  list-style: none;
}

.cv-skill-item {
  margin-bottom: 0.6rem;
  font-size: 0.95rem;
  color: #4b5563;
  padding-left: 1.2rem;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cv-skill-item::before {
  content: '▸';
  position: absolute;
  left: 0;
  color: #667eea;
  font-weight: bold;
  font-size: 1.1rem;
}

.cv-skill-percent {
  color: #667eea;
  font-size: 0.85rem;
  font-weight: 700;
  background: rgba(102, 126, 234, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.cv-experience {
  margin-bottom: 2rem;
  padding-bottom: 1.8rem;
  border-bottom: 1px solid #e5e7eb;
  page-break-inside: avoid;
}

.cv-experience:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.cv-exp-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.8rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.cv-exp-title {
  margin: 0;
  font-weight: 700;
  color: #111827;
  font-size: 1.15rem;
}

.cv-exp-meta {
  color: #6b7280;
  font-style: italic;
  font-size: 0.95rem;
  font-weight: 500;
}

.cv-project {
  margin-bottom: 2rem;
  padding-bottom: 1.8rem;
  border-bottom: 1px solid #e5e7eb;
  page-break-inside: avoid;
}

.cv-project:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.cv-project-title {
  margin: 0 0 0.8rem 0;
  font-weight: 700;
  color: #111827;
  font-size: 1.15rem;
}

.cv-tech {
  font-size: 0.9rem;
  color: #4b5563;
  margin-top: 0.8rem;
  padding: 0.7rem;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 6px;
  border-left: 3px solid #667eea;
}

.cv-tech strong {
  color: #111827;
  font-weight: 600;
}

.cv-footer {
  padding: 1.5rem 2rem;
  border-top: 2px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  flex-shrink: 0;
}

.cv-btn {
  padding: 0.9rem 2rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  border: none;
  transition: all 0.3s ease;
  font-size: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.cv-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.cv-btn:active {
  transform: translateY(0);
}

.cv-btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.cv-btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #5568d3 0%, #653a8a 100%);
}

.cv-btn-primary:disabled {
  background: linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%);
  cursor: not-allowed;
  opacity: 0.6;
}

.cv-btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.cv-btn-secondary:hover {
  background: #d1d5db;
}

/* Responsividade */
@media (max-width: 768px) {
  .cv-modal-overlay {
    padding: 0.5rem;
  }

  .cv-modal-content {
    max-height: 98vh;
    border-radius: 12px;
  }

  .cv-header {
    padding: 1rem 1.5rem;
  }

  .cv-header h2 {
    font-size: 1.3rem;
  }

  .cv-preview {
    padding: 1.5rem;
  }

  .cv-top {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .cv-avatar-img {
    width: 120px;
    height: 120px;
  }

  .cv-name {
    font-size: 2rem;
  }

  .cv-role {
    font-size: 1.2rem;
  }

  .cv-contacts {
    flex-direction: column;
    gap: 0.5rem;
    text-align: left;
  }

  .cv-skills-grid {
    grid-template-columns: 1fr;
  }

  .cv-exp-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .cv-footer {
    flex-direction: column;
    padding: 1rem 1.5rem;
  }

  .cv-btn {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .cv-header h2 {
    font-size: 1.1rem;
  }

  .btn-close {
    width: 36px;
    height: 36px;
    font-size: 1.8rem;
  }

  .cv-name {
    font-size: 1.6rem;
  }

  .cv-role {
    font-size: 1rem;
  }

  .cv-section-title {
    font-size: 1.1rem;
  }
}

/* Print / PDF */
@media print {
  .cv-modal-overlay {
    background: white;
    position: static;
  }

  .cv-modal-content {
    box-shadow: none;
    max-height: none;
  }

  .cv-header,
  .cv-footer {
    display: none !important;
  }

  .cv-preview {
    padding: 0;
    overflow: visible;
  }

  .cv-section,
  .cv-top,
  .cv-experience,
  .cv-project,
  .cv-skill-category {
    page-break-inside: avoid;
  }
}
</style>