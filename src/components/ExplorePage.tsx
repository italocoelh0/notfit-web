// components/ExplorePage.tsx
import React from 'react';
import { DashboardSection } from '../types';
import { motion } from 'framer-motion';

interface ExplorePageProps {
  onNavigate: (section: DashboardSection) => void;
}

const ExploreCard: React.FC<{
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  colorClass: string;
}> = ({ icon, title, description, onClick, colorClass }) => (
  <motion.button
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`p-6 rounded-xl text-left shadow-lg hover:shadow-xl transition-all ${colorClass}`}
  >
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-sm opacity-90">{description}</p>
  </motion.button>
);

const ExplorePage: React.FC<ExplorePageProps> = ({ onNavigate }) => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExploreCard
          icon="📅"
          title="Eventos"
          description="Participe de trilhas, corridas e outras atividades em grupo."
          onClick={() => onNavigate('events')}
          colorClass="bg-gradient-to-br from-blue-500 to-blue-600 text-white"
        />
        <ExploreCard
          icon="🤖"
          title="Minha Rotina"
          description="Crie ou gere com IA um plano de treinos e alimentação completo."
          onClick={() => onNavigate('rotina')}
          colorClass="bg-gradient-to-br from-purple-500 to-purple-600 text-white"
        />
        <ExploreCard
          icon="🥗"
          title="Alimentação"
          description="Navegue por todas as receitas fit disponíveis no app."
          onClick={() => onNavigate('alimentacao')}
          colorClass="bg-gradient-to-br from-green-500 to-green-600 text-white"
        />
        <ExploreCard
          icon="🏋️"
          title="Treinos"
          description="Explore a biblioteca de exercícios com vídeos demonstrativos."
          onClick={() => onNavigate('treinos')}
          colorClass="bg-gradient-to-br from-red-500 to-red-600 text-white"
        />
      </div>
    </div>
  );
};

export default ExplorePage;