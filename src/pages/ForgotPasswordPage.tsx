
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ForgotPasswordPageProps {
  onForgotPassword: (email: string) => Promise<void>;
  onNavigateToLogin: () => void;
}

const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onForgotPassword, onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onForgotPassword(email);
      // A notificação de sucesso é mostrada pelo App.tsx
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro.");
    } finally {
      setLoading(false);
    }
  };
  
  const inputStyles = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all backdrop-blur-sm";

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full filter blur-[120px] animate-pulse"></div>
          <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/10 rounded-full filter blur-[100px] animate-pulse [animation-delay:3000ms]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-sm w-full bg-gray-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-flames rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_20px_theme(colors.primary/30%)]">
             <i className="fa-solid fa-lock-open text-3xl text-white"></i>
          </div>
          <h1 className="text-2xl font-anton uppercase tracking-wide text-white mb-2">Recuperar Acesso</h1>
          <p className="text-gray-400 text-sm">Digite seu e-mail para receber o link de recuperação.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
             <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-200 text-sm text-center bg-red-500/20 border border-red-500/30 p-3 rounded-lg backdrop-blur-md"
            >
                {error}
            </motion.div>
          )}
          <div>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="Seu e-mail cadastrado"
              className={inputStyles}
              disabled={loading}
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-flames text-white font-bold py-3.5 rounded-xl text-base shadow-[0_0_20px_theme(colors.primary/30%)] hover:shadow-[0_0_30px_theme(colors.primary/50%)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar Link'}
          </motion.button>
        </form>
         <div className="text-center mt-6">
            <button onClick={onNavigateToLogin} className="text-sm font-semibold text-white/60 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto">
                <i className="fa-solid fa-arrow-left"></i> Voltar para o Login
            </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
