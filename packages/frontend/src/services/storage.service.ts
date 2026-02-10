// src/services/storage.service.ts

import { storage } from '@/firebase/config';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
// 1. Importe o serviço do Gemini que corrigimos
import { geminiService } from './gemini.service'; 

class StorageService {
  
  // Upload de um Blob (arquivo) para o Firebase Storage
  async uploadImage(file: Blob, path: string): Promise<string> {
    try {
      // Define o nome do arquivo (ex: articles/uuid.jpg)
      // Forçamos .jpg pois o Gemini retorna jpeg
      const fileName = `${uuidv4()}.jpg`; 
      const storageRef = ref(storage, `${path}/${fileName}`);
      
      // Upload
      await uploadBytes(storageRef, file);
      
      // Obter URL pública
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error("Erro no upload para Firebase:", error);
      throw error;
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    if (!imageUrl || !imageUrl.includes('firebase')) {
      return; 
    }

    try {
      const url = new URL(imageUrl);
      // Ajuste regex para pegar o path correto do Firebase Storage
      const pathMatch = url.pathname.match(/\/o\/(.+)\?/); 
      
      if (pathMatch && pathMatch[1]) {
        const path = decodeURIComponent(pathMatch[1]);
        const imageRef = ref(storage, path);
        await deleteObject(imageRef);
      }
    } catch (error) {
      console.warn('Erro ao deletar imagem (pode já ter sido removida):', error);
      // Não damos throw aqui para não travar a exclusão do artigo
    }
  }

  // Método Orchestrator: Gera Imagens -> Faz Upload -> Retorna URLs
  async uploadMultipleImages(
    imagePrompts: string[],
    basePath: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<string[]> {
    const urls: string[] = [];
    
    for (let i = 0; i < imagePrompts.length; i++) {
      try {
        console.log(`🖼️ Processando imagem ${i + 1}/${imagePrompts.length}...`);
        
        // 1. GERA A IMAGEM (Usando o GeminiService agora!)
        const imageBlob = await this.generateImageFromPrompt(imagePrompts[i]);
        
        // 2. FAZ O UPLOAD
        const url = await this.uploadImage(imageBlob, basePath);
        urls.push(url);
        
        if (onProgress) {
          onProgress(i + 1, imagePrompts.length);
        }
      } catch (error) {
        console.error(`❌ Falha ao processar imagem ${i + 1}:`, error);
        // Fallback final: Se tudo falhar, usa placeholder para não quebrar o array
        urls.push('https://via.placeholder.com/800x600?text=Error+Generating+Image');
      }
    }
    
    return urls;
  }

  // --- A CORREÇÃO ESTÁ AQUI ---
  private async generateImageFromPrompt(prompt: string): Promise<Blob> {
    // ANTES (ERRADO): Tentava chamar uma API backend que não existe
    // const response = await fetch('/api/generate-image', ...);

    // AGORA (CORRETO): Chama o serviço frontend que configuramos
    return await geminiService.generateImage(prompt);
  }
}

export const storageService = new StorageService();