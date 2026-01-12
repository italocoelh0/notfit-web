import { createClient } from '@supabase/supabase-js';

// As chaves são injetadas pelo Vite via 'define' no vite.config.ts.
// Usamos as strings constantes como fallback para garantir que o app funcione mesmo sem .env local configurado.
const supabaseUrl = process.env.SUPABASE_URL || 'https://ckdkpjzswtjhdowapmzu.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_KEY || 'sb_publishable_o4fyurDDvdElfGvtIipX0w_S0e9FwcI';

if (!supabaseUrl || supabaseUrl === '') {
  console.error("Erro Crítico: SUPABASE_URL não definida.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
