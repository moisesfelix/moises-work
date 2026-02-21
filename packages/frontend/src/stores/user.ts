import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getDatabase, ref as dbRef, onValue, off, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { sdk } from '@/sdk';
import { useUiStore } from '@/stores/ui';

interface ReferralData {
  link: string;
  totalIndications: number;
  completedPayments: number;
  totalCredits: number;
}

interface ReferralHistoryItem {
  nickname: string;
  timestamp: string;
  credits: number;
}

interface SpendingHistoryItem {
  amount: number;
  type: string;
  timestamp: string;
  description: string;
}

export const useUserStore = defineStore('user', () => {
  const credits = ref(0);
  const dailyCredits = ref(0);
  const dailyPlanExpiry = ref<string | null>(null);
  const lastBonusDate = ref<string | null>(null);
  const referralData = ref<ReferralData | null>(null);
  const referralHistory = ref<ReferralHistoryItem[]>([]);
  const spendingHistory = ref<SpendingHistoryItem[]>([]);
  
  let userRef: any = null;
  let historyRef: any = null;
  let spendingRef: any = null;

  const checkMonthlyBonus = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    try {
      // Use SDK agnostic method to retrieve data
      const lastBonus = await sdk.credits.getLastBonusDate(user.uid);

      const now = new Date();
      const bonusAmount = 50;
      let shouldGiveBonus = false;

      if (!lastBonus) {
        shouldGiveBonus = true; // Primeiro acesso (Welcome Bonus)
      } else {
        const lastDate = new Date(lastBonus);
        if (now.getTime() - lastDate.getTime() > 30 * 24 * 60 * 60 * 1000) {
          shouldGiveBonus = true;
        }
      }

      if (shouldGiveBonus) {
        await sdk.credits.add(user.uid, bonusAmount, 'regular');
        await sdk.credits.updateLastBonusDate(user.uid, now.toISOString());
        
        const uiStore = useUiStore();
        uiStore.triggerToast({ 
          message: `🎁 Parabéns! Você ganhou ${bonusAmount} créditos de bônus mensal!`, 
          type: 'success',
          duration: 6000
        });
      }
    } catch (error) {
      console.error('Erro ao verificar bônus mensal:', error);
    }
  };

  const listenToUserData = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    const db = getDatabase();
    // Ajuste o caminho conforme dbVersion definido no SDK (vazio agora)
    userRef = dbRef(db, `users/${user.uid}`);
    
    onValue(userRef, (snap) => {
      const data = snap.val() || {};
      credits.value = data.credits || 0;
      dailyCredits.value = data.dailyCredits || 0;
      dailyPlanExpiry.value = data.dailyPlanExpiry || null;
      lastBonusDate.value = data.lastBonusDate || null;
      referralData.value = data.referralData || null;
    });

    historyRef = dbRef(db, `users/${user.uid}/referralHistory`);
    onValue(historyRef, (snap) => {
      const data = snap.val() || {};
      referralHistory.value = Object.values(data);
    });

    spendingRef = dbRef(db, `users/${user.uid}/spendingHistory`);
    onValue(spendingRef, (snap) => {
      const data = snap.val() || {};
      spendingHistory.value = Object.values(data).sort((a: any, b: any) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    });
  };

  const stopListening = () => {
    if (userRef) off(userRef);
    if (historyRef) off(historyRef);
    if (spendingRef) off(spendingRef);
  };

  return {
    credits,
    dailyCredits,
    dailyPlanExpiry,
    lastBonusDate,
    referralData,
    referralHistory,
    spendingHistory,
    listenToUserData,
    checkMonthlyBonus,
    stopListening
  };
});
