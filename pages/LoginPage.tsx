
import React, { useState } from 'react';
import { UITexts } from '../types';
import EditableField from '../components/EditableField';
import { Logo } from '../components/Logo';
import { motion } from 'framer-motion';

interface LoginPageProps {
  onLogin: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  onNavigateToRegister: () => void;
  onNavigateToForgotPassword: () => void;
  isEditMode: boolean;
  uiTexts: UITexts;
  onUpdateUiText: (page: 'login', key: string, value: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigateToRegister, onNavigateToForgotPassword, isEditMode, uiTexts, onUpdateUiText }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onLogin(email, password, rememberMe);
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
  
  const inputStyles = "w-full px-5 py-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-white/30 focus:border-primary/50 focus:bg-black/60 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all text-sm shadow-inner";
  
  const texts = uiTexts.login;

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-4 relative overflow-hidden">
       {/* Video Background com Overlay Gradiente */}
       <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black z-10"></div>
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-60"
          >
            <source src="https://ckdkpjzswtjhdowapmzu.supabase.co/storage/v1/object/public/logo/video.mp4" type="video/mp4" />
          </video>
       </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-sm w-full p-6 relative z-20 flex flex-col items-center"
      >
        <div className="text-center mb-10 w-full">
            <div className="flex justify-center mb-4">
              <Logo
                src="https://ckdkpjzswtjhdowapmzu.supabase.co/storage/v1/object/public/logo/582255859_3086579074848471_4873069475124875843_n.png"
                className="h-24 w-auto drop-shadow-2xl"
                animated={true}
              />
            </div>
            <div>
               <h1 className="font-anton text-4xl text-white uppercase tracking-widest drop-shadow-lg mb-2">NowFit</h1>
               <EditableField 
                  as="p" 
                  isEditing={isEditMode} 
                  value={texts.subtitle} 
                  onChange={v => onUpdateUiText('login', 'subtitle', v)} 
                  className="text-xs font-medium text-gray-300 tracking-[0.2em] uppercase opacity-80" 
               />
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          {error && (
            <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-red-300 text-xs text-center bg-red-500/10 border border-red-500/20 p-3 rounded-xl backdrop-blur-md"
            >
                <i className="fa-solid fa-circle-exclamation mr-2"></i>
                {error}
            </motion.div>
          )}
          
          <div className="space-y-4">
            <div className="relative group">
                <i className="fa-regular fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors"></i>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                  placeholder={texts.emailLabel}
                  className={`${inputStyles} pl-12`}
                  disabled={loading}
                />
            </div>
            <div className="relative group">
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-primary transition-colors"></i>
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder={texts.passwordLabel}
                  className={`${inputStyles} pl-12 pr-12`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 rounded border border-white/30 bg-white/5 transition-all group-hover:border-white/50">
                      <input 
                          type="checkbox" 
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="peer appearance-none absolute inset-0 w-full h-full cursor-pointer"
                      />
                      {rememberMe && <i className="fa-solid fa-check text-primary text-[10px]"></i>}
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-white transition-colors">Lembrar de mim</span>
              </label>

              <button 
                  type="button" 
                  onClick={onNavigateToForgotPassword} 
                  className="text-xs text-gray-400 hover:text-primary transition-colors"
              >
                  Esqueceu a senha?
              </button>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 font-anton tracking-widest uppercase" 
            disabled={loading}
          >
            {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <EditableField as="span" isEditing={isEditMode} value={texts.loginButton} onChange={v => onUpdateUiText('login', 'loginButton', v)} />}
          </motion.button>
        </form>
        
        <div className="text-center mt-12">
            <p className="text-gray-400 text-xs mb-2">Novo por aqui?</p>
            <button onClick={onNavigateToRegister} className="text-white font-bold text-sm uppercase tracking-widest border-b border-white/20 pb-1 hover:border-primary hover:text-primary transition-all">
                <EditableField as="span" isEditing={isEditMode} value={texts.registerLink} onChange={v => onUpdateUiText('login', 'registerLink', v)} />
            </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
