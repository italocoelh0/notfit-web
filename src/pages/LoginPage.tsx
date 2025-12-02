
import React, { useState } from 'react';
import { UITexts } from '../types';
import EditableField from '../components/EditableField';
import { Logo } from '../components/Logo';
import { motion } from 'framer-motion';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
  isEditMode: boolean;
  uiTexts: UITexts;
  onUpdateUiText: (page: 'login', key: string, value: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToRegister, onNavigateToForgotPassword, isEditMode, uiTexts, onUpdateUiText }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onLogin(email, password);
    } catch (err: any) {
      let msg = err.message;
      if (msg === 'Invalid login credentials') {
          msg = "Usuário não registrado ou senha incorreta.";
      }
      setError(msg || "Ocorreu um erro no login.");
    } finally {
      setLoading(false);
    }
  };
  
  // --- DEV MODE BUTTON ---
  const handleDevLogin = async () => {
      setLoading(true);
      try {
          // E-mail do usuário fake configurado em services/api.ts
          await onLogin('dev@nowfit.com', 'anypass'); 
      } catch (err) {
          console.error(err);
          setError("Erro no login de desenvolvedor.");
      } finally {
          setLoading(false);
      }
  }
  
  // Aumentei o contraste do fundo do input para garantir legibilidade sobre o vídeo sem o card
  const inputStyles = "w-full px-4 py-3 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all backdrop-blur-md";
  
  const texts = uiTexts.login;

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-4 relative overflow-hidden">
       {/* Video Background */}
       <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 z-10"></div> {/* Overlay ajustado */}
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover"
          >
            <source src="https://imgur.com/cumtqQ0.mp4" type="video/mp4" />
            Seu navegador não suporta vídeos.
          </video>
       </div>
       
       {/* BOTÃO SECRETO DE DEV - RESTAURADO E VISIVEL */}
       <button 
           onClick={handleDevLogin}
           className="fixed top-4 right-4 z-50 bg-red-600/50 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase backdrop-blur-md transition-all border border-red-400 shadow-lg"
           title="Clique para entrar como desenvolvedor"
       >
           🔓 Dev Login
       </button>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-sm w-full p-4 relative z-20 flex flex-col items-center mb-10 -mt-20"
      >
        <div className="text-center mb-6 w-full">
            <div className="flex justify-center mb-0">
              <Logo
                src="https://imgur.com/6GhoZ4K.png"
                className="h-[20rem] w-auto drop-shadow-[0_0_25px_rgba(252,82,0,0.4)]"
                animated={true}
              />
            </div>
            <div className="-mt-16 relative z-10">
               <EditableField 
                  as="p" 
                  isEditing={isEditMode} 
                  value={texts.subtitle} 
                  onChange={v => onUpdateUiText('login', 'subtitle', v)} 
                  className="font-sans text-lg font-medium text-white/90 tracking-wide drop-shadow-md" 
               />
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 w-full">
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
              placeholder={texts.emailLabel}
              className={inputStyles}
              disabled={loading}
            />
          </div>
          <div>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder={texts.passwordLabel}
              className={inputStyles}
              disabled={loading}
            />
          </div>
          <div className="text-right -mt-2">
              <button 
                  type="button" 
                  onClick={onNavigateToForgotPassword} 
                  className="text-xs font-semibold text-white/80 hover:text-primary hover:underline transition-colors drop-shadow-md"
              >
                  Esqueci minha senha
              </button>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-flames text-white font-bold py-3.5 rounded-xl text-base shadow-[0_0_20px_theme(colors.primary/30%)] hover:shadow-[0_0_30px_theme(colors.primary/50%)] transition-all disabled:opacity-50 disabled:cursor-not-allowed !mt-6 font-anton tracking-wide uppercase" 
            disabled={loading}
          >
            {loading ? 'Entrando...' : <EditableField as="span" isEditing={isEditMode} value={texts.loginButton} onChange={v => onUpdateUiText('login', 'loginButton', v)} />}
          </motion.button>
        </form>
        
        <div className="text-center text-gray-300 text-sm mt-8 drop-shadow-md">
            <EditableField as="span" isEditing={isEditMode} value={texts.registerPrompt} onChange={v => onUpdateUiText('login', 'registerPrompt', v)} />
            {' '}
            <button onClick={onNavigateToRegister} className="font-bold text-primary hover:text-flames transition-colors hover:underline">
                <EditableField as="span" isEditing={isEditMode} value={texts.registerLink} onChange={v => onUpdateUiText('login', 'registerLink', v)} />
            </button>
        </div>
      </motion.div>

      {/* Social Media Footer */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex flex-col items-center gap-3">
          <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Siga-nos</p>
          <div className="flex justify-center gap-6">
            <a 
                href="https://instagram.com/nowfiton" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/40 hover:text-[#E1306C] transition-all duration-300 transform hover:scale-110"
                aria-label="Instagram"
            >
                <i className="fa-brands fa-instagram text-2xl"></i>
            </a>
            <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/40 hover:text-[#1877F2] transition-all duration-300 transform hover:scale-110"
                aria-label="Facebook"
            >
                <i className="fa-brands fa-facebook text-2xl"></i>
            </a>
            <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white/40 hover:text-[#FF0000] transition-all duration-300 transform hover:scale-110"
                aria-label="YouTube"
            >
                <i className="fa-brands fa-youtube text-2xl"></i>
            </a>
          </div>
      </div>
    </div>
  );
};

export default LoginPage;
