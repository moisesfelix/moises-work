<template>
  <div class="credits-page">
    <div class="page-header">
      <h1>💰 Gerenciar Créditos</h1>
      <p class="subtitle">Adquira créditos para usar recursos premium de IA e potencialize sua carreira.</p>
    </div>

    <!-- Saldo Atual -->
    <div class="current-balance-card">
      <div class="balance-info">
        <h3>Saldo Atual</h3>
        <div class="credits-display">
          <span class="amount">{{ userStore.credits }}</span>
          <span class="label">créditos</span>
        </div>
        <p v-if="userStore.dailyCredits > 0" class="daily-bonus">
          + {{ userStore.dailyCredits }} créditos diários (expira em breve)
        </p>
      </div>
      <div class="referral-mini">
        <p>Ganhe créditos grátis indicando amigos!</p>
        <button class="btn btn-outline btn-small" @click="scrollToReferral">Ver como</button>
      </div>
    </div>

    <!-- Planos de Compra -->
    <div class="plans-grid">
      <div v-for="plan in plans" :key="plan.id" class="plan-card" :class="{ featured: plan.featured }">
        <div v-if="plan.featured" class="featured-badge">Mais Popular</div>
        <h3>{{ plan.name }}</h3>
        <div class="price">R$ {{ plan.price }}</div>
        <div class="credits-amount">{{ plan.credits }} créditos</div>
        <ul class="features">
          <li v-for="feature in plan.features" :key="feature">✅ {{ feature }}</li>
        </ul>
        <button 
          class="btn btn-primary btn-block" 
          @click="selectPlan(plan)"
          :disabled="processing"
        >
          {{ processing && selectedPlan?.id === plan.id ? 'Gerando PIX...' : 'Comprar Agora' }}
        </button>
      </div>
    </div>

    <!-- Histórico de Gastos -->
    <div class="spending-history-card">
        <h3>📜 Histórico de Uso de Créditos</h3>
        <div v-if="userStore.spendingHistory.length === 0" class="no-history">
            <p>Nenhum registro encontrado.</p>
        </div>
        <table v-else class="history-table">
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Descrição</th>
                    <th>Valor</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in userStore.spendingHistory" :key="item.timestamp">
                    <td>{{ formatDate(item.timestamp) }}</td>
                    <td>
                      <span :class="['badge', item.type === 'daily' ? 'badge-daily' : 'badge-regular']">
                        {{ item.type === 'daily' ? 'Diário' : 'Regular' }}
                      </span>
                    </td>
                    <td>{{ item.description }}</td>
                    <td class="amount-col">-{{ item.amount }}</td>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- Área de Indicação -->
    <div id="referral-area" class="referral-section">
      <h2>🤝 Indique e Ganhe</h2>
      <p>Ganhe <strong>10 créditos</strong> para cada amigo que se cadastrar e fizer a primeira compra.</p>
      
      <div class="referral-link-box">
        <input type="text" readonly :value="referralLink" ref="linkInput" />
        <button class="btn btn-secondary" @click="copyLink">
          {{ copied ? 'Copiado!' : 'Copiar Link' }}
        </button>
      </div>

      <div class="referral-stats">
        <div class="stat-item">
          <span class="stat-value">{{ userStore.referralData?.totalIndications || 0 }}</span>
          <span class="stat-label">Amigos Cadastrados</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ userStore.referralData?.completedPayments || 0 }}</span>
          <span class="stat-label">Compras Confirmadas</span>
        </div>
        <div class="stat-item highlight">
          <span class="stat-value">{{ userStore.referralData?.totalCredits || 0 }}</span>
          <span class="stat-label">Créditos Ganhos</span>
        </div>
      </div>
    </div>

    <!-- Modal de Pagamento PIX -->
    <transition name="fade">
      <div v-if="showPixModal" class="modal-overlay">
        <div class="modal-content pix-modal">
          <div class="modal-header">
            <h3>Pagamento via PIX</h3>
            <button class="close-btn" @click="closePixModal">&times;</button>
          </div>
          
          <div class="pix-body">
            <p class="instruction">Escaneie o QR Code ou use o "Copia e Cola" para pagar.</p>
            
            <div class="qr-code-container">
              <img v-if="currentPayment?.qrCodeImage" :src="currentPayment.qrCodeImage" alt="QR Code PIX" />
              <div v-else class="qr-placeholder">Gerando QR Code...</div>
            </div>

            <div class="copy-paste-area">
              <label>Código PIX Copia e Cola:</label>
              <div class="input-group">
                <input type="text" readonly :value="currentPayment?.copyPaste" />
                <button class="btn-icon" @click="copyPixCode" title="Copiar">📋</button>
              </div>
            </div>

            <div class="payment-status">
              <div v-if="paymentStatus === 'PENDING'" class="status-pending">
                <span class="spinner-small"></span> Aguardando pagamento...
              </div>
              <div v-else-if="paymentStatus === 'PAID'" class="status-success">
                ✅ Pagamento confirmado! Adicionando créditos...
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';
import { useAuthStore } from '@/stores/auth';
import { AppSDK } from '@/sdk/AppSDK';

const sdk = inject('sdk') as AppSDK;
const userStore = useUserStore();
const authStore = useAuthStore();

const processing = ref(false);
const showPixModal = ref(false);
const selectedPlan = ref<any>(null);
const currentPayment = ref<any>(null);
const paymentStatus = ref('PENDING');
const copied = ref(false);

const plans = [
  { 
    id: 'pack_10', 
    name: 'Iniciante', 
    price: '9,90', 
    value: 9.90, 
    credits: 10,
    features: ['Gere 5 artigos', 'Ou 2 roadmaps completos'] 
  },
  { 
    id: 'pack_50', 
    name: 'Profissional', 
    price: '29,90', 
    value: 29.90, 
    credits: 50, 
    featured: true,
    features: ['Gere 25 artigos', 'Análises de soft skills', 'Melhor custo-benefício'] 
  },
  { 
    id: 'pack_100', 
    name: 'Expert', 
    price: '49,90', 
    value: 49.90, 
    credits: 100,
    features: ['Uso intensivo de IA', 'Roadmaps ilimitados', 'Suporte prioritário'] 
  }
];

const referralLink = computed(() => {
  if (!authStore.user?.uid) return '';
  // Usa o publicUid se existir (ideal), ou o uid como fallback (menos seguro/bonito)
  // No sdk.referral.buildLink esperamos publicUid
  // Vamos assumir que o store ou user object tem publicUid, senão geramos um mock ou usamos uid
  const publicUid = (authStore.user as any).publicUid || authStore.user.uid; 
  return sdk.referral.buildLink(publicUid, authStore.user.displayName || 'User');
});

const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

onMounted(() => {
    // A lógica de carregar histórico já está no userStore.listenToUserData()
});

const selectPlan = async (plan: any) => {
  if (processing.value) return;
  selectedPlan.value = plan;
  processing.value = true;
  paymentStatus.value = 'PENDING';

  try {
    const payment = await sdk.pix.generate({
      planId: plan.id,
      valor: plan.value,
      userId: authStore.user?.uid
    });
    
    // SDK returns { qrCode, copyPaste, ... } but view was using pixCopiaECola and qrCodeImage
    // Mapping here to ensure view works
    currentPayment.value = {
        ...payment,
        qrCodeImage: payment.qrCode,
        pixCopiaECola: payment.copyPaste
    };
    
    showPixModal.value = true;
    
    // Inicia polling
    sdk.pix.startPolling(
      payment.paymentId, 
      async (data: any) => {
        paymentStatus.value = 'PAID';
        await sdk.credits.add(authStore.user?.uid!, plan.credits, 'regular');
        
        // Processa bônus de indicação se houver
        await sdk.referral.processBonus(authStore.user?.uid!, data.paymentId, authStore.user?.displayName!);
        
        setTimeout(() => {
          closePixModal();
          alert(`Pagamento confirmado! ${plan.credits} créditos adicionados.`);
        }, 2000);
      },
      () => {
        alert('Tempo de pagamento expirado. Tente novamente.');
        closePixModal();
      }
    );

  } catch (error) {
    console.error(error);
    alert('Erro ao gerar pagamento. Tente novamente.');
  } finally {
    processing.value = false;
  }
};

const closePixModal = () => {
  showPixModal.value = false;
  if (currentPayment.value) {
    sdk.pix.stopPolling(currentPayment.value.paymentId);
  }
  currentPayment.value = null;
  selectedPlan.value = null;
};

const copyLink = () => {
  navigator.clipboard.writeText(referralLink.value);
  copied.value = true;
  setTimeout(() => copied.value = false, 2000);
};

const copyPixCode = () => {
  if (currentPayment.value?.copyPaste) {
    navigator.clipboard.writeText(currentPayment.value.copyPaste);
    alert('Código PIX copiado!');
  } else if (currentPayment.value?.pixCopiaECola) {
    navigator.clipboard.writeText(currentPayment.value.pixCopiaECola);
    alert('Código PIX copiado!');
  }
};


const scrollToReferral = () => {
  document.getElementById('referral-area')?.scrollIntoView({ behavior: 'smooth' });
};
</script>

<style scoped>
.credits-page {
  padding: 20px;
  background-color: var(--bg-light, #f5f7fb);
  min-height: 100vh;
}
.page-header { margin-bottom: 30px; text-align: center; }
.page-header h1 { font-size: 2rem; color: #333; }
.subtitle { color: #666; }

.current-balance-card {
  background: white; border-radius: 12px; padding: 25px; margin-bottom: 40px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center;
  max-width: 800px; margin-left: auto; margin-right: auto;
}
.balance-info h3 { margin: 0 0 10px; color: #555; font-size: 1rem; }
.credits-display { display: flex; align-items: baseline; gap: 5px; }
.amount { font-size: 3rem; font-weight: 800; color: #5b5fab; line-height: 1; }
.label { font-size: 1rem; color: #888; font-weight: 500; }
.daily-bonus { color: #e67e22; font-size: 0.9rem; margin-top: 5px; font-weight: 600; }
.referral-mini { text-align: right; border-left: 1px solid #eee; padding-left: 20px; }

.spending-history-card {
  background: white; border-radius: 12px; padding: 25px; margin-bottom: 40px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  max-width: 800px; margin-left: auto; margin-right: auto;
}
.spending-history-card h3 { margin-top: 0; color: #555; font-size: 1.1rem; border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 15px; }
.no-history { text-align: center; color: #888; padding: 20px; }
.history-table { width: 100%; border-collapse: collapse; }
.history-table th { text-align: left; color: #888; font-weight: 500; padding: 10px; border-bottom: 1px solid #eee; font-size: 0.9rem; }
.history-table td { padding: 12px 10px; border-bottom: 1px solid #f5f5f5; color: #555; font-size: 0.9rem; }
.history-table tr:last-child td { border-bottom: none; }
.amount-col { color: #e74c3c; font-weight: bold; }

.badge { padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
.badge-daily { background: #fff3cd; color: #856404; }
.badge-regular { background: #d4edda; color: #155724; }

.plans-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;
  max-width: 1000px; margin: 0 auto 50px;
}
.plan-card {
  background: white; border-radius: 12px; padding: 30px; text-align: center;
  border: 2px solid transparent; transition: 0.3s; position: relative;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
}
.plan-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
.plan-card.featured { border-color: #5b5fab; background: linear-gradient(to bottom, #fff, #f8f9ff); }
.featured-badge {
  position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
  background: #5b5fab; color: white; padding: 4px 12px; border-radius: 20px;
  font-size: 0.8rem; font-weight: bold;
}
.plan-card h3 { color: #333; margin-bottom: 10px; }
.price { font-size: 2rem; font-weight: bold; color: #333; margin-bottom: 5px; }
.credits-amount { color: #5b5fab; font-weight: 600; margin-bottom: 20px; font-size: 1.1rem; }
.features { list-style: none; padding: 0; margin-bottom: 25px; text-align: left; }
.features li { margin-bottom: 8px; font-size: 0.9rem; color: #666; }

.btn { padding: 12px 25px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; transition: 0.2s; }
.btn-primary { background: #5b5fab; color: white; }
.btn-primary:hover:not(:disabled) { background: #4a4e94; }
.btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
.btn-secondary { background: #e2e8f0; color: #333; }
.btn-secondary:hover { background: #cbd5e0; }
.btn-outline { background: transparent; border: 1px solid #5b5fab; color: #5b5fab; }
.btn-block { width: 100%; }

.referral-section {
  background: white; padding: 40px; border-radius: 12px; text-align: center;
  max-width: 800px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.03);
}
.referral-link-box {
  display: flex; gap: 10px; justify-content: center; margin: 20px 0; max-width: 500px; margin-left: auto; margin-right: auto;
}
.referral-link-box input {
  flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 6px; background: #f9f9f9; color: #555;
}
.referral-stats { display: flex; justify-content: center; gap: 40px; margin-top: 30px; }
.stat-item { display: flex; flex-direction: column; }
.stat-value { font-size: 2rem; font-weight: bold; color: #333; }
.stat-label { font-size: 0.9rem; color: #888; }
.stat-item.highlight .stat-value { color: #e67e22; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000;
}
.modal-content.pix-modal {
  background: white; padding: 0; width: 90%; max-width: 450px; border-radius: 12px; overflow: hidden;
}
.modal-header {
  padding: 15px 20px; background: #f8f9fa; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center;
}
.pix-body { padding: 30px; text-align: center; }
.qr-code-container {
  width: 200px; height: 200px; margin: 20px auto; border: 1px solid #eee; display: flex; align-items: center; justify-content: center;
}
.qr-code-container img { width: 100%; height: 100%; object-fit: contain; }
.qr-placeholder { color: #ccc; }
.copy-paste-area { margin-bottom: 20px; }
.copy-paste-area label { display: block; margin-bottom: 5px; font-weight: 500; font-size: 0.9rem; }
.input-group { display: flex; gap: 5px; }
.input-group input { flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.8rem; }
.btn-icon { padding: 8px; border: 1px solid #ddd; border-radius: 4px; background: #f9f9f9; cursor: pointer; }
.status-pending { color: #e67e22; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 500; }
.status-success { color: #27ae60; font-weight: bold; font-size: 1.1rem; }
.spinner-small {
  width: 16px; height: 16px; border: 2px solid #e67e22; border-top-color: transparent; border-radius: 50%; animation: spin 1s linear infinite;
}
</style>
