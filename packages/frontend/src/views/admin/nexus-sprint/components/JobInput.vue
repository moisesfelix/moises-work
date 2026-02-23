<template>
  <div class="job-input">
    <div class="form-group">
      <label for="jobTitle">Título da Vaga (opcional)</label>
      <input
        type="text"
        id="jobTitle"
        v-model="localJobTitle"
        placeholder="Ex: Desenvolvedor Full Stack Sênior"
        class="form-control"
      />
    </div>

    <div class="form-group">
      <label for="jobDescription">Descrição da Vaga</label>
      <textarea
        id="jobDescription"
        v-model="localJobDescription"
        rows="8"
        placeholder="Cole aqui a descrição completa da vaga..."
        class="form-control"
        required
      ></textarea>
    </div>

    <div class="form-actions">
      <button
        @click="handleAnalyze"
        class="btn btn-primary"
        :disabled="!localJobDescription.trim() || loading"
      >
        <span v-if="loading" class="spinner"></span>
        {{ loading ? 'Analisando...' : 'Analisar Vaga' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  modelValue: { title: string; description: string };
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: { title: string; description: string }): void;
  (e: 'analyze'): void;
}>();

const localJobTitle = ref(props.modelValue.title);
const localJobDescription = ref(props.modelValue.description);

watch([localJobTitle, localJobDescription], () => {
  emit('update:modelValue', {
    title: localJobTitle.value,
    description: localJobDescription.value,
  });
});

const handleAnalyze = () => {
  emit('analyze');
};
</script>

<style scoped>
.job-input {
  max-width: 800px;
  margin: 0 auto;
}
.form-group {
  margin-bottom: 1.5rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}
.form-control:focus {
  outline: none;
  border-color: #667eea;
}
textarea.form-control {
  resize: vertical;
  min-height: 150px;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
}
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}
.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.6s linear infinite;
  margin-right: 0.5rem;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
