import { defineStore } from 'pinia';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { db } from '@/firebase/config';
import { ref, get, set, serverTimestamp } from 'firebase/database';
import { useUiStore } from './ui';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any | null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.user,
    currentUser:     (state) => state.user,
  },
  actions: {
    setUser(user: any) {
      this.user = user;
    },
    clearUser() {
      this.user = null;
    },
    async loginWithGoogle() {
      const ui = useUiStore();
      ui.setLoading(true);
      ui.setError(null);
      try {
        const auth     = getAuth();
        const provider = new GoogleAuthProvider();
        const result   = await signInWithPopup(auth, provider);
        const user     = result.user;

        const userRef  = ref(db, `users/${user.uid}`);
        const snap     = await get(userRef);
        if (!snap.exists()) {
          await set(userRef, {
            email:       user.email,
            displayName: user.displayName,
            photoURL:    user.photoURL,
            createdAt:   serverTimestamp(),
          });
        }
        this.user = user;
        return user;
      } catch (error: any) {
        ui.setError(error.message);
        throw error;
      } finally {
        ui.setLoading(false);
      }
    },
    async logout() {
      const ui = useUiStore();
      ui.setLoading(true);
      try {
        await signOut(getAuth());
        this.user = null;
      } catch (error: any) {
        ui.setError(error.message);
        throw error;
      } finally {
        ui.setLoading(false);
      }
    },
  },
});
