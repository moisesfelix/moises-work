/**
* ============================================================
* SDK AGNÓSTICO — Módulos reutilizáveis
* Extraído de: MelôDeIA
* Compatível com: Vue, React, Vanilla JS, Node.js
* Dependências externas: Firebase SDK 8.x e 9.x (Modular)
* ============================================================
*
* MÓDULOS:
*   1. CreditsModule      — Créditos por feature + plano diário
*   2. PixModule          — Geração e polling de pagamento PIX
*   3. ReferralModule     — Sistema de indicação com bônus
*   4. GenerationModule   — Chamadas a APIs de geração de conteúdo
*   5. LoggerModule       — Logger agnóstico para Firebase
*   6. UtilsModule        — Sanitização, IDs, validações
*
* USO BÁSICO:
*   const sdk = new AppSDK({ firebase: fbInstance, db: database, dbVersion: 'v1' })
*   await sdk.credits.deduct(userId, 1, 'generate')
*   await sdk.pix.generate({ planId, valor, userId })
*   await sdk.referral.check(userId)
* ============================================================
*/

import { ref as dbRef, push, set, update, get, child, runTransaction, onValue, off, query, orderByChild, equalTo } from 'firebase/database';

// ============================================================
// 0. UTILS — Funções de apoio
// ============================================================
const UtilsModule = {
  /**
  * Gera um ID público curto (para links de indicação, etc.)
  * @returns {string} ex: "a1b2c3" + timestamp
  */
  generatePublicUid() {
    return Math.random().toString(36).substring(2, 8) + Date.now().toString(36)
  },

  /**
  * Gera um hash único (para IDs de blocos, registros, etc.)
  * @returns {string}
  */
  generateUniqueHash() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  },

  /**
  * Sanitiza texto: remove tags HTML, limita tamanho, trim
  * @param {string} input
  * @param {number|null} maxLength
  * @returns {string}
  */
  sanitize(input: any, maxLength: number | null = null) {
    if (!input || typeof input !== 'string') return ''
    let s = input.trim()
    if (maxLength && s.length > maxLength) s = s.substring(0, maxLength)
    s = s.replace(/<script[^>]*>.*?<\/script>/gi, '')
    s = s.replace(/<[^>]*>/g, '')
    return s
  },

  /**
  * Remove campos perigosos de objetos Firebase
  * @param {object} data
  * @returns {object}
  */
  sanitizeFirebaseData(data: any) {
    if (!data || typeof data !== 'object') return {}
    const clean = { ...data }
    delete clean.__proto__
    delete clean.constructor
    return clean
  },

  /**
  * Sanitiza nickname para uso como chave no Firebase
  * (Firebase não aceita . # $ / [ ])
  * @param {string} nickname
  * @returns {string}
  */
  sanitizeNicknameKey(nickname: string) {
    if (!nickname) return ''
    return nickname.toLowerCase().replace(/[.#$\/\[\]]/g, '_')
  },

  /**
  * Formata data para pt-BR
  * @param {string} dateString - ISO string
  * @returns {string}
  */
  formatDate(dateString: string) {
    if (!dateString) return ''
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    } catch { return '' }
  }
}

// ============================================================
// 1. CREDITS MODULE — Créditos por feature
// ============================================================
/**
* Gerencia créditos regulares e créditos de plano diário.
*
* ESTRUTURA NO FIREBASE:
*   users/{userId}/credits        → number (créditos permanentes)
*   users/{userId}/dailyCredits   → number (créditos do plano diário)
*   users/{userId}/dailyPlanExpiry → ISO string
*/

class CreditsModule {
  db: any;
  dbVersion: string;
  featureCosts: Record<string, number>;

  constructor(db: any, dbVersion = '', featureCosts = {}) {
    this.db = db
    this.dbVersion = dbVersion
    this.featureCosts = {
      generate: 1,
      analyze_music: 5,
      analyze_soul: 8,
      regenerate_block: 2,
      save_idea: 0,
      ...featureCosts
    }
  }

  ref(path: string) {
    // Compatibilidade com SDK Modular (v9+)
    const fullPath = this.dbVersion ? `${this.dbVersion}/${path}` : path;
    
    // Se a instância db for do tipo modular (não tem .ref()), usamos a função ref importada
    if (!this.db.ref) {
       return dbRef(this.db, fullPath);
    }
    
    return this.db.ref(fullPath)
  }

  getCost(featureName: string) {
    return this.featureCosts[featureName] ?? 1
  }

  async getLastBonusDate(userId: string) {
    if (!this.db.ref) {
      // Modular
      const snapshot = await get(child(this.ref(`users/${userId}`), 'lastBonusDate'));
      return snapshot.val();
    }
    // Compat
    const snap = await this.ref(`users/${userId}/lastBonusDate`).get();
    return snap.val();
  }

  async updateLastBonusDate(userId: string, date: string) {
    if (!this.db.ref) {
      // Modular
      await update(this.ref(`users/${userId}`), { lastBonusDate: date });
      return;
    }
    // Compat
    await this.ref(`users/${userId}`).update({ lastBonusDate: date });
  }

  canUse(userState: any, featureName: string) {
    const cost = this.getCost(featureName)
    if (cost === 0) return { canExecute: true, cost: 0, type: 'free' }
    
    // 1. Tenta usar créditos do plano diário se estiver ativo E tiver saldo suficiente
    if (userState.isDailyPlanActive && (userState.dailyCredits || 0) >= cost) {
      return {
        canExecute: true,
        cost,
        type: 'daily'
      }
    }

    // 2. Se não tiver plano diário OU saldo diário insuficiente, usa créditos regulares
    return {
      canExecute: (userState.credits || 0) >= cost,
      cost,
      type: 'regular'
    }
  }

  async deduct(userId: string, amount: number, type = 'regular') {
    if (amount === 0) return { newBalance: null }
    const field = type === 'daily' ? 'dailyCredits' : 'credits'
    let newBalance

    if (!this.db.ref) {
        // Modular
        const targetRef = child(this.ref(`users/${userId}`), field);
        await runTransaction(targetRef, (current: number) => {
            newBalance = Math.max(0, (current || 0) - amount)
            return newBalance
        });

        // Log spending history
        const historyRef = child(this.ref(`users/${userId}`), 'spendingHistory');
        await set(push(historyRef), {
            amount,
            type,
            timestamp: new Date().toISOString(),
            description: `Deduction for ${type}`
        });
    } else {
        // Compat
        const userRef = this.ref(`users/${userId}`)
        await userRef.child(field).transaction((current: number) => {
            newBalance = Math.max(0, (current || 0) - amount)
            return newBalance
        })
        
        // Log spending history
        await userRef.child('spendingHistory').push().set({
            amount,
            type,
            timestamp: new Date().toISOString(),
            description: `Deduction for ${type}`
        })
    }
    return { newBalance }
  }

  async add(userId: string, amount: number, type = 'regular') {
    const field = type === 'daily' ? 'dailyCredits' : 'credits'
    let newBalance

    if (!this.db.ref) {
        // Modular
        const targetRef = child(this.ref(`users/${userId}`), field);
        await runTransaction(targetRef, (current: number) => {
            newBalance = (current || 0) + amount
            return newBalance
        });
    } else {
        // Compat
        const userRef = this.ref(`users/${userId}`)
        await userRef.child(field).transaction((current: number) => {
            newBalance = (current || 0) + amount
            return newBalance
        })
    }
    return { newBalance }
  }

  async activateDailyPlan(userId: string, dailyCreditAmount: number) {
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    if (!this.db.ref) {
        // Modular
        await update(this.ref(`users/${userId}`), {
            dailyCredits: dailyCreditAmount,
            dailyPlanExpiry: expiry,
        });
    } else {
        // Compat
        const userRef = this.ref(`users/${userId}`)
        await userRef.update({
            dailyCredits: dailyCreditAmount,
            dailyPlanExpiry: expiry,
        })
    }
    return { expiry }
  }

  async checkDailyPlan(userId: string, dailyPlanExpiry: string) {
    if (!dailyPlanExpiry) return { isActive: false }
    const isActive = new Date(dailyPlanExpiry) > new Date()
    if (!isActive) {
      if (!this.db.ref) {
          await update(this.ref(`users/${userId}`), {
            dailyCredits: 0,
            dailyPlanExpiry: null
          });
      } else {
          await this.ref(`users/${userId}`).update({
            dailyCredits: 0,
            dailyPlanExpiry: null
          })
      }
    }
    return { isActive }
  }
}

// ============================================================
// 2. PIX MODULE — Pagamentos PIX com polling
// ============================================================
class PixModule {
  db: any;
  dbVersion: string;
  generateUrl: string;
  listUrl: string;
  pollingInterval: number;
  pollingTimeout: number;
  _intervals: Record<string, any>;
  _timeouts: Record<string, any>;

  constructor(db: any, dbVersion = '', config: any = {}) {
    this.db = db
    this.dbVersion = dbVersion
    this.generateUrl = config.generateUrl
    this.listUrl = config.listUrl
    this.pollingInterval = config.pollingInterval || 20000
    this.pollingTimeout = config.pollingTimeout || 600000
    this._intervals = {}
    this._timeouts = {}
  }

  ref(path: string) {
    const fullPath = this.dbVersion ? `${this.dbVersion}/${path}` : path;
    if (!this.db.ref) {
       return dbRef(this.db, fullPath);
    }
    return this.db.ref(fullPath)
  }

  async generate({ planId, valor, userId, publicUid = '', referrerId = null }: any) {
    let paymentId;
    let paymentRef;

    const payloadBase = {
        planId,
        valor: String(valor),
        userId,
        publicUid,
        referrerId,
        timestamp: new Date().toISOString(),
        status: 'PENDING',
    };

    if (!this.db.ref) {
        // Modular
        const paymentsListRef = this.ref('payments');
        paymentRef = push(paymentsListRef);
        paymentId = paymentRef.key;
        await set(paymentRef, { ...payloadBase, paymentId });
    } else {
        // Compat
        paymentRef = this.ref('payments').push()
        paymentId = paymentRef.key
        await paymentRef.set({ ...payloadBase, paymentId });
    }
    
    // Simulação de chamada externa se URL não estiver definida
    if (!this.generateUrl) {
       console.warn('PIX Generate URL not configured. Simulating...')
       return { paymentId, txid: paymentId, qrCode: 'mock_qr', copyPaste: 'mock_copy_paste' }
    }

    const response = await fetch(this.generateUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payloadBase, paymentId, txid: paymentId })
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error || 'Erro ao gerar PIX')
    }
    const data = await response.json()
    const txid = data.charge?.txid || paymentId

    const updates = {
        txid,
        pixCopiaECola: data.copieecola,
        qrCodeImage: data.qrcodeImage,
        status: 'PENDING'
    };

    if (!this.db.ref) {
        await update(paymentRef, updates);
    } else {
        await paymentRef.update(updates);
    }

    // Agora o retorno usa os nomes que a view espera ou mapeia corretamente
    return {
      paymentId,
      txid,
      qrCode: data.qrcodeImage || '',
      copyPaste: data.copieecola || ''
    }
  }

  startPolling(paymentId: string, onSuccess: Function, onTimeout?: Function) {
    this.stopPolling(paymentId)
    this._intervals[paymentId] = setInterval(
      () => this._check(paymentId, onSuccess),
      this.pollingInterval
    )
    this._timeouts[paymentId] = setTimeout(() => {
      this.stopPolling(paymentId)
      if (onTimeout) onTimeout()
    }, this.pollingTimeout)
  }

  stopPolling(paymentId: string) {
    if (this._intervals[paymentId]) {
      clearInterval(this._intervals[paymentId])
      delete this._intervals[paymentId]
    }
    if (this._timeouts[paymentId]) {
      clearTimeout(this._timeouts[paymentId])
      delete this._timeouts[paymentId]
    }
  }

  stopAll() {
    Object.keys(this._intervals).forEach(id => this.stopPolling(id))
  }

  async _check(paymentId: string, onSuccess: Function) {
    try {
      let paymentData;
      if (!this.db.ref) {
         const snap = await get(this.ref(`payments/${paymentId}`));
         paymentData = snap.val();
      } else {
         const snap = await this.ref(`payments/${paymentId}`).once('value');
         paymentData = snap.val();
      }

      if (!paymentData) return
      if (paymentData.status === 'PAID') {
        this.stopPolling(paymentId)
        if (onSuccess) onSuccess(paymentData)
        return
      }
      
      if (!this.listUrl) return;

      const now = new Date()
      const from = new Date(now.getTime() - 5 * 60 * 1000)
      const params = new URLSearchParams({
        startDate: from.toISOString(),
        endDate: now.toISOString()
      })
      const res = await fetch(`${this.listUrl}?${params}`)
      if (!res.ok) return
      const apiData = await res.json()
      const found = apiData?.pix?.find((p: any) => p.txid === paymentData.txid)
      if (found) {
        const updates = {
          status: 'PAID',
          paidAmount: found.valor,
          paidAt: found.horario,
          endToEndId: found.endToEndId
        };
        
        if (!this.db.ref) {
            await update(this.ref(`payments/${paymentId}`), updates);
        } else {
            await this.ref(`payments/${paymentId}`).update(updates);
        }

        this.stopPolling(paymentId)
        if (onSuccess) onSuccess({ ...paymentData, status: 'PAID' })
      }
    } catch (err) {
      console.error('[PixModule] Erro no polling:', err)
    }
  }
}

// ============================================================
// 3. REFERRAL MODULE — Sistema de indicação com bônus
// ============================================================
class ReferralModule {
  db: any;
  dbVersion: string;
  appUrl: string;
  bonusCredits: number;

  constructor(db: any, dbVersion = '', config: any = {}) {
    this.db = db
    this.dbVersion = dbVersion
    this.appUrl = config.appUrl || (typeof window !== 'undefined' ? window.location.origin : '')
    this.bonusCredits = config.bonusCredits || 10
  }

  ref(path: string) {
    const fullPath = this.dbVersion ? `${this.dbVersion}/${path}` : path;
    if (!this.db.ref) {
       return dbRef(this.db, fullPath);
    }
    return this.db.ref(fullPath)
  }

  buildLink(publicUid: string, nickname: string) {
    const nick = encodeURIComponent(nickname.replace(/\s/g, '-'))
    return `${this.appUrl}?ref=${publicUid}&nick=${nick}`
  }

  async checkUrlAndRegister(currentUserId: string, currentUserNickname: string) {
    if (typeof window === 'undefined') return { registered: false };
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    const nick = params.get('nick')
    if (!ref || !nick || !currentUserId) return { registered: false }
    
    // Busca o usuário referenciador pelo publicUid
    let referrerId = null;

    if (!this.db.ref) {
        // Modular
        const q = query(this.ref('users'), orderByChild('publicUid'), equalTo(ref));
        const snap = await get(q);
        if (!snap.exists()) return { registered: false }
        referrerId = Object.keys(snap.val())[0];
    } else {
        const snap = await this.db.ref(`${this.dbVersion}/users`)
            .orderByChild('publicUid').equalTo(ref).once('value')
        if (!snap.exists()) return { registered: false }
        referrerId = Object.keys(snap.val())[0]
    }
    
    if (referrerId === currentUserId) return { registered: false }
    
    const registered = await this._register(referrerId, currentUserId, currentUserNickname)
    if (registered) {
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    return { registered, referrerId }
  }

  async _register(referrerId: string, referredId: string, referredNickname: string) {
    let exists = false;
    
    if (!this.db.ref) {
        const q = query(this.ref('referrals'), orderByChild('referredId'), equalTo(referredId));
        const snap = await get(q);
        exists = snap.exists();
    } else {
        const existing = await this.ref('referrals')
            .orderByChild('referredId').equalTo(referredId).once('value')
        exists = existing.exists();
    }
    
    if (exists) return false
    
    const payload = {
      referrerId,
      referredId,
      referredNickname: UtilsModule.sanitize(referredNickname, 50),
      timestamp: new Date().toISOString(),
      status: 'pending',
      firstPayment: false
    };

    if (!this.db.ref) {
        await set(push(this.ref('referrals')), payload);
        
        const targetRef = child(this.ref(`users/${referrerId}`), 'referralData');
        await runTransaction(targetRef, (data: any) => {
            if (!data) data = { totalIndications: 0, completedPayments: 0, totalCredits: 0 }
            data.totalIndications = (data.totalIndications || 0) + 1
            return data
        });
    } else {
        await this.ref('referrals').push().set(payload);
        
        await this.ref(`users/${referrerId}/referralData`).transaction((data: any) => {
            if (!data) data = { totalIndications: 0, completedPayments: 0, totalCredits: 0 }
            data.totalIndications = (data.totalIndications || 0) + 1
            return data
        })
    }
    return true
  }

  async processBonus(userId: string, paymentId: string, userNickname: string) {
    let referralKey;
    let referralData;

    if (!this.db.ref) {
        const q = query(this.ref('referrals'), orderByChild('referredId'), equalTo(userId));
        const snap = await get(q);
        if (!snap.exists()) return { bonusGranted: false }
        referralKey = Object.keys(snap.val())[0];
        referralData = UtilsModule.sanitizeFirebaseData(snap.val()[referralKey]);
    } else {
        const snap = await this.ref('referrals')
            .orderByChild('referredId').equalTo(userId).once('value')
        if (!snap.exists()) return { bonusGranted: false }
        referralKey = Object.keys(snap.val())[0]
        referralData = UtilsModule.sanitizeFirebaseData(snap.val()[referralKey]) as any
    }
    
    if (referralData.firstPayment) return { bonusGranted: false }
    
    const referrerId = referralData.referrerId
    const bonus = this.bonusCredits
    
    if (!this.db.ref) {
        // Modular
        const referrerCreditsRef = child(this.ref(`users/${referrerId}`), 'credits');
        await runTransaction(referrerCreditsRef, (c: number) => (c || 0) + bonus);
        
        const referrerDataRef = child(this.ref(`users/${referrerId}`), 'referralData');
        await runTransaction(referrerDataRef, (data: any) => {
             if (!data) data = { totalIndications: 0, completedPayments: 0, totalCredits: 0 }
             data.completedPayments = (data.completedPayments || 0) + 1
             data.totalCredits = (data.totalCredits || 0) + bonus
             return data
        });

        await set(push(child(this.ref(`users/${referrerId}`), 'referralHistory')), {
             nickname: UtilsModule.sanitize(userNickname, 50),
             timestamp: new Date().toISOString(),
             credits: bonus
        });

        const userCreditsRef = child(this.ref(`users/${userId}`), 'credits');
        await runTransaction(userCreditsRef, (c: number) => (c || 0) + bonus);

        await update(this.ref(`referrals/${referralKey}`), { firstPayment: true, status: 'completed' });
        await update(this.ref(`payments/${paymentId}`), { referralProcessed: true });

    } else {
        // Compat
        const referrerRef = this.ref(`users/${referrerId}`)
        await referrerRef.child('credits').transaction((c: number) => (c || 0) + bonus)
        await referrerRef.child('referralData').transaction((data: any) => {
          if (!data) data = { totalIndications: 0, completedPayments: 0, totalCredits: 0 }
          data.completedPayments = (data.completedPayments || 0) + 1
          data.totalCredits = (data.totalCredits || 0) + bonus
          return data
        })
        await referrerRef.child('referralHistory').push().set({
          nickname: UtilsModule.sanitize(userNickname, 50),
          timestamp: new Date().toISOString(),
          credits: bonus
        })
        
        await this.ref(`users/${userId}/credits`).transaction((c: number) => (c || 0) + bonus)
        await this.ref(`referrals/${referralKey}`).update({ firstPayment: true, status: 'completed' })
        await this.ref(`payments/${paymentId}`).update({ referralProcessed: true })
    }
    
    return { bonusGranted: true }
  }

  listen(userId: string, onStats: Function, onHistory: Function) {
    if (!this.db.ref) {
        // Modular
        const statsRef = child(this.ref(`users/${userId}`), 'referralData');
        const histRef = child(this.ref(`users/${userId}`), 'referralHistory');

        const statsCallback = (snap: any) => {
            const data = UtilsModule.sanitizeFirebaseData(snap.val()) || {}
            if (onStats) onStats({
                link: data.link || '',
                totalIndications: data.totalIndications || 0,
                completedPayments: data.completedPayments || 0,
                totalCredits: data.totalCredits || 0
            })
        }
        
        const histCallback = (snap: any) => {
            const data = UtilsModule.sanitizeFirebaseData(snap.val()) || {}
            if (onHistory) onHistory(Object.values(data))
        }

        onValue(statsRef, statsCallback);
        onValue(histRef, histCallback);

        return {
            unsubscribe() {
                off(statsRef, 'value', statsCallback);
                off(histRef, 'value', histCallback);
            }
        }
    } else {
        // Compat
        const userRef = this.ref(`users/${userId}`)
        const statsRef = userRef.child('referralData')
        const histRef = userRef.child('referralHistory')
        
        const statsCallback = (snap: any) => {
          const data = UtilsModule.sanitizeFirebaseData(snap.val()) || {}
          if (onStats) onStats({
            link: data.link || '',
            totalIndications: data.totalIndications || 0,
            completedPayments: data.completedPayments || 0,
            totalCredits: data.totalCredits || 0
          })
        }
        
        const histCallback = (snap: any) => {
          const data = UtilsModule.sanitizeFirebaseData(snap.val()) || {}
          if (onHistory) onHistory(Object.values(data))
        }
    
        statsRef.on('value', statsCallback)
        histRef.on('value', histCallback)
        
        return {
          unsubscribe() {
            statsRef.off('value', statsCallback)
            histRef.off('value', histCallback)
          }
        }
    }
  }
}

import { authService } from '@/services/auth.service';

// ============================================================
// 4. GENERATION MODULE — Chamadas a APIs de geração de conteúdo
// ============================================================
class GenerationModule {
  endpoints: Record<string, string>;

  constructor(endpoints = {}) {
    this.endpoints = endpoints
  }

  async call(endpointName: string, payload: any) {
    const url = this.endpoints[endpointName]
    if (!url) throw new Error(`[GenerationModule] Endpoint '${endpointName}' não registrado.`)
    
    // Obtém o header de autenticação
    const authHeader = await authService.getAuthHeader();

    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...authHeader 
      },
      body: JSON.stringify(payload)
    })
    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error || `Erro na API '${endpointName}'`)
    }
    return response.json()
  }

  register(name: string, url: string) {
    this.endpoints[name] = url
  }
}

// ============================================================
// 5. LOGGER MODULE — Logger agnóstico para Firebase
// ============================================================
class LoggerModule {
  db: any;
  dbVersion: string;
  currentUser: any;
  sessionId: string;

  constructor(db: any, dbVersion = '') {
    this.db = db
    this.dbVersion = dbVersion
    this.currentUser = null
    this.sessionId = UtilsModule.generateUniqueHash()
  }

  setUser(user: any) {
    this.currentUser = user
  }

  ref(path: string) {
    const fullPath = this.dbVersion ? `${this.dbVersion}/${path}` : path;
    if (!this.db.ref) {
       return dbRef(this.db, fullPath);
    }
    return this.db.ref(fullPath)
  }

  log(eventName: string, data: any = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      eventName,
      userId: this.currentUser?.uid || 'anonymous',
      sessionId: this.sessionId,
      data: this._sanitize(data)
    }
    try {
      const today = new Date().toISOString().split('T')[0]
      const fullPath = this.dbVersion 
        ? `${this.dbVersion}/logs/${today}` 
        : `logs/${today}`;
      
      if (!this.db.ref) {
         // Modular SDK
         const logRef = push(this.ref(fullPath));
         set(logRef, entry);
      } else {
         // Compat SDK
         this.db.ref(fullPath).push().set(entry);
      }
    } catch (err) {
      console.error('[LoggerModule] Falha ao registrar evento:', err)
    }
  }

  _sanitize(data: any) {
    const clean = JSON.parse(JSON.stringify(data))
    const sensitive = ['password', 'token', 'apiKey', 'secret', 'key', 'email']
    for (const k in clean) {
      if (sensitive.some(s => k.toLowerCase().includes(s))) clean[k] = '[REDACTED]'
    }
    return clean
  }
}

// ============================================================
// 6. AppSDK — Ponto de entrada unificado
// ============================================================
export class AppSDK {
  credits: CreditsModule;
  pix: PixModule;
  referral: ReferralModule;
  gen: GenerationModule;
  logger: LoggerModule;
  utils: typeof UtilsModule;

  constructor(config: any = {}) {
    const { db, dbVersion = '', appUrl, featureCosts, bonusCredits, endpoints, pixConfig } = config
    this.credits  = new CreditsModule(db, dbVersion, featureCosts)
    this.pix      = new PixModule(db, dbVersion, pixConfig || {})
    this.referral = new ReferralModule(db, dbVersion, { appUrl, bonusCredits })
    this.gen      = new GenerationModule(endpoints || {})
    this.logger   = new LoggerModule(db, dbVersion)
    this.utils    = UtilsModule
  }
}
