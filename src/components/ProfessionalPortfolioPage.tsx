// components/ProfessionalPortfolioPage.tsx
import React, { useState } from 'react';
import { Professional, UserData } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfessionalPortfolioPageProps {
  professional: Professional;
  userData: UserData;
  onHire: (professional: Professional) => void;
  onBack: () => void;
}

const ProfessionalPortfolioPage: React.FC<ProfessionalPortfolioPageProps> = ({
  professional,
  userData,
  onHire,
  onBack,
}) => {
  const [showHireConfirm, setShowHireConfirm] = useState(false);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button onClick={onBack} className="flex items-center gap-2 text-on-surface-secondary hover:text-on-surface mb-6">
        <i className="fa-solid fa-arrow-left"></i>
        <span>Voltar para todos os profissionais</span>
      </button>

      {/* Header */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
        <img
          src={professional.avatarUrl}
          alt={professional.name}
          className="w-32 h-32 rounded-full object-cover border-4 border-surface-200"
        />
        <div>
          <h1 className="text-3xl font-bold">{professional.name}</h1>
          <p className="text-lg font-semibold text-primary">{professional.specialty}</p>
        </div>
      </div>

      <div className="space-y-10">
        {/* Bio */}
        <section>
          <h2 className="text-xl font-bold mb-3">Sobre Mim</h2>
          <p className="text-on-surface-secondary leading-relaxed">{professional.bio}</p>
        </section>

        {/* Gallery */}
        <section>
          <h2 className="text-xl font-bold mb-4">Resultados</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {professional.portfolioImages.map((img, index) => (
              <motion.div key={index} whileHover={{ scale: 1.05 }} className="aspect-square rounded-lg overflow-hidden">
                <img src={img} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section>
          <h2 className="text-xl font-bold mb-4">Depoimentos</h2>
          <div className="space-y-4">
            {professional.testimonials.map((testimonial, index) => (
              <div key={index} className="bg-surface-100 p-4 rounded-lg border border-surface-200">
                <p className="italic text-on-surface-secondary">"{testimonial.quote}"</p>
                <p className="text-right font-semibold mt-2 text-sm">- {testimonial.clientName}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Sticky Footer for Hire Button */}
      <div className="sticky bottom-0 left-0 right-0 mt-10 py-4 bg-background/80 backdrop-blur-sm border-t border-surface-200">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4">
            <div>
                <p className="font-bold text-2xl text-primary">🔥 {professional.monthlyPrice}</p>
                <p className="text-xs text-on-surface-secondary">Assinatura mensal</p>
            </div>
            <button
                onClick={() => setShowHireConfirm(true)}
                className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:opacity-90 transition-opacity"
            >
                Contratar Agora
            </button>
        </div>
      </div>

      <AnimatePresence>
        {showHireConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHireConfirm(false)}
          >
            <motion.div
              className="bg-surface-100 rounded-xl p-6 w-full max-w-md border border-surface-200"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-3">Confirmar Contratação</h3>
              <p className="text-on-surface-secondary mb-6 text-sm">
                Você está prestes a contratar {professional.name} por{' '}
                <span className="font-bold text-primary">🔥 {professional.monthlyPrice}</span> por mês.
                Este valor será debitado do seu saldo de Flames.
              </p>
              <p className="text-on-surface-secondary mb-6 text-sm">
                Seu saldo atual: <span className="font-bold">🔥 {userData.flameBalance}</span>
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowHireConfirm(false)}
                  className="flex-1 px-4 py-3 rounded-lg bg-surface-200 hover:bg-surface-300 font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => onHire(professional)}
                  disabled={userData.flameBalance < professional.monthlyPrice}
                  className="flex-1 px-4 py-3 rounded-lg bg-primary text-white hover:opacity-90 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProfessionalPortfolioPage;