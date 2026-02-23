import { defineStore } from 'pinia';
import { ref } from 'vue';

import { getDatabase, ref as dbRef, onValue, off, get, set, update, child } from 'firebase/database';
import { getAuth, signOut } from 'firebase/auth';
import { sdk } from '@/sdk';
import { useUiStore } from '@/stores/ui';
import { useRouter } from 'vue-router';

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
  const isDailyPlanActive = ref(false); // Adicionado para uso na UI
  const dailyPlanExpiry = ref<string | null>(null);
  const lastBonusDate = ref<string | null>(null);
  const referralData = ref<ReferralData | null>(null);
  const referralHistory = ref<ReferralHistoryItem[]>([]);
  const spendingHistory = ref<SpendingHistoryItem[]>([]);
  



  let userRefUnsub: any = null;
  let historyRefUnsub: any = null;
  let spendingRefUnsub: any = null;
  const router = useRouter(); // Use fora do checkAuthError para garantir contexto
  const uiStore = useUiStore();









  const checkAuthError = async (message:string) => {
      // Simplificado check de erro
      if (message && (message.includes('auth/id-token-expired') || message.includes('Unauthorized'))) {
          const auth = getAuth();
          await signOut(auth);
          router.push({ name: 'Login' });
      }

  };

  const checkMonthlyBonus = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;

    try {

      const lastBonus = await sdk.credits.getLastBonusDate(user.uid);

      const now = new Date();

      // Bônus mensal se tiver passado 30 dias ou se nunca recebeu
      let shouldGiveBonus = false;

      if (!lastBonus) {

        shouldGiveBonus = true; 
      } else {
        const lastDate = new Date(lastBonus);



        const diffTime = Math.abs(now.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (diffDays >= 30) shouldGiveBonus = true;
      }

      if (shouldGiveBonus) {

        // Adiciona 10 créditos (exemplo)
        await sdk.credits.add(user.uid, 10, 'regular');
        await sdk.credits.updateLastBonusDate(user.uid, now.toISOString());
        

        uiStore.triggerToast({ 

          message: `🎁 Parabéns! Você ganhou 10 créditos de bônus mensal!`, 
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


    const userPath = `users/${user.uid}`;
    const userRef = dbRef(db, userPath);
    

    userRefUnsub = onValue(userRef, (snap) => {
      const data = snap.val() || {};
      credits.value = data.credits || 0;
      dailyCredits.value = data.dailyCredits || 0;
      dailyPlanExpiry.value = data.dailyPlanExpiry || null;
      lastBonusDate.value = data.lastBonusDate || null;
      referralData.value = data.referralData || null;

      // Verifica se plano diário está ativo
      if (data.dailyPlanExpiry) {
          isDailyPlanActive.value = new Date(data.dailyPlanExpiry) > new Date();
      } else {
          isDailyPlanActive.value = false;
      }
    });



    const historyRef = dbRef(db, `users/${user.uid}/referralHistory`);
    historyRefUnsub = onValue(historyRef, (snap) => {
      const data = snap.val() || {};

      referralHistory.value = Object.values(data) as ReferralHistoryItem[];
    });



    const spendingRef = dbRef(db, `users/${user.uid}/spendingHistory`);
    spendingRefUnsub = onValue(spendingRef, (snap) => {
      const data = snap.val() || {};

      spendingHistory.value = (Object.values(data) as SpendingHistoryItem[]).sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    });
  };

  const stopListening = () => {



    if (userRefUnsub) userRefUnsub();
    if (historyRefUnsub) historyRefUnsub();
    if (spendingRefUnsub) spendingRefUnsub();
  };

  return {
    credits,
    dailyCredits,
    isDailyPlanActive,
    dailyPlanExpiry,
    lastBonusDate,
    referralData,
    referralHistory,
    spendingHistory,
    listenToUserData,
    checkMonthlyBonus,
    stopListening,
    checkAuthError
  };
});
