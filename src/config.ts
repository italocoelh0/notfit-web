
// config.ts

// Configuração da API de Pagamentos (Stripe)
// Apenas endpoints de pagamento usam esta API
export const PAYMENTS_API_BASE_URL = 'https://nowfit-api.vercel.app/api'; // Produção: https://nowfit-api.vercel.app/api

// Supabase - usado para tudo exceto pagamentos
export const SUPABASE_URL = 'https://ckdkpjzswtjhdowapmzu.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_o4fyurDDvdElfGvtIipX0w_S0e9FwcI';

/**
 * A chave da API do Google Maps.
 */
export const GOOGLE_MAPS_API_KEY = 'AIzaSyA_5ypKM3xxMWYdOebN2Ge2fQw8fncG65g';
