<template>
  <Teleport to="body">
    <div v-if="show" class="cv-modal-overlay" @click.self="closeModal">
      <div class="cv-modal-content">
        <div class="cv-header">
          <h2>Currículo Profissional</h2>
          <button @click="closeModal" class="btn-close" aria-label="Fechar">&times;</button>
        </div>

        <div id="cv-content" class="cv-preview">

          <!-- CABEÇALHO: nome + cargo + contatos (texto puro, ATS-friendly) -->
          <div class="cv-top">
            <h1 class="cv-name">{{ about?.title || 'Seu Nome' }}</h1>
            <p class="cv-role">{{ about?.subtitle || 'Desenvolvedor Full Stack' }}</p>
            <div class="cv-contacts" v-if="contact">
              <span v-if="contact.email">{{ contact.email }}</span>
              <span v-if="contact.phone">{{ contact.phone }}</span>
              <span v-if="contact.linkedin">{{ contact.linkedin }}</span>
              <span v-if="contact.github">{{ contact.github }}</span>
            </div>
          </div>

          <!-- SOBRE MIM -->
          <section class="cv-section" v-if="about?.description">
            <h2 class="cv-section-title">RESUMO PROFISSIONAL</h2>
            <p class="cv-text">{{ about.description }}</p>
          </section>

          <!-- HABILIDADES (lista de texto simples, sem barras/gráficos) -->
          <section class="cv-section" v-if="skills && Object.keys(skills).length > 0">
            <h2 class="cv-section-title">HABILIDADES TÉCNICAS</h2>
            <div v-for="(tools, category) in skills" :key="category" class="cv-skill-block">
              <strong class="cv-skill-category-name">{{ category }}:</strong>
              <span class="cv-skill-inline">{{ tools.map((t: any) => t.name).join(' · ') }}</span>
            </div>
          </section>

          <!-- EXPERIÊNCIA PROFISSIONAL -->
          <section class="cv-section" v-if="experiences && experiences.length > 0">
            <h2 class="cv-section-title">EXPERIÊNCIA PROFISSIONAL</h2>
            <div v-for="exp in experiences" :key="exp.id" class="cv-experience">
              <div class="cv-exp-header">
                <strong class="cv-exp-title">{{ exp.role }}</strong>
                <span class="cv-exp-meta"> — {{ exp.company }} | {{ exp.period }}</span>
              </div>
              <p class="cv-text">{{ exp.description }}</p>
            </div>
          </section>

          <!-- PROJETOS RECENTES -->
          <section class="cv-section" v-if="projects && projects.length > 0">
            <h2 class="cv-section-title">PROJETOS RECENTES</h2>
            <div v-for="project in projects.slice(0, 4)" :key="project.id" class="cv-project">
              <strong class="cv-project-title">{{ project.title }}</strong>
              <p class="cv-text">{{ project.description }}</p>
              <p v-if="project.technologies && project.technologies.length > 0" class="cv-tech">
                Tecnologias: {{ project.technologies.join(', ') }}
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
import { ref, computed } from "vue";
import { usePortfoliosStore } from "@/stores/portfolios";

const props = defineProps<{ show: boolean }>();
const emit  = defineEmits<{ close: [] }>();

const portfoliosStore = usePortfoliosStore();
const about       = computed(() => portfoliosStore.about);
const skills      = computed(() => portfoliosStore.skills);
const projects    = computed(() => portfoliosStore.projects);
const experiences = computed(() => portfoliosStore.experiences);
const contact     = computed(() => portfoliosStore.contact);

const generating  = ref(false);
const closeModal  = () => emit("close");

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
      margin: [15, 20, 15, 20],
      filename: `curriculo-${(about.value?.title || "profissional").toLowerCase().replace(/\s+/g, "-")}.pdf`,
      image: { type: "jpeg", quality: 1.0 },
      html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff" },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait", compress: true },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    }).from(element).save();
  } catch {
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

/* ── OVERLAY ─────────────────────────────────────── */
.cv-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.82);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99999;
  backdrop-filter: blur(6px);
  padding: 1rem;
  animation: fadeIn 0.25s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ── MODAL ───────────────────────────────────────── */
.cv-modal-content {
  background: #fff;
  width: 100%;
  max-width: 860px;
  max-height: 95vh;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.45);
  animation: slideUp 0.25s ease;
}

@keyframes slideUp {
  from { transform: translateY(48px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

/* ── MODAL HEADER ────────────────────────────────── */
.cv-header {
  padding: 1.2rem 2rem;
  background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%);
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.cv-header h2 {
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.btn-close {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #fff;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, transform 0.2s;
  line-height: 1;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.28);
  transform: rotate(90deg);
}

/* ── CV PREVIEW (ATS body) ───────────────────────── */
.cv-preview {
  padding: 2.5rem 3rem;
  overflow-y: auto;
  background: #fff;
  color: #1a1a1a;
  /*
    ATS-safe font stack: Calibri-first, then Arial, then generic sans-serif.
    No icons, no images, no decorative fonts.
  */
  font-family: 'Calibri', 'Arial', 'Helvetica Neue', sans-serif;
  font-size: 11pt;
  line-height: 1.65;
  flex: 1;
}

.cv-preview::-webkit-scrollbar { width: 8px; }
.cv-preview::-webkit-scrollbar-track { background: #f3f4f6; }
.cv-preview::-webkit-scrollbar-thumb { background: #2c5282; border-radius: 8px; }

/* ── CV TOP HEADER ───────────────────────────────── */
.cv-top {
  text-align: center;
  margin-bottom: 1.8rem;
  padding-bottom: 1.2rem;
  border-bottom: 2px solid #1a1a1a;
  page-break-inside: avoid;
}

.cv-name {
  font-size: 22pt;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: 0.5px;
  margin-bottom: 0.3rem;
  text-transform: uppercase;
}

.cv-role {
  font-size: 12pt;
  color: #444;
  font-weight: 600;
  margin-bottom: 0.7rem;
}

.cv-contacts {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.3rem 1.4rem;
  font-size: 9.5pt;
  color: #333;
}

.cv-contacts span {
  white-space: nowrap;
}

/* separator between contact items */
.cv-contacts span + span::before {
  content: '|';
  margin-right: 1.4rem;
  color: #999;
}

/* ── SECTION ─────────────────────────────────────── */
.cv-section {
  margin-bottom: 1.6rem;
  page-break-inside: avoid;
}

/*
  ATS tip: Use ALL CAPS plain text headings, no fancy borders beyond a simple line.
  A solid bottom border is safe; gradient or CSS-generated content is not ATS-readable.
*/
.cv-section-title {
  font-size: 10.5pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.8px;
  color: #1a1a1a;
  border-bottom: 1.5px solid #1a1a1a;
  padding-bottom: 4px;
  margin-bottom: 1rem;
}

/* ── BODY TEXT ───────────────────────────────────── */
.cv-text {
  font-size: 10.5pt;
  color: #222;
  text-align: justify;
  line-height: 1.7;
  margin-top: 0.3rem;
}

/* ── SKILLS (inline text list, ATS-safe) ─────────── */
.cv-skill-block {
  margin-bottom: 0.5rem;
  font-size: 10.5pt;
  color: #222;
  line-height: 1.6;
}

.cv-skill-category-name {
  color: #1a1a1a;
  font-weight: 700;
}

.cv-skill-inline {
  margin-left: 0.4rem;
  color: #333;
}

/* ── EXPERIENCE ──────────────────────────────────── */
.cv-experience {
  margin-bottom: 1.4rem;
  page-break-inside: avoid;
}

.cv-experience:not(:last-child) {
  padding-bottom: 1.2rem;
  border-bottom: 1px dashed #d1d5db;
}

.cv-exp-header {
  margin-bottom: 0.4rem;
  font-size: 10.5pt;
  line-height: 1.5;
}

.cv-exp-title {
  font-weight: 700;
  color: #1a1a1a;
  font-size: 11pt;
}

.cv-exp-meta {
  color: #555;
  font-style: italic;
}

/* ── PROJECTS ────────────────────────────────────── */
.cv-project {
  margin-bottom: 1.4rem;
  page-break-inside: avoid;
}

.cv-project:not(:last-child) {
  padding-bottom: 1.2rem;
  border-bottom: 1px dashed #d1d5db;
}

.cv-project-title {
  font-size: 11pt;
  font-weight: 700;
  color: #1a1a1a;
  display: block;
  margin-bottom: 0.3rem;
}

.cv-tech {
  font-size: 9.5pt;
  color: #444;
  margin-top: 0.5rem;
  font-style: italic;
}

/* ── FOOTER ──────────────────────────────────────── */
.cv-footer {
  padding: 1.2rem 2rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  background: #f9fafb;
  flex-shrink: 0;
}

.cv-btn {
  padding: 0.75rem 1.8rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  border: none;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.cv-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,.12); }
.cv-btn:active { transform: translateY(0); }

.cv-btn-primary {
  background: linear-gradient(135deg, #1e3a5f, #2c5282);
  color: #fff;
}

.cv-btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  opacity: 0.65;
}

.cv-btn-secondary {
  background: #e5e7eb;
  color: #374151;
}

.cv-btn-secondary:hover { background: #d1d5db; }

/* ── RESPONSIVE ──────────────────────────────────── */
@media (max-width: 768px) {
  .cv-preview { padding: 1.5rem; }
  .cv-footer { flex-direction: column; }
  .cv-btn { width: 100%; justify-content: center; }
  .cv-contacts { flex-direction: column; align-items: center; }
  .cv-contacts span + span::before { display: none; }
}

/* ── PRINT / PDF ─────────────────────────────────── */
@media print {
  .cv-modal-overlay { background: #fff; position: static; }
  .cv-modal-content { box-shadow: none; max-height: none; }
  .cv-header, .cv-footer { display: none !important; }
  .cv-preview { padding: 0; overflow: visible; }
  .cv-section, .cv-top, .cv-experience, .cv-project { page-break-inside: avoid; }
}
</style>