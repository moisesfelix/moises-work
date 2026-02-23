import * as admin from 'firebase-admin';

// Certifique-se de inicializar o admin ANTES de qualquer uso, 
// caso o creditsService seja importado antes do index.ts rodar.
// No ambiente Cloud Functions, o index.ts roda primeiro, mas em testes locais ou imports circulares pode falhar.
if (!admin.apps.length) {
  admin.initializeApp();
}

class CreditsService {
  private get db(): admin.database.Database {
    return admin.database();
  }

  // Removido construtor que chamava admin.database() imediatamente
  constructor() {}

  /**
   * Tenta debitar créditos do usuário de forma atômica, respeitando a hierarquia:
   * 1. Plano Diário (se ativo e com saldo)
   * 2. Créditos Regulares
   */
  async deductCredits(userId: string, cost: number, featureName: string): Promise<boolean> {
    if (cost === 0) return true;

    const userRef = this.db.ref(`users/${userId}`);
    const historyRef = userRef.child('spendingHistory');
    
    // Variável para capturar qual tipo de crédito foi usado (para o log)
    // O firebase transaction não permite passar contexto externo facilmente,
    // então determinamos a lógica de prioridade dentro da transação.
    
    // Executa transação no objeto do usuário para garantir consistência entre os dois saldos
    const result = await userRef.transaction((userData) => {
      // Se userData for null, o nó ainda não existe ou não foi carregado.
      // Retornar o userData informa ao Firebase para tentar novamente.
      if (userData === null) {
         return userData; 
      }

      const now = new Date().getTime();
      // Converte para número (defensivo)
      const dailyCredits = Number(userData.dailyCredits || 0);
      const regularCredits = Number(userData.credits || 0);
      
      console.log(`[DeductCredits] User ${userId}: Cost ${cost}, Daily ${dailyCredits}, Regular ${regularCredits}`);
      
      // Verifica validade do plano diário
      let isDailyActive = false;
      if (userData.dailyPlanExpiry) {
        const expiryTime = new Date(userData.dailyPlanExpiry).getTime();
        isDailyActive = expiryTime > now;
      }

      // 1. Tenta debitar do Diário (se ativo e suficiente)
      if (isDailyActive && dailyCredits >= cost) {
        userData.dailyCredits = dailyCredits - cost;
        userData._lastDeductionType = 'daily'; 
        return userData;
      }

      // 2. Tenta debitar do Regular (se suficiente)
      // IMPORTANTE: Garantir que credits existe no objeto, senão cria.
      if (regularCredits >= cost) {
        userData.credits = regularCredits - cost;
        userData._lastDeductionType = 'regular'; 
        return userData;
      }
      
      // 3. Se falhar, retorna undefined para abortar.
      // Mas loga para entender por que falhou.
      console.warn(`[DeductCredits] Insufficient funds for User ${userId}. Cost: ${cost}. Daily: ${dailyCredits} (Active: ${isDailyActive}), Regular: ${regularCredits}`);
      return; 
    });

    if (!result.committed) {
      // Se o snapshot for null, significa que o usuário não existe no DB
      if (result.snapshot.val() === null) {
         throw new Error('Usuário não encontrado no banco de dados de créditos.');
      }
      throw new Error('Saldo insuficiente. Verifique seus créditos diários ou regulares.');
    }

    const updatedData = result.snapshot.val();
    const deductionType = updatedData._lastDeductionType || 'regular';

    // Remove a flag temporária do DB (operação assíncrona fire-and-forget)
    userRef.child('_lastDeductionType').remove();

    // Auditoria: Registrar o gasto no histórico
    await historyRef.push({
      amount: cost,
      type: deductionType,
      feature: featureName,
      timestamp: new Date().toISOString(),
      description: `Uso de IA: ${featureName}`,
      platform: 'backend'
    });

    return true;
  }

  /**
   * Reembolsa créditos do usuário em caso de falha na operação.
   * Tenta devolver para o saldo de onde foi debitado (se possível) ou para o saldo regular.
   * Por simplificação, devolvemos para o saldo regular (credits) para evitar complexidade com daily expirado,
   * a menos que tenhamos certeza que foi do daily. Mas como a flag _lastDeductionType é removida,
   * vamos reembolsar no regularCredits para garantir que o usuário não perca o valor.
   * Ou melhor: Se a falha foi imediata, podemos tentar ser justos.
   * Mas "crédito é crédito", se devolvermos no regular, o usuário fica feliz.
   */
  async refundCredits(userId: string, cost: number, featureName: string): Promise<boolean> {
    if (cost === 0) return true;

    const userRef = this.db.ref(`users/${userId}`);
    const historyRef = userRef.child('spendingHistory');

    await userRef.transaction((userData) => {
        if (!userData) return;
        // Devolve para os créditos regulares para simplificar e beneficiar o usuário
        // (evita problemas com expiração de diários)
        userData.credits = (Number(userData.credits) || 0) + cost;
        return userData;
    });

    // Auditoria: Registrar o estorno
    await historyRef.push({
      amount: cost,
      type: 'refund',
      feature: featureName,
      timestamp: new Date().toISOString(),
      description: `Estorno: ${featureName}`,
      platform: 'backend'
    });

    console.log(`[RefundCredits] User ${userId}: Refunded ${cost} for ${featureName}`);
    return true;
  }
}

export const creditsService = new CreditsService();
