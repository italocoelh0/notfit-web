
// pages/ConsultancyPage.tsx
import React, { useState, useMemo } from 'react';
import { UserData, Professional, DashboardSection } from '../types';
import ProfessionalCard from '../components/ProfessionalCard';
import MyConsultancyDashboard from '../components/MyConsultancyDashboard';
import ProfessionalPortfolioPage from '../components/ProfessionalPortfolioPage';
import { AnimatePresence, motion } from 'framer-motion';

interface ConsultancyPageProps {
  userData: UserData;
  professionals: Professional[];
  onUpdateUserData: (updates: Partial<UserData>) => Promise<boolean>;
  onSendNotification: (message: string) => void;
  setActiveSection: (section: DashboardSection) => void;
}

const ConsultancyPage: React.FC<ConsultancyPageProps> = ({
  userData,
  professionals,
  onUpdateUserData,
  onSendNotification,
  setActiveSection,
}) => {
  const [viewingProfessional, setViewingProfessional] = useState<Professional | null>(null);
  const [filter, setFilter] = useState<'todos' | 'Nutricionista' | 'Personal Trainer'>('todos');

  const handleHire = async (professional: Professional) => {
    if (userData.flameBalance < professional.monthlyPrice) {
      onSendNotification('Flames insuficientes para contratar este profissional.');
      return;
    }
    const success = await onUpdateUserData({
      flameBalance: userData.flameBalance - professional.monthlyPrice,
      consultancy: {
        professionalId: professional.id,
        startDate: new Date().toISOString(),
        status: 'pending',
      },
    });
    if (success) {
      onSendNotification(`Parabéns! Você contratou ${professional.name}.`);
      setViewingProfessional(null); // Fecha a página de portfólio
    }
  };

  const handleCancelSubscription = async () => {
    const success = await onUpdateUserData({
        consultancy: undefined,
        routine: undefined, // Limpa a rotina ao cancelar
    });
    if (success) {
        onSendNotification('Sua assinatura foi cancelada.');
    }
  };

  const subscribedProfessional = userData.consultancy
    ? professionals.find(p => p.id === userData.consultancy?.professionalId)
    : undefined;

  const isPending = userData.consultancy?.status === 'pending';

  const filteredProfessionals = useMemo(() => {
      if (filter === 'todos') return professionals;
      return professionals.filter(p => p.specialty === filter);
  }, [filter, professionals]);

  const FilterButton: React.FC<{label: string, value: typeof filter}> = ({label, value}) => (
      <button 
        onClick={() => setFilter(value)}
        className={`px-6 py-2 rounded-full font-anton uppercase tracking-widest text-xs transition-all duration-300 border ${
            filter === value 
            ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(252,82,0,0.4)]' 
            : 'bg-black/40 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
        }`}
      >
        {label}
      </button>
  );

  if (subscribedProfessional) {
    if (isPending) {
        return (
            <div className="fixed inset-0 z-[50] w-full h-full bg-black flex flex-col items-center justify-center p-6 overflow-hidden">
                 {/* Background FX */}
                 <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-yellow-500/10 rounded-full filter blur-[150px] opacity-30"></div>

                 <div className="relative z-10 w-full max-w-sm text-center">
                    <div className="w-24 h-24 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-lg shadow-yellow-900/20">
                        <i className="fa-solid fa-hourglass-half text-4xl text-yellow-500 animate-pulse"></i>
                    </div>
                    
                    <h2 className="font-anton uppercase text-2xl text-white tracking-widest mb-2">Solicitação em Análise</h2>
                    <p className="text-sm text-gray-400 leading-relaxed mb-8">
                        Você contratou <span className="text-white font-bold">{subscribedProfessional.name}</span>. 
                        Aguarde enquanto o profissional aceita sua solicitação e prepara seu plano personalizado.
                    </p>

                    <div className="p-4 bg-surface-100 rounded-xl border border-white/5 inline-block w-full mb-8">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-2">STATUS ATUAL</p>
                        <p className="text-yellow-500 font-bold flex items-center justify-center gap-2 text-sm uppercase tracking-wide">
                            <span className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></span>
                            Pendente de Aprovação
                        </p>
                    </div>

                    <button 
                        onClick={handleCancelSubscription} 
                        className="text-red-500 text-xs font-bold uppercase tracking-widest hover:text-red-400 transition-colors border border-red-500/30 px-6 py-3 rounded-lg hover:bg-red-500/10"
                    >
                        Cancelar Solicitação
                    </button>
                 </div>
            </div>
        );
    }

    return (
      <MyConsultancyDashboard
        professional={subscribedProfessional}
        onCancelSubscription={handleCancelSubscription}
      />
    );
  }

  return (
    <div className="pb-32">
       <AnimatePresence mode="wait">
        {viewingProfessional ? (
          <ProfessionalPortfolioPage
            key={viewingProfessional.id}
            professional={viewingProfessional}
            userData={userData}
            onHire={handleHire}
            onBack={() => setViewingProfessional(null)}
          />
        ) : (
          <div key="list">
             {/* Header de navegação interno */}
            <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-md -mx-4 px-4 py-3 flex items-center gap-3 border-b border-white/10 mb-4">
                <button onClick={() => setActiveSection('rotina')} className="w-8 h-8 flex items-center justify-center bg-surface-100 rounded-full text-white hover:bg-primary hover:text-white transition-colors">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <span className="font-anton uppercase tracking-wider text-lg">Consultoria Profissional</span>
            </div>

            {/* Header Filters */}
            <div className="sticky top-[calc(4rem+52px)] z-20 py-4 bg-background/80 backdrop-blur-md mb-6 -mx-4 px-4 flex justify-center gap-3 border-b border-white/5 overflow-x-auto hide-scrollbar">
                <FilterButton label="Todos" value="todos" />
                <FilterButton label="Personal Trainers" value="Personal Trainer" />
                <FilterButton label="Nutricionistas" value="Nutricionista" />
            </div>

            <motion.div layout className="space-y-4">
                <AnimatePresence>
                  {filteredProfessionals.map(prof => (
                    <ProfessionalCard
                      key={prof.id}
                      professional={prof}
                      onSelect={() => setViewingProfessional(prof)}
                    />
                  ))}
                </AnimatePresence>
            </motion.div>

            {filteredProfessionals.length === 0 && (
                <div className="text-center py-20 opacity-50">
                    <p className="font-anton uppercase text-xl text-gray-500 tracking-wide">Nenhum profissional encontrado</p>
                </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConsultancyPage;
