<template>
  <div class="gap-analysis" v-if="analysis">
    <div class="compatibility-card">
      <div class="compatibility-header">
        <h3>Compatibilidade com a vaga</h3>
        <div class="percentage">{{ (analysis.compatibility * 100).toFixed(1) }}%</div>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar" :style="{ width: (analysis.compatibility * 100) + '%' }"></div>
      </div>
    </div>

    <div v-if="analysis.missingSkills.length > 0" class="gap-section missing">
      <h4>🚫 Habilidades que faltam completamente</h4>
      <div class="skill-tags">
        <span v-for="skill in analysis.missingSkills" :key="skill" class="skill-tag missing">
          {{ skill }}
        </span>
      </div>
    </div>

    <div v-if="analysis.weakSkills.length > 0" class="gap-section weak">
      <h4>⚠️ Habilidades com nível abaixo do exigido</h4>
      <div class="skill-list">
        <div v-for="item in analysis.weakSkills" :key="item.skill" class="skill-item">
          <span class="skill-name">{{ item.skill }}</span>
          <div class="skill-level">
            <span class="current">{{ (item.current * 100).toFixed(0) }}%</span>
            <span class="separator">→</span>
            <span class="required">{{ (item.required * 100).toFixed(0) }}%</span>
          </div>
          <div class="skill-bar">
            <div class="bar-current" :style="{ width: (item.current * 100) + '%' }"></div>
            <div class="bar-gap" :style="{ width: ((item.required - item.current) * 100) + '%' }"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="analysis.allGapSkills.length === 0" class="no-gap">
      <p>🎉 Parabéns! Você já atende a todas as habilidades exigidas por esta vaga.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { GapAnalysis } from '@/services/nexus-sprint.service';

defineProps<{
  analysis: GapAnalysis | null;
}>();
</script>

<style scoped>
.gap-analysis {
  margin-top: 2rem;
}
.compatibility-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #e9edf5 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}
.compatibility-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.compatibility-header h3 {
  margin: 0;
  font-size: 1.25rem;
}
.percentage {
  font-size: 2rem;
  font-weight: bold;
  color: #667eea;
}
.progress-bar-container {
  height: 10px;
  background: #ddd;
  border-radius: 5px;
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}
.gap-section {
  margin-bottom: 2rem;
}
.gap-section h4 {
  margin-bottom: 1rem;
  font-size: 1.1rem;
}
.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.skill-tag {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}
.skill-tag.missing {
  background: #fee2e2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}
.skill-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.skill-item {
  background: #f9fafb;
  border-radius: 8px;
  padding: 1rem;
}
.skill-name {
  font-weight: 600;
  display: block;
  margin-bottom: 0.5rem;
}
.skill-level {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}
.skill-level .current {
  color: #4b5563;
}
.skill-level .required {
  color: #667eea;
  font-weight: 600;
}
.skill-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  display: flex;
  overflow: hidden;
}
.bar-current {
  height: 100%;
  background: #10b981;
}
.bar-gap {
  height: 100%;
  background: #f59e0b;
}
.no-gap {
  text-align: center;
  padding: 2rem;
  background: #d1fae5;
  border-radius: 12px;
  color: #065f46;
}
</style>
