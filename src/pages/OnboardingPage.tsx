
import React, { useState, useEffect } from 'react';
import { OnboardingData, UITexts } from '../types';
import { motion } from 'framer-motion';
import { api } from '../services/api';

interface OnboardingPageProps {
  onOnboardingSuccess: (data: OnboardingData) => Promise<void>;
  isEditMode: boolean;
  uiTexts: UITexts;
  onUpdateUiText: (page: 'onboarding', key: string, value: string) => void;
  supabase?: any; // Optional prop for backward compatibility
}

const OnboardingPage: React.FC<OnboardingPageProps> = ({ onOnboardingSuccess }) => {
  const [username, setUsername] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) {
        setUsernameError(null);
        return;
    }

    if (trimmedUsername.length < 3) {
      setUsernameError('Mínimo 3 caracteres');
      return;
    }

    setIsCheckingUsername(true);
    const handler = setTimeout(async () => {
      try {
        const exists = await api.users.checkUsername(trimmedUsername);
        if (exists) {
          setUsernameError('Usuário indisponível');
        } else {
          setUsernameError(null);
        }
      } catch (err: any) {
         console.error("Error checking username:", err);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [username]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, '');
    setUsername(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username && !usernameError && !isCheckingUsername && !isSubmitting) {
      setIsSubmitting(true);
      try {
          await onOnboardingSuccess({ 
              username, 
              goals: ['setup_complete'],
              age: 0,
              weight: 0,
              height: 0
          });
      } catch (error) {
          console.error("Erro no onboarding:", error);
          setIsSubmitting(false);
      }
    }
  };

  const isButtonDisabled = !username || !!usernameError || isCheckingUsername || isSubmitting;

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-4 relative overflow-hidden">
        {/* Video Background */}
       <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover"
          >
            <source src="https://lfavjyhkiouvbdajdgop.supabase.co/storage/v1/object/public/public-assets/video%20login.mp4" type="video/mp4" />
          </video>
       </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full relative z-20 flex flex-col items-center"
      >
        <div className="text-center mb-12">
            <h1 className="font-anton text-4xl text-white mb-3 tracking-wide uppercase shadow-black drop-shadow-md">Sua Identidade</h1>
            <p className="text-gray-300 text-sm drop-shadow-md">Como você será conhecido no universo NowFit?</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-12 relative group px-4">
            
            <div className="relative flex items-center">
              <span className="absolute left-4 font-bold text-3xl text-white pb-1 pointer-events-none select-none z-10">@</span>
              
              <input 
                  type="text" 
                  value={username}
                  onChange={handleUsernameChange}
                  required 
                  placeholder="usuario"
                  className="w-full bg-black/60 border-b-2 border-white/30 text-left pl-12 pr-10 text-3xl font-bold text-white py-4 focus:border-primary focus:outline-none transition-all placeholder-gray-500 rounded-t-xl"
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                  disabled={isSubmitting}
              />
              
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {isCheckingUsername ? (
                      <i className="fa-solid fa-circle-notch fa-spin text-primary text-xl"></i>
                  ) : usernameError ? (
                      <i className="fa-solid fa-circle-exclamation text-red-500 text-xl"></i>
                  ) : username.length > 2 ? (
                      <i className="fa-solid fa-check-circle text-green-400 text-xl drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]"></i>
                  ) : null}
              </div>
            </div>
            
            <div className="h-6 mt-4 text-center">
                {usernameError ? (
                    <span className="text-white bg-red-600/80 px-3 py-1 rounded-full text-xs font-bold shadow-lg">{usernameError}</span>
                ) : !usernameError && username.length > 2 && !isCheckingUsername ? (
                    <span className="text-white bg-green-600/80 px-3 py-1 rounded-full text-xs font-bold shadow-lg">Disponível para uso</span>
                ) : null}
            </div>
          </div>

          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-flames text-white font-bold py-4 rounded-xl text-lg shadow-[0_0_20px_theme(colors.primary/30%)] hover:shadow-[0_0_35px_theme(colors.primary/50%)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none font-anton uppercase tracking-widest" 
            disabled={isButtonDisabled}
          >
              {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> Iniciando...
                  </>
              ) : (
                  <>
                    Iniciar <i className="fa-solid fa-rocket ml-2"></i>
                  </>
              )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default OnboardingPage;
