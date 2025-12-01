
import React, { useState } from 'react';
import { UserData, UITexts, DashboardSection, Recipe, Exercise } from '../types';
import ActiveRoutinePage from './ActiveRoutinePage';
import { motion } from 'framer-motion';

interface StudentCustomRoutinePageProps {
  userData: UserData;
  onUpdateUserData: (updates: Partial<UserData>) => Promise<boolean>;
  isEditMode: boolean;
  uiTexts: UITexts;
  onUpdateUiText: (page: keyof UITexts, key: string, value: string) => void;
  setActiveSection: (section: DashboardSection) => void;
  recipes: Recipe[];
  exercises: Exercise[];
  onSendNotification: (message: string) => void;
  // Props for AlimentacaoPage
  onUpdateRecipe: (recipe: Recipe) => void;
  onAddRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  onDeleteRecipe: (recipeId: number) => void;
}

// Waiting State Component - Standardized to "EM ANÁLISE" layout
const WaitingForProfessional: React.FC<{ onBack: () => void; type: 'workout' | 'diet' }> = ({ onBack, type }) => {
    const message = type === 'diet' 
        ? 'Seu nutricionista ainda está preparando seu plano alimentar. Assim que ele publicar, o conteúdo aparecerá automaticamente aqui.'
        : 'Seu treinador ainda está preparando seu plano de treino. Assim que ele publicar, o conteúdo aparecerá automaticamente aqui.';

    return (
        <div className="fixed inset-0 z-[50] w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden p-6">
             {/* Back Header */}
             <div className="absolute top-0 left-0 w-full z-[60] px-4 py-4 flex items-center gap-3 bg-gradient-to-b from-black/90 to-transparent pt-6">
                <button 
                    onClick={onBack} 
                    className="w-10 h-10 flex items-center justify-center bg-surface-200 rounded-full text-white hover:bg-primary hover:text-white transition-colors border border-white/10"
                >
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <span className="font-anton uppercase tracking-wider text-lg text-white">Voltar</span>
             </div>

             <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-yellow-500/10 rounded-full filter blur-[150px] opacity-30"></div>
            
             <div className="relative z-10 w-full max-w-sm text-center">
                <div className="w-24 h-24 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                    <i className="fa-solid fa-hourglass-half text-4xl text-yellow-500 animate-pulse"></i>
                </div>
                
                <h2 className="font-anton uppercase text-3xl text-white tracking-widest mb-4">EM ANÁLISE</h2>
                <p className="text-sm text-gray-400 leading-relaxed mb-8">
                    {message}
                </p>

                <div className="p-4 bg-surface-100 rounded-xl border border-white/10 inline-block w-full">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-2">STATUS</p>
                    <p className="text-yellow-500 font-bold flex items-center justify-center gap-2 text-sm uppercase tracking-wide">
                        <span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></span>
                        Pendente de Publicação
                    </p>
                </div>
             </div>
        </div>
    );
};

const HubCard: React.FC<{
  onClick: () => void;
  icon: string;
  title: string;
  subtitle: string;
  highlight?: boolean;
  bgImage?: string;
}> = ({ onClick, icon, title, subtitle, highlight, bgImage }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative w-full p-6 rounded-2xl border cursor-pointer overflow-hidden group transition-all duration-300 flex items-center gap-5
      ${highlight 
        ? 'bg-white/10 border-primary/50 shadow-[0_0_20px_rgba(252,82,0,0.15)]' 
        : 'bg-black/40 border-white/10 hover:bg-white/5'
      }`}
  >
     {/* Optional Background Image for flair */}
     {bgImage && (
        <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
            <img src={bgImage} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
            <div className="absolute inset-0 bg-black/60"></div>
        </div>
     )}

     {/* Glow Effect */}
     {highlight && (
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-primary/30 rounded-full blur-[50px]"></div>
     )}

    <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-surface-200 to-black border border-white/10 flex items-center justify-center shrink-0 shadow-lg">
        <span className="text-3xl">{icon}</span>
    </div>

    <div className="relative z-10 flex-1">
        <h3 className={`font-anton uppercase text-2xl tracking-wide ${highlight ? 'text-white' : 'text-gray-200'}`}>
            {title}
        </h3>
        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mt-1">
            {subtitle}
        </p>
    </div>

    <div className="relative z-10 text-white/20 group-hover:text-primary transition-colors">
        <i className="fa-solid fa-chevron-right text-xl"></i>
    </div>
  </motion.div>
);

const StudentCustomRoutinePage: React.FC<StudentCustomRoutinePageProps> = ({
  userData,
  setActiveSection
}) => {
  const [view, setView] = useState<'hub' | 'training' | 'diet'>('hub');

  // 1. Training View
  if (view === 'training') {
      if (!userData.routine) {
          return <WaitingForProfessional onBack={() => setView('hub')} type="workout" />;
      }
      
      return (
        <div className="pb-24">
            <div className="sticky top-0 bg-background/90 backdrop-blur-md z-20 px-4 py-3 flex items-center gap-3 border-b border-white/10 mb-4">
                <button onClick={() => setView('hub')} className="w-8 h-8 flex items-center justify-center bg-surface-100 rounded-full text-white hover:bg-primary hover:text-white transition-colors">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <div className="flex-1">
                    <span className="font-anton uppercase tracking-wider text-lg block leading-none">Meu Treino</span>
                    <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Consultoria Ativa</span>
                </div>
            </div>
            {/* onReset is NOT passed here, so the student cannot reset the plan */}
            <ActiveRoutinePage routine={userData.routine} viewType="workout" />
        </div>
      );
  }

  // 2. Diet View
  if (view === 'diet') {
      if (!userData.routine) {
          return <WaitingForProfessional onBack={() => setView('hub')} type="diet" />;
      }

      return (
        <div className="pb-24">
            <div className="sticky top-0 bg-background/90 backdrop-blur-md z-20 px-4 py-3 flex items-center gap-3 border-b border-white/10 mb-4">
                <button onClick={() => setView('hub')} className="w-8 h-8 flex items-center justify-center bg-surface-100 rounded-full text-white hover:bg-primary hover:text-white transition-colors">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <div className="flex-1">
                    <span className="font-anton uppercase tracking-wider text-lg block leading-none">Minha Dieta</span>
                    <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Consultoria Ativa</span>
                </div>
            </div>
            {/* onReset is NOT passed here, so the student cannot reset the plan */}
            <ActiveRoutinePage routine={userData.routine} viewType="diet" />
        </div>
      );
  }

  // 3. Hub View (Default)
  return (
    <div className="fixed inset-0 z-[50] w-full h-full bg-black flex flex-col items-center justify-center overflow-hidden pb-20 pt-16 px-4">
       {/* Back Header */}
       <div className="absolute top-0 left-0 w-full z-[60] px-4 py-4 flex items-center gap-3 bg-gradient-to-b from-black/90 to-transparent pt-6">
            <button 
                onClick={() => setActiveSection('feed')} 
                className="w-10 h-10 flex items-center justify-center bg-surface-200 rounded-full text-white hover:bg-primary hover:text-white transition-colors border border-white/10"
            >
                <i className="fa-solid fa-arrow-left"></i>
            </button>
            <span className="font-anton uppercase tracking-wider text-lg text-white">Voltar</span>
       </div>

       {/* Background decorative elements */}
       <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full filter blur-[150px] opacity-30 animate-pulse"></div>
       <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full filter blur-[150px] opacity-30 animate-pulse delay-1000"></div>

       <div className="relative z-10 w-full max-w-md flex flex-col h-full justify-center mt-8">
            
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="font-anton uppercase text-3xl text-white tracking-widest drop-shadow-lg leading-tight">
                    Minha Rotina <br/><span className="text-primary">Personalizada</span>
                </h1>
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] mt-2">
                    Exclusivo para alunos
                </p>
            </div>

            {/* Cards Grid */}
            <div className="space-y-6 w-full">
                <HubCard 
                    onClick={() => setView('training')}
                    icon="🏋️"
                    title="PLANO DE TREINO"
                    subtitle="Visualizar treino do dia"
                    highlight={true}
                    bgImage="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop"
                />

                <HubCard 
                    onClick={() => setView('diet')}
                    icon="🥗"
                    title="PLANO ALIMENTAR"
                    subtitle="Ver dieta prescrita"
                    bgImage="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1453&auto=format&fit=crop"
                />
            </div>
       </div>
    </div>
  );
};

export default StudentCustomRoutinePage;
