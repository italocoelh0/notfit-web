import React, { useState } from 'react';
import { UserData, UITexts, DashboardSection, Recipe, Exercise } from '../types';
import RoutineSelectionPage from './RoutineSelectionPage';
import ActiveRoutinePage from './ActiveRoutinePage';
import ContentManagerPage from './ContentManagerPage';
import { motion } from 'framer-motion';

// Waiting State Component
const WaitingForProfessional: React.FC<{ onBack: () => void }> = ({ onBack }) => {
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
                <span className="font-anton uppercase tracking-wider text-lg text-white">Aguarde</span>
             </div>

             <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-yellow-500/10 rounded-full filter blur-[150px] opacity-30"></div>
            
             <div className="relative z-10 w-full max-w-sm text-center">
                <div className="w-24 h-24 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                    <i className="fa-solid fa-hourglass-half text-4xl text-yellow-500 animate-pulse"></i>
                </div>
                
                <h2 className="font-anton uppercase text-3xl text-white tracking-widest mb-4">Em Análise</h2>
                <p className="text-sm text-gray-400 leading-relaxed mb-8">
                    Seu treinador ainda está preparando seu plano de treino e dieta. Assim que ele publicar, o conteúdo aparecerá automaticamente aqui.
                </p>

                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Status</p>
                    <p className="text-yellow-500 font-bold flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                        Pendente de Publicação
                    </p>
                </div>
             </div>
        </div>
    );
};


interface RoutinePageProps {
  userData: UserData;
  onUpdateUserData: (updates: Partial<UserData>) => Promise<boolean>;
  isEditMode: boolean;
  uiTexts: UITexts;
  onUpdateUiText: (page: keyof UITexts, key: string, value: string) => void;
  setActiveSection: (section: DashboardSection) => void;
  recipes: Recipe[];
  exercises: Exercise[];
  onSendNotification: (message: string) => void;
  // CRUD Props passed from Dashboard
  onUpdateExercise: (exercise: Exercise) => void;
  onAddExercise: (exercise: Omit<Exercise, 'id'>) => void;
  onDeleteExercise: (exerciseId: number) => void;
  onUpdateRecipe: (recipe: Recipe) => void;
  onAddRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  onDeleteRecipe: (recipeId: number) => void;
}

const RoutinePage: React.FC<RoutinePageProps> = ({
  userData,
  onUpdateUserData,
  isEditMode,
  uiTexts,
  onUpdateUiText,
  setActiveSection,
  recipes,
  exercises,
  onSendNotification,
  onUpdateExercise,
  onAddExercise,
  onDeleteExercise,
  onUpdateRecipe,
  onAddRecipe,
  onDeleteRecipe
}) => {
  const [view, setView] = useState<'selection' | 'myRoutine' | 'manager'>('selection');

  const handleResetRoutine = async () => {
    // Em um ambiente real vinculado a um profissional, o aluno talvez não devesse poder resetar.
    // Mas mantemos para testes/flexibilidade.
    const success = await onUpdateUserData({ routine: undefined });
    if (success) {
      onSendNotification("Visualização limpa.");
    }
  };
  
  if (view === 'selection') {
    return (
      <RoutineSelectionPage
        setActiveSection={(section) => {
            if (section === 'content_manager' as any) setView('manager');
            else setActiveSection(section);
        }}
        onSelectMyRoutine={() => setView('myRoutine')}
        isEditMode={isEditMode}
        uiTexts={uiTexts}
        onUpdateUiText={onUpdateUiText}
        isAdmin={userData.isAdmin || userData.isProfessional}
      />
    );
  }

  if (view === 'manager') {
      return (
          <ContentManagerPage 
            exercises={exercises}
            recipes={recipes}
            onUpdateExercise={onUpdateExercise}
            onAddExercise={onAddExercise}
            onDeleteExercise={onDeleteExercise}
            onUpdateRecipe={onUpdateRecipe}
            onAddRecipe={onAddRecipe}
            onDeleteRecipe={onDeleteRecipe}
            onBack={() => setView('selection')}
          />
      );
  }

  // This is the 'myRoutine' view logic (PLANO DE TREINO)
  return (
    <div>
      {/* Header de navegação interno - Só mostra se JÁ tem rotina e está na view de rotina ativa */}
      {userData.routine && (
        <div className="sticky top-0 bg-background/90 backdrop-blur-md z-20 px-4 py-3 flex items-center gap-3 border-b border-white/10 mb-4">
            <button onClick={() => setView('selection')} className="w-8 h-8 flex items-center justify-center bg-surface-100 rounded-full text-white hover:bg-primary hover:text-white transition-colors">
                <i className="fa-solid fa-arrow-left"></i>
            </button>
            <span className="font-anton uppercase tracking-wider text-lg">Sua Rotina</span>
        </div>
      )}

      {userData.routine ? (
        <div className="px-4 pb-24">
            <ActiveRoutinePage routine={userData.routine} onReset={handleResetRoutine} />
        </div>
      ) : (
        <WaitingForProfessional onBack={() => setView('selection')} />
      )}
    </div>
  );
};

export default RoutinePage;