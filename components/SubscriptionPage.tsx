
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface SubscriptionPageProps {
  onSkip: () => void;
}

const FeatureItem: React.FC<{ text: string; highlight?: boolean }> = ({ text, highlight }) => (
  <li className="flex items-center gap-2 text-xs text-gray-300/80">
    <i className={`fa-solid fa-check ${highlight ? 'text-purple-400' : 'text-primary'} text-[10px]`}></i>
    <span className={highlight ? 'text-white font-bold' : ''}>{text}</span>
  </li>
);

const SubscriptionPage: React.FC<SubscriptionPageProps> = ({ onSkip }) => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'ultimate'>('quarterly');

  const renderFeatures = () => {
    if (selectedPlan === 'ultimate') {
        return (
            <>
                <FeatureItem text="Personal Trainer Dedicado" highlight />
                <FeatureItem text="Nutricionista Exclusivo" highlight />
                <FeatureItem text="Coach IA Ilimitado" />
                <FeatureItem text="Receitas & Treinos Premium" />
                <FeatureItem text="Zero Anúncios" />
                <FeatureItem text="Acesso Total ao App" />
            </>
        );
    }
    return (
        <>
            <FeatureItem text="Coach IA Ilimitado" />
            <FeatureItem text="Treinos Exclusivos" />
            <FeatureItem text="Receitas Premium" />
            <FeatureItem text="Sem Anúncios" />
        </>
    );
  };

  return (
    <div className="fixed inset-0 z-[200] w-full h-full bg-black flex items-center justify-center overflow-hidden p-4">
        {/* Background decorative elements - Ultra Subtle */}
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full filter blur-[150px] opacity-40"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full filter blur-[150px] opacity-40"></div>
        
        {/* Glass Card */}
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10 w-full max-w-sm bg-black/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
            <div className="p-6 w-full flex flex-col h-full overflow-y-auto custom-scrollbar">
                
                {/* Header Minimalista */}
                <div className="text-center mb-6 flex-shrink-0">
                    <h1 className="font-anton uppercase text-3xl text-white tracking-widest drop-shadow-lg">
                        NowFit <span className="text-primary">Pro</span>
                    </h1>
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] mt-1">Evolução Sem Limites</p>
                </div>

                {/* Plan Selection Options */}
                <div className="space-y-3 mb-6 flex-shrink-0">
                    
                    {/* Ultimate Option */}
                    <div 
                        onClick={() => setSelectedPlan('ultimate')}
                        className={`relative p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                            selectedPlan === 'ultimate' 
                            ? 'bg-gradient-to-r from-purple-900/40 to-black/60 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.25)]' 
                            : 'bg-white/5 border-transparent hover:bg-white/10'
                        }`}
                    >
                        {selectedPlan === 'ultimate' && (
                            <div className="absolute -top-2 left-4 bg-purple-500 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wide shadow-sm flex items-center gap-1">
                                <i className="fa-solid fa-crown text-[8px]"></i> Completo
                            </div>
                        )}
                        <div className="text-left">
                            <p className={`text-sm font-bold uppercase tracking-wide ${selectedPlan === 'ultimate' ? 'text-white' : 'text-gray-400'}`}>Ultimate</p>
                            <p className="text-[10px] text-gray-500">Personal + Nutri + App</p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-start justify-end">
                                <span className="text-[10px] mt-1 mr-1 text-gray-400">R$</span>
                                <span className={`text-2xl font-anton ${selectedPlan === 'ultimate' ? 'text-white' : 'text-gray-400'}`}>259,99</span>
                            </div>
                            <span className="text-[9px] text-gray-500 block -mt-1">/mês</span>
                        </div>
                    </div>

                    {/* Trimestral Option (Best Value) */}
                    <div 
                        onClick={() => setSelectedPlan('quarterly')}
                        className={`relative p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                            selectedPlan === 'quarterly' 
                            ? 'bg-white/10 border-primary/50 shadow-[0_0_15px_rgba(252,82,0,0.15)]' 
                            : 'bg-white/5 border-transparent hover:bg-white/10'
                        }`}
                    >
                        {selectedPlan === 'quarterly' && (
                            <div className="absolute -top-2 left-4 bg-primary text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wide shadow-sm">
                                Custo Benefício
                            </div>
                        )}
                        <div className="text-left">
                            <p className={`text-sm font-bold uppercase tracking-wide ${selectedPlan === 'quarterly' ? 'text-white' : 'text-gray-400'}`}>Trimestral</p>
                            <p className="text-[10px] text-gray-500">App Completo</p>
                        </div>
                        <div className="text-right">
                            <div className="flex flex-col items-end">
                                <div className="flex items-start justify-end">
                                    <span className="text-[10px] mt-1 mr-1 text-gray-400">R$</span>
                                    <span className={`text-2xl font-anton ${selectedPlan === 'quarterly' ? 'text-white' : 'text-gray-400'}`}>39,90</span>
                                </div>
                                <span className="text-[9px] text-gray-500 -mt-1">cobrado a cada 3 meses</span>
                            </div>
                        </div>
                    </div>

                    {/* Mensal Option */}
                    <div 
                        onClick={() => setSelectedPlan('monthly')}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                            selectedPlan === 'monthly' 
                            ? 'bg-white/10 border-primary/50 shadow-[0_0_15px_rgba(252,82,0,0.15)]' 
                            : 'bg-white/5 border-transparent hover:bg-white/10'
                        }`}
                    >
                        <div className="text-left">
                            <p className={`text-sm font-bold uppercase tracking-wide ${selectedPlan === 'monthly' ? 'text-white' : 'text-gray-400'}`}>Mensal</p>
                            <p className="text-[10px] text-gray-500">App Completo</p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-start justify-end">
                                <span className="text-xs mt-1 mr-1 text-gray-400">R$</span>
                                <span className={`text-2xl font-anton ${selectedPlan === 'monthly' ? 'text-white' : 'text-gray-400'}`}>15,90</span>
                            </div>
                            <span className="text-[9px] text-gray-500 block -mt-1">/mês</span>
                        </div>
                    </div>
                </div>

                {/* Features Compact Grid */}
                <div className={`rounded-xl p-4 border mb-6 transition-colors duration-300 ${selectedPlan === 'ultimate' ? 'bg-purple-900/20 border-purple-500/30' : 'bg-black/20 border-white/5'}`}>
                    <ul className="grid grid-cols-2 gap-x-2 gap-y-2">
                        {renderFeatures()}
                    </ul>
                </div>

                {/* Actions */}
                <div className="mt-auto space-y-3 flex-shrink-0">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-white font-anton uppercase tracking-widest text-base py-3.5 rounded-xl shadow-lg transition-all ${
                            selectedPlan === 'ultimate' 
                            ? 'bg-gradient-to-r from-purple-600 to-purple-500 shadow-purple-500/20' 
                            : 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)]'
                        }`}
                    >
                        {selectedPlan === 'ultimate' ? 'Assinar Ultimate' : 'Assinar Agora'}
                    </motion.button>

                    <button
                        onClick={onSkip}
                        className="w-full text-[10px] text-gray-500 hover:text-gray-300 transition-colors uppercase tracking-widest font-medium py-2"
                    >
                        Continuar com plano básico
                    </button>
                </div>
            </div>
        </motion.div>
    </div>
  );
};

export default SubscriptionPage;
