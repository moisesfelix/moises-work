import { apiGeminiService } from './api.gemini.service';
import { usePortfoliosStore } from '@/stores/portfolios';
import { useUserStore } from '@/stores/user';
import { AppSDK } from '@/sdk/AppSDK';
import { getCurrentInstance } from 'vue';

export interface JobAnalysisRequest {
  jobDescription: string;
  jobTitle?: string;
}

export interface JobSkills {
  [skill: string]: number; // nível de 0 a 1
}

export interface GapAnalysis {
  compatibility: number;        // 0 a 1
  missingSkills: string[];      // habilidades totalmente ausentes
  weakSkills: Array<{ skill: string; required: number; current: number }>; // habilidades com nível abaixo
  allGapSkills: Array<{ skill: string; required: number; current: number }>;
}

export interface NexusSprintResult {
  jobTitle: string;
  jobDescription: string;
  extractedSkills: JobSkills;
  gapAnalysis: GapAnalysis;
  roadmap: any; // O roadmap gerado pela IA (igual ao formato atual)
}

class NexusSprintService {
  /**
   * Extrai habilidades técnicas de uma descrição de vaga usando IA.
   */
  async extractSkillsFromJob(jobDescription: string): Promise<JobSkills> {
    const prompt = `
      Extraia as habilidades técnicas e seus níveis de proficiência exigidos pela seguinte descrição de vaga.
      Retorne APENAS um JSON válido no formato {"skills": {"skillName": level}} onde level é um número entre 0 e 1 (0 = não exigido, 1 = expert).
      Descrição da vaga:
      """
      ${jobDescription}
      """
    `;
    try {
      const response = await apiGeminiService.generateText(prompt);
      // Extrair JSON da resposta (pode vir com markdown)
      let jsonStr = response;
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      } else {
        // tentar achar um objeto JSON diretamente
        const possibleJson = response.match(/\{[\s\S]*\}/);
        if (possibleJson) jsonStr = possibleJson[0];
      }
      const parsed = JSON.parse(jsonStr);
      return parsed.skills || {};
    } catch (error) {
      console.error('Erro ao extrair skills da vaga:', error);
      throw new Error('Não foi possível extrair as habilidades da vaga. Tente novamente.');
    }
  }

  /**
   * Calcula a compatibilidade entre as skills do usuário e as exigidas pela vaga.
   */
  calculateGap(userSkills: string[], jobSkills: JobSkills): GapAnalysis {
    const userSkillMap: Record<string, number> = {};
    // Assumimos que todas as skills que o usuário declarou têm nível 1 (domina)
    userSkills.forEach(skill => {
      userSkillMap[skill.toLowerCase()] = 1.0;
    });

    const gapSkills: Array<{ skill: string; required: number; current: number }> = [];
    let totalRequired = 0;
    let totalMatch = 0;

    for (const [skill, required] of Object.entries(jobSkills)) {
      const current = userSkillMap[skill.toLowerCase()] || 0;
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

  /**
   * Gera um roadmap (Nexus Sprint) para preencher as lacunas identificadas.
   */
  async generateSprintRoadmap(
    jobTitle: string,
    jobDescription: string,
    gapAnalysis: GapAnalysis,
    userSkills: string[]
  ): Promise<any> {
    // Construir um prompt focado nas habilidades que faltam
    const missingList = gapAnalysis.missingSkills.join(', ');
    const weakList = gapAnalysis.weakSkills.map(w => `${w.skill} (atual ${w.current*100}%, necessário ${w.required*100}%)`).join(', ');

    const goal = `Preencher as lacunas para a vaga "${jobTitle}"`;
    const context = `
      O usuário já possui as seguintes habilidades: ${userSkills.join(', ')}.
      Habilidades totalmente ausentes: ${missingList || 'nenhuma'}.
      Habilidades com nível abaixo do exigido: ${weakList || 'nenhuma'}.
      Descrição completa da vaga: ${jobDescription}
    `;

    // Reutiliza o método generateRoadmap existente, passando um objeto com goal e skills
    const request = {
      goal,
      currentRole: 'Desenvolvedor',
      months: 3, // Podemos deixar fixo ou parametrizar
      skills: userSkills,
      context, // Será usado no prompt
    };

    // O método generateRoadmap já espera receber skills no request
    const roadmap = await apiGeminiService.generateRoadmap(request);
    return roadmap;
  }

  /**
   * Método principal que orquestra todo o fluxo.
   */
  async analyzeJobAndCreateSprint(request: JobAnalysisRequest): Promise<NexusSprintResult> {
    const { jobDescription, jobTitle = 'Vaga analisada' } = request;

    // 1. Extrair skills da vaga
    const extractedSkills = await this.extractSkillsFromJob(jobDescription);

    // 2. Obter skills do usuário (da store)
    const portfoliosStore = usePortfoliosStore();
    const userSkills = portfoliosStore.userSkills || [];

    // 3. Calcular gap
    const gapAnalysis = this.calculateGap(userSkills, extractedSkills);

    // 4. Gerar roadmap (se houver gap)
    let roadmap = null;
    if (gapAnalysis.allGapSkills.length > 0) {
      roadmap = await this.generateSprintRoadmap(jobTitle, jobDescription, gapAnalysis, userSkills);
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
