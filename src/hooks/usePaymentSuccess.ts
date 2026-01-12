// hooks/usePaymentSuccess.ts

import { useEffect } from 'react';

/**
 * Hook para detectar quando o usuário retorna após completar um pagamento no Stripe
 */
export function usePaymentSuccess(
  onSuccess: () => void,
  onCancelled: () => void
) {
  useEffect(() => {
    // Verifica os parâmetros da URL
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');

    if (paymentStatus === 'success') {
      onSuccess();
      // Remove o parâmetro da URL para não disparar novamente
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'cancelled') {
      onCancelled();
      // Remove o parâmetro da URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [onSuccess, onCancelled]);
}
