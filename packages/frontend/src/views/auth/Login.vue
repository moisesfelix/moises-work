<template>
  <div class="login-container">
    <div class="login-box">
      <h2>Admin Login</h2>
      <p>Entre com sua conta Google para gerenciar seu portfólio.</p>
      <button @click="handleGoogleLogin" class="google-btn">
        <i class="fab fa-google"></i> Entrar com Google
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore }       from "@/stores/auth";
import { usePortfoliosStore } from "@/stores/portfolios";

export default defineComponent({
  name: "Login",
  setup() {
    const router          = useRouter();
    const route           = useRoute();
    const authStore       = useAuthStore();
    const portfoliosStore = usePortfoliosStore();

    const handleGoogleLogin = async () => {
      try {
        await authStore.loginWithGoogle();
        const result   = await portfoliosStore.initializeUserPortfolio();
        let redirect   = (route.query?.redirectedFrom as string) || "/admin/dashboard";
        if (result?.isNew) redirect = "/admin/about";
        router.push(redirect);
      } catch (error: any) {
        alert("Falha no login: " + error.message);
      }
    };

    return { handleGoogleLogin };
  },
});
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 100px); /* Adjust based on header/footer */
  background-color: var(--background-body);
}
.login-box {
  background: var(--background-secondary);
  padding: 3rem;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  text-align: center;
  max-width: 400px;
  width: 90%;
}
h2 {
  margin-bottom: 1rem;
  color: var(--text-color-heading);
}
p {
  margin-bottom: 2rem;
  color: var(--text-color-body);
}
.google-btn {
  width: 100%;
  padding: 0.75rem;
  background-color: #DB4437;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: opacity 0.2s;
  font-size: 1rem;
}
.google-btn:hover {
  opacity: 0.9;
}
</style>