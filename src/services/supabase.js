import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase para a plataforma PROJDET
 * Utiliza variáveis de ambiente seguras com fallback graceful caso ainda não configuradas.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validação preventiva para ambiente de desenvolvimento
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('SEU_PROJETO')
);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
