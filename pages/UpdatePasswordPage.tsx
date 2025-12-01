
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface UpdatePasswordPageProps {
  onUpdatePassword: (password: string) => Promise<void>;
}

const UpdatePasswordPage: React.FC<UpdatePasswordPageProps> = ({ onUpdatePassword }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
        setError("A senha deve ter no mínimo 6 caracteres.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      await onUpdatePassword(password);
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao atualizar a senha.");
    } finally {
      setLoading(false);
    }
  };
  
  const inputStyles = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all backdrop-blur-sm";

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-4 relative overflow-hidden">
       {/* Background decorative elements */}
       <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full filter blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-[120px] animate-pulse [animation-delay:2000ms]"></div>
       </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-sm w-full bg-gray-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-flames rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_20px_theme(colors.primary/30%)]">
             <i className="fa-solid fa-key text-3xl text-white"></i>
          </div>
          <h1 className="text-2xl font-anton uppercase tracking-wide text-white mb-2">Nova Senha</h1>
          <p className="text-gray-400 text-sm">Crie uma nova senha segura para sua conta.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="Nova senha"
              className={inputStyles}
              disabled={loading}
            />
          </div>
           <div>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required 
              placeholder="Confirme a nova senha"
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
            {loading ? 'Atualizando...' : 'Atualizar Senha'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default UpdatePasswordPage;
