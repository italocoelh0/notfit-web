
import React, { useState, useMemo } from 'react';
import { UserData, UITexts, DashboardSection, Recipe, Exercise, UserRoutine } from '../types';
import ActiveRoutinePage from './ActiveRoutinePage';
import MeusTreinosPage from './MeusTreinosPage';
import MinhasDietasPage from './MinhasDietasPage';
import { motion, AnimatePresence } from 'framer-motion';

interface StudentCustomRoutinePageProps {
  userData: UserData;
  onUpdateUserData: (updates: Partial<UserData>) => Promise<boolean>;
  isEditMode: boolean;
  uiTexts: UITexts;
  onUpdateUiText: (page: keyof UITexts, key: string, value: string) => void;
  setActiveSection: (section: DashboardSection) => void;
  recipes: Recipe[];
  exercises: Exercise[];
  onSendNotification: (message: string) => void;
  onUpdateRecipe: (recipe: Recipe) => void;
  onAddRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  onDeleteRecipe: (recipeId: number) => void;
}

const PlanCard: React.FC<{ routine: UserRoutine; onClick: () => void; type: 'workout' | 'diet' }> = ({ routine, onClick, type }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="bg-surface-100/40 backdrop-blur-md border border-white/10 p-5 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-all group"
    >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg border border-white/10 transition-colors ${type === 'workout' ? 'bg-primary/20 text-primary group-hover:bg-primary group-hover:text-white' : 'bg-green-500/20 text-green-500 group-hover:bg-green-500 group-hover:text-white'}`}>
            <i className={`fa-solid ${type === 'workout' ? 'fa-dumbbell' : 'fa-utensils'}`}></i>
        </div>
        <div className="flex-1">
            <h4 className="text-white font-bold text-sm uppercase tracking-wide group-hover:text-primary transition-colors">{routine.title || 'Plano Personalizado'}</h4>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mt-1">
                {routine.duration} Dias • Início: {new Date(routine.startDate).toLocaleDateString()}
            </p>
        </div>
        <i className="fa-solid fa-chevron-right text-gray-600 group-hover:text-white transition-colors"></i>
    </motion.div>
);

const StudentCustomRoutinePage: React.FC<StudentCustomRoutinePageProps> = ({
  userData,
  onUpdateUserData,
  setActiveSection,
  onSendNotification,
  recipes,
  exercises
}) => {
  const [activeCategory, setActiveCategory] = useState<'workouts' | 'diets'>('workouts');
  const [view, setView] = useState<'list' | 'builder' | 'active'>('list');
  const [selectedRoutine, setSelectedRoutine] = useState<UserRoutine | null>(null);

  const savedList = useMemo(() => {
      return activeCategory === 'workouts' 
        ? (userData.savedWorkouts || []) 
        : (userData.savedDiets || []);
  }, [activeCategory, userData.savedWorkouts, userData.savedDiets]);

  const handleOpenRoutine = (routine: UserRoutine) => {
      setSelectedRoutine(routine);
      setView('active');
  };

  const handleCreateNew = () => {
      setView('builder');
  };

  const handleBackToList = () => {
      setView('list');
      setSelectedRoutine(null);
  };

  // --- RENDERS ---

  if (view === 'active' && selectedRoutine) {
      return (
        <div className="pb-24">
            <div className="sticky top-0 bg-background/90 backdrop-blur-md z-20 px-4 py-3 flex items-center gap-3 border-b border-white/10 mb-4 pt-safe">
                <button onClick={handleBackToList} className="w-8 h-8 flex items-center justify-center bg-surface-100 rounded-full text-white hover:bg-primary hover:text-white transition-colors">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <div className="flex-1">
                    <span className="font-anton uppercase tracking-wider text-lg block leading-none">{selectedRoutine.title}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${activeCategory === 'workouts' ? 'text-primary' : 'text-green-500'}`}>
                        {activeCategory === 'workouts' ? 'Plano de Treino' : 'Plano Alimentar'}
                    </span>
                </div>
            </div>
            <div className="px-4">
                <ActiveRoutinePage 
                    routine={selectedRoutine} 
                    onReset={() => {
                        const listKey = activeCategory === 'workouts' ? 'savedWorkouts' : 'savedDiets';
                        const newList = (userData[listKey] as UserRoutine[]).filter(r => r.id !== selectedRoutine.id);
                        onUpdateUserData({ [listKey]: newList });
                        handleBackToList();
                    }} 
                    viewType={activeCategory === 'workouts' ? 'workout' : 'diet'} 
                />
            </div>
        </div>
      );
  }

  if (view === 'builder') {
      if (activeCategory === 'workouts') {
          return (
            <MeusTreinosPage 
                userData={userData}
                exercises={exercises}
                onBack={handleBackToList}
                onSendNotification={onSendNotification}
                onUpdateUserData={async (updates) => {
                    // Adaptar MeusTreinosPage para adicionar ao invés de substituir
                    if (updates.routine) {
                        const newRoutine = { ...updates.routine, id: `w_${Date.now()}`, title: `Treino ${savedList.length + 1}` };
                        const newList = [...(userData.savedWorkouts || []), newRoutine];
                        const success = await onUpdateUserData({ savedWorkouts: newList });
                        if (success) handleBackToList();
                        return success;
                    }
                    return false;
                }}
            />
          );
      } else {
          return (
              <MinhasDietasPage 
                userData={userData}
                recipes={recipes}
                onBack={handleBackToList}
                onSendNotification={onSendNotification}
                onUpdateUserData={async (updates) => {
                    if (updates.routine) {
                        const newRoutine = { ...updates.routine, id: `d_${Date.now()}`, title: `Dieta ${savedList.length + 1}` };
                        const newList = [...(userData.savedDiets || []), newRoutine];
                        const success = await onUpdateUserData({ savedDiets: newList });
                        if (success) handleBackToList();
                        return success;
                    }
                    return false;
                }}
              />
          )
      }
  }

  return (
    <div className="min-h-screen bg-background pb-32">
       {/* Back Header */}
       <div className="sticky top-0 left-0 w-full z-[60] px-4 py-4 flex items-center gap-3 bg-background/90 backdrop-blur-md border-b border-white/10 pt-safe mb-6">
            <button 
                onClick={() => setActiveSection('rotina')} 
                className="w-10 h-10 flex items-center justify-center bg-surface-200 rounded-full text-white hover:bg-primary transition-colors active:scale-90"
            >
                <i className="fa-solid fa-arrow-left"></i>
            </button>
            <span className="font-anton uppercase tracking-wider text-lg text-white">Minha Central</span>
       </div>

       <div className="px-4 max-w-lg mx-auto">
            {/* Category Selector */}
            <div className="bg-surface-100 p-1 rounded-2xl flex mb-8 border border-white/5">
                <button 
                    onClick={() => setActiveCategory('workouts')}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeCategory === 'workouts' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <i className="fa-solid fa-dumbbell mr-2"></i> Treinos
                </button>
                <button 
                    onClick={() => setActiveCategory('diets')}
                    className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeCategory === 'diets' ? 'bg-green-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
                >
                    <i className="fa-solid fa-utensils mr-2"></i> Dietas
                </button>
            </div>

            {/* List of Plans */}
            <div className="space-y-4 mb-10">
                <div className="flex justify-between items-center px-2">
                    <h3 className="font-anton text-white uppercase tracking-wide opacity-50">
                        {activeCategory === 'workouts' ? 'Meus Treinos' : 'Minhas Dietas'} ({savedList.length})
                    </h3>
                </div>

                {savedList.length > 0 ? (
                    savedList.map(plan => (
                        <PlanCard 
                            key={plan.id} 
                            routine={plan} 
                            type={activeCategory === 'workouts' ? 'workout' : 'diet'}
                            onClick={() => handleOpenRoutine(plan)}
                        />
                    ))
                ) : (
                    <div className="py-20 text-center bg-white/5 rounded-3xl border border-white/10 border-dashed">
                        <i className={`fa-solid ${activeCategory === 'workouts' ? 'fa-dumbbell' : 'fa-utensils'} text-4xl text-gray-700 mb-4`}></i>
                        <p className="font-anton uppercase text-gray-500 tracking-wider">Nenhum plano criado</p>
                        <p className="text-xs text-gray-600 mt-1">Crie seu primeiro plano personalizado agora.</p>
                    </div>
                )}
            </div>

            {/* Global Create Button */}
            <button 
                onClick={handleCreateNew}
                className={`w-full py-5 rounded-2xl text-white font-anton uppercase tracking-widest shadow-2xl transition-all hover:scale-[1.02] flex items-center justify-center gap-3 ${activeCategory === 'workouts' ? 'bg-primary shadow-primary/20' : 'bg-green-600 shadow-green-900/20'}`}
            >
                <i className="fa-solid fa-plus-circle text-xl"></i>
                {activeCategory === 'workouts' ? 'Montar Novo Treino' : 'Montar Nova Dieta'}
            </button>
       </div>
    </div>
  );
};

export default StudentCustomRoutinePage;
