import { apiGeminiService } from './api.gemini.service';
import { usePortfoliosStore } from '@/stores/portfolios';

export interface JobAnalysisRequest {
  jobDescription: string;
  jobTitle?: string;
}

export type JobSkills = Array<{ skill: string; level: number }>;

export interface GapAnalysis {
  compatibility: number;
  missingSkills: string[];
  weakSkills: Array<{ skill: string; required: number; current: number }>;
  allGapSkills: Array<{ skill: string; required: number; current: number }>;
}

export interface NexusSprintResult {
  jobTitle: string;
  jobDescription: string;
  extractedSkills: JobSkills;
  gapAnalysis: GapAnalysis;
  roadmap: any;
}

class NexusSprintService {

  private _getUserSkillMap(skillsFromStore: any): Record<string, number> {
    const skillMap: Record<string, number> = {};
    if (!skillsFromStore) return skillMap;

    for (const category in skillsFromStore) {
      if (Array.isArray(skillsFromStore[category])) {
        for (const skill of skillsFromStore[category]) {
          if (skill.name && typeof skill.percent === 'number') {
            skillMap[skill.name.toLowerCase()] = skill.percent / 100;
          }
        }
      }
    }
    return skillMap;
  }

  /**
   * Normaliza uma skill para matching: remove pontuação, sufixos de versão,
   * siglas redundantes etc.
   * Ex.: "JavaScript ES6+" → "javascript", "REST APIs" → "rest", "Vue.js 2/3" → "vue.js"
   */
  private _normalize(skill: string): string {
    return skill
      .toLowerCase()
      .replace(/\s*(es\d+\+?|v?\d+(\.\d+)*(\s*\/\s*\d+(\.\d+)*)?)\s*/g, '') // versões: ES6+, 2/3, v3.x
      .replace(/\bapi[s]?\b/gi, '')          // sufixo "API" ou "APIs"
      .replace(/\btoolkit\b/gi, '')          // "Redux Toolkit" → "redux"
      .replace(/[^a-z0-9.\s]/g, '')          // remove caracteres especiais
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Verifica se uma skill da vaga faz match com alguma skill do usuário.
   * Usa matching exato após normalização e também matching parcial (contains).
   */
  private _findMatchLevel(jobSkillRaw: string, userSkillMap: Record<string, number>): number {
    const jobNorm = this._normalize(jobSkillRaw);

    // 1. Match exato após normalização
    for (const [userKey, level] of Object.entries(userSkillMap)) {
      const userNorm = this._normalize(userKey);
      if (jobNorm === userNorm) return level;
    }

    // 2. Match parcial: um contém o outro (evita falsos positivos com strings muito curtas)
    for (const [userKey, level] of Object.entries(userSkillMap)) {
      const userNorm = this._normalize(userKey);
      if (userNorm.length < 3 || jobNorm.length < 3) continue;
      if (jobNorm.includes(userNorm) || userNorm.includes(jobNorm)) return level;
    }

    return 0;
  }

  async extractSkillsFromJob(jobDescription: string): Promise<JobSkills> {
    const prompt = `
      Extraia as habilidades técnicas exigidas pela seguinte descrição de vaga.
      
      REGRAS IMPORTANTES:
      - Use nomes canônicos e simples: "JavaScript" (não "JavaScript ES6+"), "Vue.js" (não "Vue.js 2/3"), "REST" (não "REST APIs")
      - Não inclua versões nos nomes das skills
      - Não repita a mesma skill com nomes diferentes
      - Level entre 0 e 1 (0.7 = proficiente, 1.0 = expert/sênior)
      
      Retorne APENAS um JSON válido no formato:
      {"skills": {"NomeDaSkill": level}}
      
      Descrição da vaga:
      """
      ${jobDescription}
      """
    `;
    try {
      const response = await apiGeminiService.generateText(prompt);
      let jsonStr = response;
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) jsonStr = jsonMatch[1];
      else {
        const possibleJson = response.match(/\{[\s\S]*\}/);
        if (possibleJson) jsonStr = possibleJson[0];
      }
      const parsed = JSON.parse(jsonStr);
      const skillsObject = parsed.skills || {};
      return Object.entries(skillsObject).map(([skill, level]) => ({
        skill,
        level: level as number,
      }));
    } catch (error) {
      console.error('Erro ao extrair skills da vaga:', error);
      throw new Error('Não foi possível extrair as habilidades da vaga. Tente novamente.');
    }
  }

  calculateGap(userSkillMap: Record<string, number>, jobSkills: JobSkills): GapAnalysis {
    const gapSkills: Array<{ skill: string; required: number; current: number }> = [];
    let totalRequired = 0;
    let totalMatch = 0;

    for (const { skill, level: required } of jobSkills) {
      // Usa matching inteligente em vez de lookup direto
      const current = this._findMatchLevel(skill, userSkillMap);
      const match = Math.min(current, required);
      totalRequired += required;
      totalMatch += match;
      if (current < required) {
        gapSkills.push({ skill, required, current });
      }
    }

    const compatibility = totalRequired > 0 ? totalMatch / totalRequired : 1;
    const missingSkills = gapSkills.filter(g => g.current === 0).map(g => g.skill);
    const weakSkills = gapSkills.filter(g => g.current > 0 && g.current < g.required);

    return {
      compatibility,
      missingSkills,
      weakSkills,
      allGapSkills: gapSkills,
    };
  }

  async generateSprintRoadmap(
    jobTitle: string,
    jobDescription: string,
    gapAnalysis: GapAnalysis,
    userSkills: string[]
  ): Promise<any> {
    const missingList = gapAnalysis.missingSkills.join(', ');
    const weakList = gapAnalysis.weakSkills
      .map(w => `${w.skill} (atual: ${(w.current * 100).toFixed(0)}%, necessário: ${(w.required * 100).toFixed(0)}%)`)
      .join(', ');

    const goal = `Preencher as lacunas para a vaga "${jobTitle}"`;
    const context = `
      O usuário já possui as seguintes habilidades: ${userSkills.join(', ')}.
      Habilidades totalmente ausentes: ${missingList || 'nenhuma'}.
      Habilidades com nível abaixo do exigido: ${weakList || 'nenhuma'}.
      Descrição completa da vaga: ${jobDescription}
    `;

    return await apiGeminiService.generateRoadmap({
      goal,
      currentRole: 'Desenvolvedor',
      months: 3,
      skills: userSkills,
      context,
    });
  }

  async analyzeJobAndCreateSprint(request: JobAnalysisRequest): Promise<NexusSprintResult> {
    const { jobDescription, jobTitle = 'Vaga analisada' } = request;

    const extractedSkills = await this.extractSkillsFromJob(jobDescription);

    const portfoliosStore = usePortfoliosStore();
    const userSkillMap = this._getUserSkillMap(portfoliosStore.skills);

    const gapAnalysis = this.calculateGap(userSkillMap, extractedSkills);

    let roadmap = null;
    if (gapAnalysis.allGapSkills.length > 0) {
      const userSkillNames = Object.keys(userSkillMap);
      roadmap = await this.generateSprintRoadmap(jobTitle, jobDescription, gapAnalysis, userSkillNames);
    }

    return {
      jobTitle,
      jobDescription,
      extractedSkills,
      gapAnalysis,
      roadmap,
    };
  }
}

export const nexusSprintService = new NexusSprintService();