<template>
  <transition name="fade">
    <div v-if="isOpen" class="share-modal-overlay" @click.self="close">
      <div class="share-modal">
        <!-- Header -->
        <div class="modal-header">
          <div class="header-content">
            <span class="icon-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>
            </span>
            <div>
              <h3 class="modal-title">Compartilhar Conteúdo</h3>
              <p class="modal-subtitle">{{ itemTitle }}</p>
            </div>
          </div>
          <button class="close-btn" @click="close">&times;</button>
        </div>

        <div class="modal-body">
          <!-- Seção de Redes Sociais -->
          <div class="social-grid">
            <button 
              v-for="network in networks" 
              :key="network.id"
              class="social-btn"
              :class="{ active: selectedNetwork === network.id }"
              @click="selectNetwork(network.id)"
            >
              <span class="social-icon" v-html="network.icon"></span>
              <span class="social-name">{{ network.name }}</span>
            </button>
          </div>

          <!-- Área de Criação/Edição da Mensagem -->
          <div v-if="selectedNetwork" class="message-editor">
            <div class="editor-header">
              <label>Mensagem para {{ getNetworkName(selectedNetwork) }}</label>
              <div class="editor-actions">
                <button class="btn-text" @click="toggleHistory">
                  <span class="icon">📜</span> Histórico
                </button>
                <button class="btn-magic" @click="generateAIMessage" :disabled="isGenerating">
                  <span v-if="isGenerating" class="spinner-sm"></span>
                  <span v-else>✨ Gerar com IA</span>
                </button>
              </div>
            </div>

            <div class="textarea-wrapper">
              <textarea 
                v-model="currentMessage" 
                rows="6" 
                placeholder="Escreva sua mensagem aqui..."
                class="custom-textarea"
              ></textarea>
              <div class="character-count" :class="{ 'limit-near': isLimitNear }">
                {{ currentMessage.length }} caracteres
              </div>
            </div>

            <!-- Opções de Tom (Visível apenas ao gerar com IA) -->
            <div v-if="showAIOptions" class="ai-options">
              <div class="option-group">
                <span>Tom:</span>
                <select v-model="aiOptions.tone">
                  <option value="profissional">Profissional</option>
                  <option value="persuasivo">Persuasivo</option>
                  <option value="engracado">Descontraído</option>
                  <option value="urgente">Urgência</option>
                </select>
              </div>
              <div class="option-group">
                <span>Objetivo:</span>
                <select v-model="aiOptions.goal">
                  <option value="trafego">Gerar Cliques</option>
                  <option value="engajamento">Comentários</option>
                  <option value="venda">Venda/Conversão</option>
                </select>
              </div>
              <button class="btn-confirm-ai" @click="confirmAIGeneration">Gerar</button>
            </div>

            <!-- Histórico de Mensagens Salvas -->
            <div v-if="showHistory && savedMessages.length > 0" class="history-panel">
              <h4>Mensagens Salvas</h4>
              <div class="history-list">
                <div 
                  v-for="(msg, index) in savedMessages" 
                  :key="index"
                  class="history-item"
                  @click="loadMessage(msg)"
                >
                  <p class="history-text">{{ truncate(msg.text, 60) }}</p>
                  <div class="history-meta">
                    <span class="badge-network">{{ msg.network }}</span>
                    <span class="usage-count">Enviada {{ msg.usageCount || 0 }}x</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Botão de Ação Final -->
            <div class="action-footer">
              <div class="link-preview">
                <span class="link-icon">🔗</span>
                <span class="link-url">{{ shareUrlWithTracking }}</span>
              </div>
              <button class="btn-share" @click="handleShare">
                Compartilhar Agora
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div v-else class="empty-selection">
            <p>Selecione uma rede social para começar</p>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useUiStore } from '@/stores/ui';
import { useAiStore } from '@/stores/ai';
import { usePortfoliosStore } from '@/stores/portfolios';
import { v4 as uuidv4 } from 'uuid';

const props = defineProps<{
  isOpen: boolean;
  item: any; // O artigo, projeto ou tutorial
  type: 'article' | 'project' | 'tutorial';
}>();

const emit = defineEmits(['close', 'update:item']);

const uiStore = useUiStore();
const aiStore = useAiStore();
const portfoliosStore = usePortfoliosStore();

// Estado
const selectedNetwork = ref<string | null>(null);
const currentMessage = ref('');
const isGenerating = ref(false);
const showAIOptions = ref(false);
const showHistory = ref(false);
const shareMessageId = ref(uuidv4());

const aiOptions = ref({
  tone: 'profissional',
  goal: 'trafego'
});

// Redes Suportadas
const networks = [
  { 
    id: 'whatsapp', 
    name: 'WhatsApp', 
    icon: `<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>`
  },
  { 
    id: 'linkedin', 
    name: 'LinkedIn', 
    icon: `<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle>`
  },
  { 
    id: 'twitter', 
    name: 'X (Twitter)', 
    icon: `<path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>`
  },
  { 
    id: 'facebook', 
    name: 'Facebook', 
    icon: `<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>`
  },
  { 
    id: 'telegram', 
    name: 'Telegram', 
    icon: `<line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>`
  }
];

// Computed
const itemTitle = computed(() => props.item?.title || 'Conteúdo Sem Título');

const isLimitNear = computed(() => {
    // Exemplo para Twitter (280 chars)
    if (selectedNetwork.value === 'twitter') return currentMessage.value.length > 260;
    return false;
});

const savedMessages = computed(() => {
    if (!props.item?.shareMessages) return [];
    // Filtra mensagens da rede selecionada ou genéricas
    return props.item.shareMessages.filter((m: any) => m.network === selectedNetwork.value || m.network === 'all');
});

const shareUrlWithTracking = computed(() => {

    // Base URL da aplicação
    const baseUrl = window.location.origin;
    
    // Recupera o Slug do Portfólio Ativo
    const portfolioSlug = portfoliosStore.activePortfolioSlug;

    if (!portfolioSlug) {
      console.warn('Slug do portfólio não encontrado, usando URL genérica');
      return baseUrl;
    }

    let path = '';
    const itemSlug = props.item.slug || props.item.id;

    if (props.type === 'article') {
       // Rota: /:portfolioSlug/artigo/:articleSlug
       path = `/${portfolioSlug}/artigo/${itemSlug}`;
    } else if (props.type === 'tutorial') {
       // Rota: /:portfolioSlug/tutorial/:tutorialSlug
       path = `/${portfolioSlug}/tutorial/${itemSlug}`;
    } else if (props.type === 'project') {
       // Rota: /:portfolioSlug/projeto/:id
       const projectId = props.item.id; 
       path = `/${portfolioSlug}/projeto/${projectId}`;
    }

    // Constrói a URL final com parâmetros de rastreamento
    return `${baseUrl}${path}?shareMessageId=${shareMessageId.value}&utm_source=${selectedNetwork.value || 'direct'}`;
});

// Actions
const close = () => {
    selectedNetwork.value = null;
    showAIOptions.value = false;
    currentMessage.value = '';
    emit('close');
};

const selectNetwork = (networkId: string) => {
    selectedNetwork.value = networkId;
    
    // Tenta recuperar a última mensagem usada para essa rede
    const lastMsg = savedMessages.value.find((m: any) => m.network === networkId);
    if (lastMsg) {
        currentMessage.value = lastMsg.text;
    } else {
        // Se não tiver, limpa ou põe um default
        currentMessage.value = `${itemTitle.value}\n\nConfira em: ${shareUrlWithTracking.value}`;
    }
};

const getNetworkName = (id: string) => networks.find(n => n.id === id)?.name || id;

const truncate = (text: string, length: number) => {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
};

const toggleHistory = () => {
    showHistory.value = !showHistory.value;
};

const loadMessage = (msg: any) => {
    currentMessage.value = msg.text;
    shareMessageId.value = msg.id || uuidv4(); // Usa o ID salvo ou gera novo se for antigo
};

// --- Lógica IA ---
const generateAIMessage = () => {
    if (!showAIOptions.value) {
        showAIOptions.value = true;
        return;
    }
    // Se já está aberto, só fecha (toggle) ou confirma? 
    // Vamos deixar o botão "Confirmar" na div de opções fazer o trabalho real
};

const confirmAIGeneration = async () => {
    if (!props.item) return;
    
    isGenerating.value = true;
    showAIOptions.value = false; // Fecha painel de opções
    
    try {
        // Chama a store (que chamará o serviço Gemini)
        // Passamos o contexto do item
        const promptContext = {
            title: props.item.title,
            description: props.item.description || props.item.excerpt || '',
            type: props.type,
            network: getNetworkName(selectedNetwork.value!),
            tone: aiOptions.value.tone,
            goal: aiOptions.value.goal,
            url: shareUrlWithTracking.value
        };

        const generatedText = await aiStore.generateSocialPost(promptContext);
        
        currentMessage.value = generatedText;
    } catch (error) {
        console.error("Erro ao gerar post:", error);
        alert("Não foi possível gerar a mensagem. Tente novamente.");
    } finally {
        isGenerating.value = false;
    }
};

// --- Lógica de Compartilhamento ---
const handleShare = async () => {
    if (!selectedNetwork.value) return;

    const text = currentMessage.value;
    const url = shareUrlWithTracking.value;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(url);

    // 1. Salvar a mensagem no histórico do item
    await saveMessageToHistory();

    // 2. Abrir a rede social
    let shareLink = '';

    switch (selectedNetwork.value) {
        case 'whatsapp':
            shareLink = `https://wa.me/?text=${encodedText}`;
            break;
        case 'telegram':
            shareLink = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
            break;
        case 'twitter':
            shareLink = `https://twitter.com/intent/tweet?text=${encodedText}`; // Twitter geralmente lida bem com URL no texto
            break;
        case 'linkedin':
            // LinkedIn não aceita texto customizado via URL facilmente, apenas URL.
            // Copiamos para o clipboard e abrimos o dialog de share
            await navigator.clipboard.writeText(text);
            alert("Texto copiado! Cole no LinkedIn após a abertura da janela.");
            shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
            break;
        case 'facebook':
             // Facebook idem LinkedIn
            await navigator.clipboard.writeText(text);
             alert("Texto copiado! O Facebook permite apenas compartilhar o link diretamente.");
            shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
            break;
    }

    if (shareLink) {
        window.open(shareLink, '_blank', 'width=600,height=400');
        
        // Incrementar contador localmente (opcional, visual)
        const msgIndex = savedMessages.value.findIndex(m => m.text === text);
        if (msgIndex !== -1) {
            savedMessages.value[msgIndex].usageCount++;
        }
    }
};

const saveMessageToHistory = async () => {
    const newMessage = {
        id: shareMessageId.value,
        text: currentMessage.value,
        network: selectedNetwork.value,
        tone: aiOptions.value.tone,
        usageCount: 1,
        createdAt: new Date().toISOString()
    };

    // Atualiza o objeto item no store
    const updatedItem = JSON.parse(JSON.stringify(props.item)); // Clone deep
    if (!updatedItem.shareMessages) updatedItem.shareMessages = [];
    
    // Verifica se já existe mensagem idêntica para não duplicar spam
    const existing = updatedItem.shareMessages.find((m: any) => m.text === newMessage.text && m.network === newMessage.network);
    
    if (existing) {
        existing.usageCount = (existing.usageCount || 0) + 1;
        existing.id = shareMessageId.value; // Atualiza ID para rastreamento atual
    } else {
        updatedItem.shareMessages.push(newMessage);
    }

    // Salva no store
    let storeType = '';
    if (props.type === 'article') storeType = 'articles';
    else if (props.type === 'project') storeType = 'projects';
    else if (props.type === 'tutorial') storeType = 'tutorials';

    if (storeType) {
        // Encontra o item na lista do store e atualiza
        // Nota: Isso depende de como o store lida com updates.
        // O ideal é chamar um método `updateItem` no store, mas vamos usar o saveData genérico
        const list = portfoliosStore[storeType as keyof typeof portfoliosStore] || [];
        const index = (list as any[]).findIndex((i: any) => i.id === updatedItem.id);
        
        if (index !== -1) {
            const newList = [...(list as any[])];
            newList[index] = updatedItem;
            await portfoliosStore.saveData({ type: storeType, data: newList });
            
            // Emite evento para o pai atualizar a prop se necessário
            emit('update:item', updatedItem);
        }
    }
};

// Gera novo ID de tracking sempre que troca de rede
watch(selectedNetwork, () => {
    shareMessageId.value = uuidv4();
});
</script>

<style scoped>
.share-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-modal {
  background: white;
  width: 90%;
  max-width: 600px;
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Header */
.modal-header {
  padding: 20px 25px;
  background: #f8f9fc;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  background: #eef2ff;
  color: #5b5fab;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e1e2d;
}

.modal-subtitle {
  margin: 2px 0 0 0;
  font-size: 13px;
  color: #666;
  max-width: 350px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  transition: 0.2s;
}

.close-btn:hover { color: #333; }

/* Body */
.modal-body {
  padding: 25px;
}

/* Social Grid */
.social-grid {
  display: flex;
  gap: 12px;
  margin-bottom: 25px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.social-btn {
  flex: 1;
  min-width: 80px;
  height: 80px;
  border: 1px solid #eee;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  border-color: #ddd;
}

.social-btn.active {
  background: #f0f4ff;
  border-color: #5b5fab;
  color: #5b5fab;
}

.social-icon svg {
  width: 24px;
  height: 24px;
}

.social-name {
  font-size: 11px;
  font-weight: 600;
}

/* Message Editor */
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.editor-header label {
  font-size: 13px;
  font-weight: 600;
  color: #444;
}

.editor-actions {
  display: flex;
  gap: 10px;
}

.btn-text {
  background: none;
  border: 1px solid #eee;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-magic {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 5px 12px;
  border-radius: 6px;
  font-size: 12px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
}

.btn-magic:disabled { opacity: 0.7; cursor: wait; }

.textarea-wrapper {
  position: relative;
  margin-bottom: 15px;
}

.custom-textarea {
  width: 100%;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  line-height: 1.5;
  color: #333;
  box-sizing: border-box;
}

.custom-textarea:focus {
  outline: none;
  border-color: #5b5fab;
  box-shadow: 0 0 0 3px rgba(91, 95, 171, 0.1);
}

.character-count {
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 11px;
  color: #999;
  background: rgba(255,255,255,0.8);
  padding: 2px 5px;
  border-radius: 4px;
}

.character-count.limit-near { color: #e74c3c; font-weight: bold; }

/* AI Options */
.ai-options {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
  border: 1px dashed #ccc;
}

.option-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-group span {
  font-size: 12px;
  font-weight: 600;
  color: #555;
}

.option-group select {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
}

.btn-confirm-ai {
  margin-left: auto;
  background: #333;
  color: white;
  border: none;
  padding: 6px 15px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

/* History */
.history-panel {
  margin-bottom: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 10px;
  max-height: 150px;
  overflow-y: auto;
}

.history-panel h4 {
  margin: 0 0 10px 0;
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
}

.history-item {
  padding: 8px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background 0.2s;
}

.history-item:hover { background: #f9f9f9; }

.history-text {
  margin: 0 0 5px 0;
  font-size: 12px;
  color: #444;
}

.history-meta {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #999;
}

.badge-network {
  text-transform: capitalize;
  background: #eee;
  padding: 1px 5px;
  border-radius: 4px;
}

/* Footer */
.action-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  gap: 15px;
}

.link-preview {
  flex: 1;
  background: #f0f4ff;
  padding: 10px;
  border-radius: 6px;
  font-size: 11px;
  color: #5b5fab;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-share {
  background: #2ecc71;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: 0.2s;
}

.btn-share:hover { background: #27ae60; }

.empty-selection {
  text-align: center;
  padding: 40px;
  color: #aaa;
  font-size: 14px;
  background: #fafafa;
  border-radius: 8px;
  border: 2px dashed #eee;
}

.spinner-sm {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
