


import React, { useState } from 'react';

interface BenefitCardProps {
    icon: string;
    title: string;
    description: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ icon, title, description }) => (
    <div className="text-center p-6 bg-slate-900/30 rounded-2xl border border-purple-500/30 holographic-border backdrop-blur-sm hover:scale-105 transition-transform duration-300">
        <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 neon-glow pulse-animation">
            <span className="text-3xl">{icon}</span>
        </div>
        <h3 className="font-orbitron font-bold text-xl mb-2 text-glow">{title}</h3>
        <p className="text-gray-300">{description}</p>
    </div>
);

interface CheckoutPageProps {
    onCheckoutSuccess: (email: string) => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ onCheckoutSuccess }) => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            onCheckoutSuccess(email);
        }
    };

    return (
        <div className="min-h-screen text-white p-4">
             <div className="text-center py-16 md:py-20 px-4">
                <div className="container mx-auto max-w-5xl relative">
                     <div className="absolute top-20 left-10 w-20 h-20 bg-purple-500/20 rounded-full blur-xl animate-pulse"></div>
                     <div className="absolute top-40 right-20 w-32 h-32 bg-cyan-500/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '-2s' }}></div>
                    <h1 className="text-4xl md:text-6xl font-orbitron font-black mb-6 leading-tight text-glow">Transforme seu Corpo em 30 Dias</h1>
                    <p className="text-lg md:text-xl mb-12 text-gray-300 max-w-3xl mx-auto">Junte-se ao nosso sistema revolucionário com receitas fit e treinos funcionais personalizados por IA.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <BenefitCard icon="🥗" title="50 Receitas Fit" description="35 salgadas + 15 doces" />
                        <BenefitCard icon="💪" title="Treinos com Vídeos" description="Biblioteca completa" />
                        <BenefitCard icon="🤖" title="AI Coach" description="Seu plano diário" />
                        <BenefitCard icon="✏️" title="100% Personalizável" description="Você no controle" />
                    </div>
                </div>
            </div>
            
            <div className="py-16 md:py-20 px-4">
                <div className="container mx-auto max-w-2xl">
                    <div className="bg-slate-900/40 rounded-3xl p-8 md:p-12 shadow-2xl shadow-black/30 border-2 border-purple-500/20 backdrop-blur-md">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-orbitron font-bold text-glow">🎯 Comece Sua Transformação Agora</h2>
                            <div className="flex items-baseline justify-center my-6">
                                <span className="text-3xl font-semibold text-secondary mr-1">R$</span>
                                <span className="text-7xl font-extrabold text-white">12,99</span>
                                <span className="text-2xl font-medium text-gray-400 ml-2">/mês</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <h3 className="text-xl font-orbitron font-semibold mb-6 text-center text-glow">💳 Dados de Pagamento</h3>
                            <div className="space-y-5">
                                 <input type="text" required placeholder="Nome no Cartão" className="w-full px-4 py-3 bg-slate-800/50 border-2 border-purple-500/30 rounded-xl placeholder-gray-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all" />
                                 <input type="text" required placeholder="0000 0000 0000 0000" className="w-full px-4 py-3 bg-slate-800/50 border-2 border-purple-500/30 rounded-xl placeholder-gray-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all" />
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2">
                                        <input type="text" required placeholder="MM/AA" className="w-full px-4 py-3 bg-slate-800/50 border-2 border-purple-500/30 rounded-xl placeholder-gray-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all" />
                                    </div>
                                    <div>
                                        <input type="text" required placeholder="123" className="w-full px-4 py-3 bg-slate-800/50 border-2 border-purple-500/30 rounded-xl placeholder-gray-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all" />
                                    </div>
                                </div>
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="seu@email.com" className="w-full px-4 py-3 bg-slate-800/50 border-2 border-purple-500/30 rounded-xl placeholder-gray-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all" />
                                <button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary text-white font-orbitron font-bold py-4 rounded-xl text-lg hover:scale-105 transition-transform shadow-lg neon-glow pulse-animation disabled:opacity-60 disabled:cursor-not-allowed">
                                    <i className="fa-solid fa-lock mr-2"></i> Finalizar Pagamento
                                </button>
                            </div>
                             <p className="text-center mt-6 text-gray-400 text-sm">
                                <i className="fa-solid fa-shield-halved mr-1"></i> Pagamento 100% seguro e criptografado
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;