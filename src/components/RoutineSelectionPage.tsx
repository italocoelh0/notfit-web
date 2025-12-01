
// components/RoutineSelectionPage.tsx

import React from 'react';
import { UITexts, DashboardSection } from '../types';
import { motion } from 'framer-motion';

interface RoutineSelectionPageProps {
  setActiveSection: (section: DashboardSection) => void;
  onSelectMyRoutine: () => void;
  isEditMode: boolean;
  uiTexts: UITexts;
  onUpdateUiText: (page: keyof UITexts, key: string, value: string) => void;
  isAdmin?: boolean; // Added prop
}

const HubCard: React.FC<{
  onClick: () => void;
  icon: string;
  title: string;
  subtitle: string;
  highlight?: boolean;
  bgImage?: string;
  admin?: boolean;
}> = ({ onClick, icon, title, subtitle, highlight, bgImage, admin }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`relative w-full p-6 rounded-2xl border cursor-pointer overflow-hidden group transition-all duration-300 flex items-center gap-5
      ${admin 
        ? 'bg-gradient-to-r from-gray-900 to-black border-white/20' 
        : highlight 
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

    <div className={`relative z-10 w-16 h-16 rounded-full border flex items-center justify-center shrink-0 shadow-lg ${admin ? 'bg-white/10 border-white/20 text-white' : 'bg-gradient-to-br from-surface-200 to-black border-white/10'}`}>
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

const RoutineSelectionPage: React.FC<RoutineSelectionPageProps> = ({
  setActiveSection,
  onSelectMyRoutine,
  isAdmin
}) => {
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

       {/* Background decorative elements - Consistent with SubscriptionPage */}
       <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full filter blur-[150px] opacity-30 animate-pulse"></div>
       <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full filter blur-[150px] opacity-30 animate-pulse delay-1000"></div>

       <div className="relative z-10 w-full max-w-md flex flex-col h-full justify-center mt-8 overflow-y-auto custom-scrollbar">
            
            {/* Header */}
            <div className="text-center mb-10 flex-shrink-0">
                <h1 className="font-anton uppercase text-4xl text-white tracking-widest drop-shadow-lg">
                    Área do <span className="text-primary">Aluno</span>
                </h1>
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] mt-2">
                    Acesse o planejamento do seu treinador
                </p>
            </div>

            {/* Cards Grid */}
            <div className="space-y-4 w-full px-2 pb-10">
                {/* MEU TREINO - Destaque (Leva para a rotina ativa) */}
                <HubCard 
                    onClick={onSelectMyRoutine}
                    icon="🏋️"
                    title="PLANO DE TREINO"
                    subtitle="Visualizar treino do dia"
                    highlight={true}
                    bgImage="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop"
                />

                {/* MINHA DIETA (Leva para alimentação/receitas) */}
                <HubCard 
                    onClick={() => setActiveSection('alimentacao')}
                    icon="🥗"
                    title="PLANO ALIMENTAR"
                    subtitle="Ver dieta prescrita"
                    bgImage="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1453&auto=format&fit=crop"
                />

                {/* GERENCIADOR (ADMIN ONLY) */}
                {(isAdmin || true) && ( // Keeping true for demo, remove later
                    <HubCard 
                        onClick={() => setActiveSection('content_manager' as any)} // Using existing prop mechanism, see RoutinePage update
                        icon="⚙️"
                        title="Gerenciador"
                        subtitle="Editar exercícios e vídeos"
                        admin={true}
                    />
                )}
            </div>
       </div>
    </div>
  );
};

export default RoutineSelectionPage;
