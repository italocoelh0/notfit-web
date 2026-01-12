
// components/FlamesStorePage.tsx

import React, { useState } from 'react';
import { UserData } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { createCheckoutSession } from '../src/services/paymentsService';

const FLAME_PACKS = [
    { id: 1, amount: 12, price: 1.50, label: 'Pack Iniciante', popular: false },
    { id: 2, amount: 70, price: 6.90, label: 'Pack Evolução', popular: true },
    { id: 3, amount: 350, price: 33.90, label: 'Pack Pro', popular: false },
];

interface ConfirmPurchaseModalProps {
    pack: typeof FLAME_PACKS[0];
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
}

const ConfirmPurchaseModal: React.FC<ConfirmPurchaseModalProps> = ({ pack, onClose, onConfirm, isLoading }) => (
    <motion.div 
        className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
    >
        <motion.div 
            className="relative w-full max-w-sm bg-surface-100/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden"
            initial={{ scale: 0.9, y: 20 }} 
            animate={{ scale: 1, y: 0 }} 
            exit={{ scale: 0.9, y: 20 }} 
            onClick={e => e.stopPropagation()}
        >
             {/* Decorative Background */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <h3 className="font-anton uppercase text-2xl text-white tracking-wide mb-1 text-center">Confirmar Compra</h3>
            <p className="text-xs text-gray-400 text-center mb-8 uppercase tracking-widest">Adicionar fundos à carteira</p>

            <div className="bg-black/40 border border-white/5 rounded-xl p-6 mb-6 flex flex-col items-center text-center">
                <div className="text-4xl mb-2">🔥</div>
                <p className="font-anton text-4xl text-white mb-1">{pack.amount}</p>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Flames</p>
            </div>

            <div className="flex justify-between items-center mb-8 px-2">
                <span className="text-gray-400 text-sm">Total a pagar:</span>
                <span className="font-anton text-xl text-white">R$ {pack.price.toFixed(2).replace('.', ',')}</span>
            </div>

            <div className="space-y-3">
                <button 
                    disabled={isLoading}
                    className="w-full bg-primary text-white font-anton uppercase tracking-widest text-sm py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Processando...
                        </>
                    ) : (
                        'Confirmar Pagamento'
                    )}
                </button>
                <button 
                    onClick={onClose}
                    disabled={isLoading}
                    className="w-full text-xs text-gray-500 hover:text-white uppercase tracking-widest font-bold py-3 transition-colors disabled:opacity-50"
                >
                    Cancelar
                </button>
            </div>
        </motion.div>
    </motion.div>
);

const FlamePackCard: React.FC<{
    pack: typeof FLAME_PACKS[0];
    onClick: () => void;
}> = ({ pack, onClick }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`relative p-5 rounded-2xl border cursor-pointer overflow-hidden group transition-all duration-300 flex justify-between items-center
        ${pack.popular 
            ? 'bg-white/10 border-primary/50 shadow-[0_0_20px_rgba(252,82,0,0.15)]' 
            : 'bg-black/40 border-white/10 hover:bg-white/5'
        }`}
    >
        {pack.popular && (
            <div className="absolute -top-0 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-bold uppercase px-3 py-0.5 rounded-b-lg tracking-widest shadow-sm z-10">
                Mais Popular
            </div>
        )}

        <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border ${pack.popular ? 'bg-primary/20 border-primary text-primary' : 'bg-surface-200 border-white/5 text-gray-400'}`}>
                🔥
            </div>
            <div>
                <div className="flex items-baseline gap-2">
                     <h3 className={`font-anton text-2xl tracking-wide ${pack.popular ? 'text-white' : 'text-gray-200'}`}>
                        {pack.amount}
                    </h3>
                    <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Flames</span>
                </div>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">
                    {pack.label}
                </p>
            </div>
        </div>

        <div className="text-right">
             <span className="text-sm font-anton tracking-wide text-white block">
                R$ {pack.price.toFixed(2).replace('.', ',')}
             </span>
        </div>
    </motion.div>
);


const FlamesStorePage: React.FC<{ userData: UserData; onUpdateUserData: (updates: Partial<UserData>) => Promise<boolean>; onSendNotification: (message: string) => void; }> = ({ userData, onUpdateUserData, onSendNotification }) => {
    const [selectedPack, setSelectedPack] = useState<typeof FLAME_PACKS[0] | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleBuyFlames = async () => {
        if (!selectedPack || isProcessing) return;

        setIsProcessing(true);
        
        try {
            // Criar sessão de checkout no Stripe via backend
            const { url } = await createCheckoutSession(
                userData.id,
                selectedPack,
                userData.email
            );

            // Redirecionar para o Stripe Checkout
            window.location.href = url;
        } catch (error: any) {
            console.error('Erro ao criar checkout:', error);
            onSendNotification(`❌ Erro ao processar pagamento: ${error.message || 'Tente novamente'}`);
            setIsProcessing(false);
            setSelectedPack(null);
        }
    };

    return (
        <div className="pb-32 min-h-screen relative overflow-hidden">
             {/* Background decorative elements (Similar to SubscriptionPage) */}
             <div className="absolute top-[-10%] right-[-20%] w-[400px] h-[400px] bg-primary/10 rounded-full filter blur-[120px] opacity-30 pointer-events-none"></div>
             <div className="absolute top-[20%] left-[-10%] w-[300px] h-[300px] bg-purple-900/20 rounded-full filter blur-[100px] opacity-30 pointer-events-none"></div>

            {/* Header Section */}
            <div className="relative z-10 pt-4 mb-8 text-center">
                <h1 className="font-anton uppercase text-3xl text-white tracking-widest drop-shadow-lg">
                    Loja de <span className="text-primary">Flames</span>
                </h1>
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] mt-1">
                    Impulsione sua jornada
                </p>
            </div>

            {/* Balance Card */}
            <div className="relative z-10 mx-4 mb-8">
                <div className="bg-gradient-to-br from-surface-200/80 to-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50"></div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-2 font-bold relative z-10">Seu Saldo Atual</p>
                    <div className="flex items-center gap-2 relative z-10">
                        <span className="text-4xl animate-pulse">🔥</span>
                        <span className="font-anton text-5xl text-white tracking-wide">{userData.flameBalance}</span>
                    </div>
                </div>
            </div>

            {/* Store List */}
            <div className="relative z-10 px-4 spac
                        isLoading={isProcessing}-y-4 max-w-md mx-auto">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold ml-2 mb-2">Pacotes Disponíveis</p>
                {FLAME_PACKS.map(pack => (
                    <FlamePackCard 
                        key={pack.id}
                        pack={pack}
                        onClick={() => setSelectedPack(pack)}
                    />
                ))}
            </div>

            {/* Footer Note */}
            <div className="relative z-10 text-center mt-12 px-8">
                <p className="text-[10px] text-gray-600 leading-relaxed">
                    Flames podem ser usadas para desbloquear consultorias exclusivas e destacar seu perfil na comunidade.
                </p>
            </div>

            <AnimatePresence>
                {selectedPack && (
                    <ConfirmPurchaseModal 
                        pack={selectedPack} 
                        onClose={() => setSelectedPack(null)} 
                        onConfirm={handleBuyFlames}
                        isLoading={isProcessing}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default FlamesStorePage;
