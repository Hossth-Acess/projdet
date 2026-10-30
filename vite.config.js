import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Configuração do Vite para o projeto PROJDET
 * Utiliza o plugin oficial do React para compilação otimizada de JSX
 */
export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    open: false
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react', '@supabase/supabase-js']
  },
  build: {
    target: 'esnext',
    minify: 'esbuild', // Minificação ultraveloz nativa
    cssCodeSplit: true, // Divide o CSS para carregamento assíncrono em paralelo
    rollupOptions: {
      output: {
        // Separa bibliotecas grandes em chunks cacheados no navegador
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-icons': ['lucide-react']
        }
      }
    }
  }
});
