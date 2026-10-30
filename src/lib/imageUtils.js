// Importamos a instância do client do Supabase do projeto para interagir com o Storage
import { supabase } from '../services/supabase';

/**
 * COMPRESSOR DE IMAGEM NATIVO CANVAS
 * Comprime uma imagem no lado do cliente (Client-Side) usando a API de Canvas do HTML5.
 * Converte e exporta a imagem em formato WebP otimizado, reduzindo a qualidade progressivamente
 * até que o tamanho do arquivo fique abaixo de 150KB.
 * 
 * @param {File} file - O arquivo de imagem original capturado do input do tipo file.
 * @returns {Promise<Blob>} Uma Promise que resolve com o Blob da imagem comprimida em formato WebP.
 */
export const compressImageNative = (file) => {
  return new Promise((resolve, reject) => {
    // Instanciamos o leitor de arquivos para ler a imagem como uma URL de dados (Base64)
    const reader = new FileReader();
    reader.readAsDataURL(file);

    // Callback executado quando a leitura do arquivo é finalizada com sucesso
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      // Callback executado quando o elemento Image conclui o carregamento do conteúdo Base64
      img.onload = () => {
        const MAX_WIDTH = 1920;  // Resolução máxima de largura recomendada (Full HD)
        const MAX_HEIGHT = 1080; // Resolução máxima de altura recomendada (Full HD)
        let width = img.width;
        let height = img.height;

        // Mantém a proporção da imagem (Aspect Ratio) ao redimensionar
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        // Criamos um elemento Canvas na memória para renderizar a imagem redimensionada
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        // Obtemos o contexto 2D para desenhar no Canvas
        const ctx = canvas.getContext('2d');
        // Desenha a imagem redimensionada no Canvas nas coordenadas (0,0)
        ctx.drawImage(img, 0, 0, width, height);

        let quality = 0.85; // Qualidade inicial de compressão WebP (85%)
        const maxSizeBytes = 200 * 1024; // Limite máximo de tamanho do arquivo calibrado em 200KB para fidelidade técnica

        // Função recursiva para checar o tamanho do Blob gerado e ajustar a qualidade se necessário
        const checkSizeAndResolve = (q) => {
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error("Erro ao comprimir imagem."));
              return;
            }
            // Se o tamanho estiver abaixo do limite (200KB) ou a qualidade chegar ao limite mínimo (10%)
            if (blob.size <= maxSizeBytes || q <= 0.1) {
              resolve(blob); // Retorna o Blob final otimizado
            } else {
              // Decrementa a qualidade de compressão em 10% e tenta novamente de forma recursiva
              checkSizeAndResolve(q - 0.1);
            }
          }, 'image/webp', q);
        };

        // Iniciamos a verificação recursiva da qualidade
        checkSizeAndResolve(quality);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

/**
 * EXCLUSÃO DE ARQUIVO DO SUPABASE STORAGE
 * Remove fisicamente uma mídia armazenada no Supabase Storage a partir de sua URL pública.
 * Higieniza parâmetros de URL e decodifica caracteres especiais.
 * 
 * @param {string} url - URL pública completa do arquivo armazenado.
 * @param {string} bucketName - O nome do bucket no Supabase (ex: 'project-images').
 */
export const deleteFileFromStorage = async (url, bucketName) => {
  if (!url || !supabase) return; // Se não houver URL ou supabase não estiver configurado, ignora
  try {
    console.log(`[STORAGE_DEBUG] Tentando apagar do bucket ${bucketName} a URL:`, url);
    // Divide a URL usando o nome do bucket como delimitador para extrair o caminho interno do arquivo
    const urlParts = url.split(`/${bucketName}/`);
    if (urlParts.length > 1) {
      // Remove parâmetros de busca (?v=...) e âncoras (#...) antes de decodificar o nome real do arquivo
      const cleanPath = urlParts[1].split('?')[0].split('#')[0];
      const fileName = decodeURIComponent(cleanPath);
      console.log(`[STORAGE_DEBUG] Bucket: ${bucketName} | Arquivo a remover:`, fileName);

      // Executa a chamada do SDK do Supabase para remover o arquivo físico do bucket
      const { data, error } = await supabase.storage.from(bucketName).remove([fileName]);
      if (error) {
        console.error(`[STORAGE_DEBUG] Erro retornado pelo Supabase na remoção:`, error);
      } else {
        console.log(`[STORAGE_DEBUG] Sucesso na remoção física do arquivo:`, data);
      }
    } else {
      console.warn(`[STORAGE_DEBUG] URL não pertence ao bucket ou é externa: ${bucketName}`);
    }
  } catch (e) {
    console.error("[STORAGE_DEBUG] Exceção capturada na função deleteFileFromStorage:", e);
  }
};

/**
 * EXCLUSÃO EM LOTE DE ARQUIVOS DO SUPABASE STORAGE
 * Remove múltiplos arquivos em uma única requisição atômica ao Supabase,
 * evitando arquivos órfãos durante exclusão de projetos, cancelamentos de formulário ou trocas de galeria.
 * 
 * @param {string[]} urls - Lista de URLs públicas a serem excluídas.
 * @param {string} bucketName - O nome do bucket no Supabase (ex: 'project-images').
 */
export const deleteFilesFromStorage = async (urls, bucketName) => {
  if (!Array.isArray(urls) || urls.length === 0 || !supabase) return;
  try {
    // Filtra e normaliza os nomes reais dos arquivos presentes no bucket informado
    const fileNames = urls
      .filter(url => typeof url === 'string' && url.includes(`/${bucketName}/`))
      .map(url => {
        const parts = url.split(`/${bucketName}/`);
        const clean = parts[1].split('?')[0].split('#')[0];
        return decodeURIComponent(clean);
      })
      .filter(Boolean);

    // Remove duplicatas para evitar chamadas redundantes de exclusão
    const uniqueFileNames = Array.from(new Set(fileNames));

    if (uniqueFileNames.length > 0) {
      console.log(`[STORAGE_DEBUG] Removendo lote de ${uniqueFileNames.length} arquivo(s) exclusivo(s) do bucket ${bucketName}:`, uniqueFileNames);
      const { data, error } = await supabase.storage.from(bucketName).remove(uniqueFileNames);
      if (error) {
        console.error('[STORAGE_DEBUG] Erro ao remover lote de arquivos:', error);
      } else {
        console.log('[STORAGE_DEBUG] Lote de arquivos removido com sucesso:', data);
      }
    }
  } catch (e) {
    console.error('[STORAGE_DEBUG] Exceção na função deleteFilesFromStorage:', e);
  }
};
