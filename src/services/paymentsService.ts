// services/paymentsService.ts

import { PAYMENTS_API_BASE_URL } from '../config';

export interface FlamePackage {
  id: number;
  amount: number;
  price: number;
  label: string;
  popular: boolean;
}

export interface CheckoutSessionResponse {
  url: string;
  sessionId: string;
}

export interface PaymentConfig {
  publishableKey: string;
  currency: string;
}

/**
 * Obtém a configuração do Stripe (chave pública)
 */
export async function getStripeConfig(): Promise<PaymentConfig> {
  const response = await fetch(`${PAYMENTS_API_BASE_URL}/payments/config`);
  if (!response.ok) {
    throw new Error('Falha ao obter configuração do Stripe');
  }
  return response.json();
}

/**
 * Cria uma sessão de checkout do Stripe para compra de Flames
 */
export async function createCheckoutSession(
  userId: string,
  flamePackage: FlamePackage,
  userEmail: string
): Promise<CheckoutSessionResponse> {
  console.log('🔥 createCheckoutSession iniciado');
  console.log('🔥 PAYMENTS_API_BASE_URL:', PAYMENTS_API_BASE_URL);
  console.log('🔥 Dados recebidos:', { userId, flamePackage, userEmail });
  
  const requestBody = {
    lineItems: [
      {
        price_data: {
          currency: 'brl',
          product_data: {
            name: `${flamePackage.amount} Flames - ${flamePackage.label}`,
            description: `Pacote de ${flamePackage.amount} Flames para o NowFit`,
            images: ['https://i.imgur.com/your-flame-image.png'], // Substitua pela URL da sua imagem
          },
          unit_amount: Math.round(flamePackage.price * 100), // Converte para centavos
        },
        quantity: 1,
      },
    ],
    successUrl: 'https://notfit-web.vercel.app?payment=success',
    cancelUrl: 'https://notfit-web.vercel.app?payment=cancelled',
    metadata: {
      userId: userId,
      flameAmount: flamePackage.amount.toString(),
      packageId: flamePackage.id.toString(),
      type: 'flame_purchase',
    },
  };
  
  console.log('🔥 Request body:', requestBody);
  
  const response = await fetch(`${PAYMENTS_API_BASE_URL}/payments/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log('🔥 Response status:', response.status);
  console.log('🔥 Response ok:', response.ok);

  if (!response.ok) {
    const error = await response.json();
    console.error('🔥 Erro da API:', error);
    throw new Error(error.message || 'Falha ao criar sessão de checkout');
  }

  const result = await response.json();
  console.log('🔥 Response data:', result);
  return result;
}

/**
 * Cria ou obtém um customer do Stripe
 */
export async function createOrGetCustomer(email: string, name: string): Promise<any> {
  const response = await fetch(`${PAYMENTS_API_BASE_URL}/payments/create-customer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, name }),
  });

  if (!response.ok) {
    throw new Error('Falha ao criar customer');
  }

  return response.json();
}

/**
 * Obtém informações de um customer do Stripe
 */
export async function getCustomer(email?: string, id?: string): Promise<any> {
  const params = new URLSearchParams();
  if (email) params.append('email', email);
  if (id) params.append('id', id);

  const response = await fetch(`${PAYMENTS_API_BASE_URL}/payments/customer?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Falha ao buscar customer');
  }

  return response.json();
}
