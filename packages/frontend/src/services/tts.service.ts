export class TtsService {
  private synthesis: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.isSupported = true;
      
      // Carregar vozes inicialmente
      this.loadVoices();

      // Atualizar vozes quando a lista mudar (alguns navegadores carregam assincronamente)
      if (this.synthesis.onvoiceschanged !== undefined) {
        this.synthesis.onvoiceschanged = () => this.loadVoices();
      }
    } else {
      console.warn('Text-to-Speech não é suportado neste navegador.');
    }
  }

  /**
   * Tenta encontrar uma voz em Português do Brasil (pt-BR).
   * Se não encontrar, tenta qualquer voz em português ou deixa o padrão.
   */
  private loadVoices(): void {
    if (!this.synthesis) return;

    const voices = this.synthesis.getVoices();
    
    // Prioridade: pt-BR > pt > primeira disponível
    this.voice = voices.find(v => v.lang === 'pt-BR') || 
                 voices.find(v => v.lang.startsWith('pt')) || 
                 null;
                 
    // Opcional: Logar a voz selecionada para debug
    // if (this.voice) console.log('Voz TTS selecionada:', this.voice.name);
  }

  /**
   * Lê o texto fornecido.
   * Cancela qualquer leitura anterior.
   * @param text O texto a ser lido.
   * @param rate Velocidade (0.1 a 10). Padrão 1.
   * @param pitch Tom (0 a 2). Padrão 1.
   */
  speak(text: string, rate: number = 1, pitch: number = 1): void {
    if (!this.isSupported || !this.synthesis) {
      console.error('TTS não suportado ou não inicializado.');
      return;
    }

    // Cancelar fala anterior para evitar sobreposição
    this.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = rate;
    utterance.pitch = pitch;

    if (this.voice) {
      utterance.voice = this.voice;
    }

    // Eventos opcionais para controle de estado UI (se necessário futuramente)
    utterance.onstart = () => { /* console.log('Iniciou a fala'); */ };
    utterance.onend = () => { /* console.log('Terminou a fala'); */ };
    utterance.onerror = (e) => { console.error('Erro no TTS:', e); };

    this.synthesis.speak(utterance);
  }

  /**
   * Pausa a leitura atual.
   */
  pause(): void {
    if (this.synthesis && this.synthesis.speaking && !this.synthesis.paused) {
      this.synthesis.pause();
    }
  }

  /**
   * Retoma a leitura pausada.
   */
  resume(): void {
    if (this.synthesis && this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  /**
   * Cancela a leitura (para completamente).
   */
  cancel(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  /**
   * Verifica se está falando no momento.
   */
  isSpeaking(): boolean {
    return this.synthesis ? this.synthesis.speaking : false;
  }
}

export const ttsService = new TtsService();
