// components/MyConsultancyDashboard.tsx
import React, { useState } from 'react';
import { Professional } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface MyConsultancyDashboardProps {
  professional: Professional;
  onCancelSubscription: () => void;
}

const MyConsultancyDashboard: React.FC<MyConsultancyDashboardProps> = ({
  professional,
  onCancelSubscription,
}) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-surface-100 rounded-xl border border-surface-200 p-6 flex items-center justify-between mb-8">
        <div>
            <p className="text-sm text-on-surface-secondary">Sua consultoria com</p>
            <h2 className="text-2xl font-bold">{professional.name}</h2>
            <p className="text-sm font-semibold text-primary">{professional.specialty}</p>
        </div>
        <img
          src={professional.avatarUrl}
          alt={professional.name}
          className="w-16 h-16 rounded-full object-cover"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Chat Section */}
        <div className="bg-surface-100 rounded-xl border border-surface-200 p-6">
            <h3 className="text-xl font-bold mb-4">Chat Direto</h3>
            <div className="h-64 bg-surface-200 rounded-lg p-4 flex flex-col justify-end">
                {/* Chat messages would go here */}
                <p className="text-sm text-on-surface-secondary text-center">
                    Inicie uma conversa com seu profissional.
                </p>
            </div>
            <div className="flex gap-2 mt-4">
                <input type="text" placeholder="Digite sua mensagem..." className="flex-1 bg-surface-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"/>
                <button className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"><i className="fa-solid fa-paper-plane"></i></button>
            </div>
        </div>
        {/* Plans and Files Section */}
        <div className="bg-surface-100 rounded-xl border border-surface-200 p-6">
            <h3 className="text-xl font-bold mb-4">Planos e Arquivos</h3>
            <div className="space-y-3">
                {/* Files would be listed here */}
                <div className="bg-surface-200 p-4 rounded-lg text-center">
                    <i className="fa-solid fa-folder-open text-3xl text-on-surface-secondary mb-2"></i>
                    <p className="text-sm text-on-surface-secondary">Nenhum arquivo enviado ainda.</p>
                </div>
            </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={() => setShowCancelConfirm(true)}
          className="text-sm text-red-500 hover:underline"
        >
          Gerenciar / Cancelar assinatura
        </button>
      </div>

      <AnimatePresence>
        {showCancelConfirm && (
            <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCancelConfirm(false)}
          >
            <motion.div
              className="bg-surface-100 rounded-xl p-6 max-w-md w-full"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-3">Cancelar Assinatura?</h3>
              <p className="text-on-surface-secondary mb-6 text-sm">
                Você perderá o acesso ao chat e aos arquivos do seu profissional.
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 px-4 py-3 rounded-lg bg-surface-200 hover:bg-surface-300 font-semibold transition-colors"
                >
                  Voltar
                </button>
                <button
                  onClick={() => {
                    setShowCancelConfirm(false);
                    onCancelSubscription();
                  }}
                  className="flex-1 px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 font-semibold transition-colors"
                >
                  Sim, cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyConsultancyDashboard;
