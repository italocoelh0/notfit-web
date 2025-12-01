// src/components/AICoach.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { UserData, GeneratedPlan, UITexts } from '../types';
import { getDailyPlan, testGeminiConnection } from '../services/geminiService';
import EditableField from './EditableField';

interface AICoachProps {
  userData: UserData;
  isEditMode: boolean;
  uiTexts: UITexts;
  onUpdateUiText: (page: keyof UITexts, key: string, value: string) => void;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className="text-6xl mb-4"
    >
      🤖
    </motion.div>
    <p className="text-on-surface-secondary">Seu Coach IA está preparando seu plano...</p>
  </div>
);

const ErrorDisplay: React.FC<{
  message: string;
  onRetry: () => void;
  onSkip?: () => void;
}> = ({ message, onRetry, onSkip }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl max-w-md mx-auto"
  >
    <div className="flex items-start gap-3 mb-4">
      <i className="fa-solid fa-triangle-exclamation text-2xl mt-1"></i>
      <div>
        <h3 className="font-bold text-lg">Ops! Erro no Coach IA</h3>
        <p className="text-sm">{message}</p>
      </div>
    </div>

    <div className="flex gap-3 pt-4 border-t border-red-100">
      <button
        onClick={onRetry}
        className="flex-1 bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors text-sm"
      >
        <i className="fa-solid fa-rotate mr-2"></i>
        Tentar Novamente
      </button>
      {onSkip && (
        <button
          onClick={onSkip}
          className="flex-1 bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm"
        >
          Pular Coach IA
        </button>
      )}
    </div>
  </motion.div>
);

const PlanDisplay: React.FC<{ plan: GeneratedPlan }> = ({ plan }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6"
  >
    {/* Motivação */}
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-xl">
      <div className="flex items-center gap-3 mb-3">
        <i className="fa-solid fa-fire text-2xl"></i>
        <h3 className="text-xl font-bold">Motivação do Dia</h3>
      </div>
      <p className="text-lg italic">"{plan.motivation}"</p>
    </div>

    {/* Plano Alimentar */}
    <div className="bg-surface-100 rounded-xl p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <i className="fa-solid fa-utensils mr-3 text-primary"></i>
        Plano Alimentar
      </h3>
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { meal: 'breakfast', icon: '☕', title: 'Café Manhã' },
          { meal: 'lunch', icon: '🍽️', title: 'Almoço' },
          { meal: 'dinner', icon: '🌙', title: 'Jantar' },
        ].map(({ meal, icon, title }) => (
          <div key={meal} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{icon}</span>
              <h4 className="font-semibold">{title}</h4>
            </div>
            <p className="text-sm text-on-surface-secondary">{plan.mealPlan[meal as keyof typeof plan.mealPlan]}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Treino */}
    <div className="bg-surface-100 rounded-xl p-6">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <i className="fa-solid fa-dumbbell mr-3 text-primary"></i>
        Treino do Dia
      </h3>
      <div className="space-y-3">
        {plan.workout.map((exercise, index) => (
          <div key={index} className="bg-white rounded-lg p-4 shadow-sm flex justify-between items-center">
            <div>
              <h4 className="font-semibold">{exercise.name}</h4>
              <p className="text-sm text-on-surface-secondary">{exercise.duration}</p>
            </div>
            <div className="text-right">
              <i className="fa-solid fa-play-circle text-primary text-xl"></i>
            </div>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
);

const AICoach: React.FC<AICoachProps> = ({ userData, isEditMode, uiTexts, onUpdateUiText }) => {
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [serviceAvailable, setServiceAvailable] = useState<boolean>(false);

  const texts = uiTexts.aiCoach || {
    title: 'Seu Coach IA',
    subtitle: 'Plano diário personalizado',
    loading: 'Preparando seu plano...',
    error: 'Erro ao carregar o Coach IA'
  };

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getDailyPlan(userData);
      setPlan(result);
      setServiceAvailable(true);
    } catch (err: any) {
      console.error('❌ Erro no Coach IA:', err);
      setError(err.message || texts.error || 'Ocorreu um erro desconhecido.');
      setServiceAvailable(false);
    } finally {
      setLoading(false);
    }
  }, [userData, texts, onUpdateUiText]);

  // Testa conexão na inicialização
  useEffect(() => {
    const initCoach = async () => {
      if (isEditMode) {
        setLoading(false);
        setServiceAvailable(false);
        return;
      }

 try {
        const available = await testGeminiConnection();
        if (available) {
          await fetchPlan();
        } else {
          setError('Serviço de IA temporariamente indisponível.');
          setServiceAvailable(false);
          setLoading(false);
        }
      } catch {
        setError('Não foi possível conectar ao Coach IA.');
        setServiceAvailable(false);
        setLoading(false);
      }
    };

    initCoach();
  }, [fetchPlan, isEditMode]);

  const handleSkip = () => {
    setError(null);
    setServiceAvailable(false);
    setLoading(false);
    // Mostra um plano padrão
    setPlan({
      motivation: 'Você está no caminho certo! Cada passo conta! 💪',
      mealPlan: {
        breakfast: 'Omelete proteico com vegetais',
        lunch: 'Frango grelhado com legumes e carboidrato',
        dinner: 'Salada proteica com atum ou peito de frango'
      },
      workout: [
        { name: 'Caminhada rápida', duration: '30 minutos' },
        { name: 'Flexões', duration: '3 séries de 15' },
        { name: 'Prancha', duration: '3x30 segundos' }
      ]
    });
  };

  if (isEditMode) {
    return (
      <div className="p-6 bg-100 rounded-xl">
        <EditableField
          as="h3"
          isEditing={true}
          value={texts.title || 'Seu Coach IA'}
          onChange={v => onUpdateUiText('aiCoach', 'title', v)}
          className="text-xl font-bold mb-2"
        />
        <EditableField
          as="p"
          isEditing={true}
          value={texts.subtitle || 'Plano diário personalizado'}
          onChange={v => onUpdateUiText('aiCoach', 'subtitle', v)}
          className="text-on-surface-secondary"
        />
        <p className="text-sm text-on-surface-secondary mt-4">
          [Coach IA - área de edição. O conteúdo real é gerado dinamicamente.]
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-surface-50 rounded-xl">
      <div className="text-center mb-6">
        <EditableField
          as="h2"
          isEditing={isEditMode}
          value={texts.title || 'Seu Coach IA'}
          onChange={v => onUpdateUiText('aiCoach', 'title', v)}
          className="text-2xl font-bold text-primary"
        />
        <EditableField
          as="p"
          isEditing={isEditMode}
          value={texts.subtitle || 'Seu plano diário personalizado'}
          onChange={v => onUpdateUiText('aiCoach', 'subtitle', v)}
          className="text-on-surface-secondary mt-1"
        />
      </div>

      {loading && <LoadingSpinner />}
      {error && (
        <ErrorDisplay
          message={error}
          onRetry={fetchPlan}
          onSkip={handleSkip}
        />
      )}
      {plan && !loading && <PlanDisplay plan={plan} />}
    </div>
  );
};

export default AICoach;