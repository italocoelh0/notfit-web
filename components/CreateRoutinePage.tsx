// components/CreateRoutinePage.tsx

import React, { useState } from 'react';
import { Recipe, Exercise } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface CreateRoutinePageProps {
  recipes: Recipe[];
  exercises: Exercise[];
  onConfirm: (selectedRecipes: Recipe[], selectedExercises: Exercise[]) => void;
  onCancel: () => void;
}

const RecipeSelectionCard: React.FC<{
  recipe: Recipe;
  isSelected: boolean;
  onToggleSelect: (recipe: Recipe) => void;
}> = ({ recipe, isSelected, onToggleSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      className={`p-4 rounded-xl text-left transition-all border-2 ${
        isSelected ? 'border-primary shadow-lg shadow-primary/10' : 'bg-surface-100 border-surface-200'
      }`}
    >
      <div className="flex items-start gap-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <span className="text-4xl mt-1">{recipe.icon}</span>
        <div className="flex-1">
          <h3 className="font-bold text-sm mb-1">{recipe.nome}</h3>
          <p className="text-xs text-on-surface-secondary">{recipe.categoria}</p>
        </div>
        <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
          <i className="fa-solid fa-chevron-down text-on-surface-secondary text-xs"></i>
        </motion.div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 border-t border-surface-200">
              <h4 className="font-semibold text-xs mb-2 text-on-surface-secondary">Ingredientes:</h4>
              <ul className="space-y-1 text-xs text-on-surface-secondary">
                {recipe.ingredientes.map((ing, i) => <li key={i} className="flex items-start"><i className="fa-solid fa-circle text-primary text-[5px] mr-2 mt-1"></i><span>{ing}</span></li>)}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
       <button
        onClick={() => onToggleSelect(recipe)}
        className={`w-full mt-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-surface-200 hover:bg-surface-300'}`}
      >
        {isSelected ? 'Selecionado' : 'Selecionar'}
      </button>
    </motion.div>
  );
};

const ExerciseSelectionCard: React.FC<{
  exercise: Exercise;
  isSelected: boolean;
  onToggleSelect: (exercise: Exercise) => void;
  onViewVideo: (exercise: Exercise) => void;
}> = ({ exercise, isSelected, onToggleSelect, onViewVideo }) => {
  return (
    <div className={`rounded-xl text-left transition-all border-2 overflow-hidden ${isSelected ? 'border-primary shadow-lg shadow-primary/10' : 'bg-surface-100 border-surface-200'}`}>
        <div className="aspect-video bg-black relative">
             <img src={`https://img.youtube.com/vi/${exercise.videoId}/mqdefault.jpg`} alt={exercise.nome} className="w-full h-full object-cover"/>
        </div>
        <div className="p-3">
            <h3 className="font-bold text-sm mb-1 truncate">{exercise.nome}</h3>
            <p className="text-xs text-on-surface-secondary">{exercise.grupoMuscular} • {exercise.nivel}</p>
            <div className="grid grid-cols-2 gap-2 mt-3">
                <button onClick={() => onViewVideo(exercise)} className="bg-surface-200 w-full py-2 rounded-lg text-xs font-semibold hover:bg-surface-300 transition-colors">
                    <i className="fa-solid fa-play mr-1"></i> Ver Vídeo
                </button>
                <button onClick={() => onToggleSelect(exercise)} className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors ${isSelected ? 'bg-primary text-white' : 'bg-surface-200 hover:bg-surface-300'}`}>
                    {isSelected ? 'Selecionado' : 'Selecionar'}
                </button>
            </div>
        </div>
    </div>
  );
};

const CreateRoutinePage: React.FC<CreateRoutinePageProps> = ({
  recipes,
  exercises,
  onConfirm,
  onCancel,
}) => {
  const [selectedRecipes, setSelectedRecipes] = useState<Recipe[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [activeTab, setActiveTab] = useState<'recipes' | 'exercises'>('recipes');
  const [viewingExercise, setViewingExercise] = useState<Exercise | null>(null);

  const toggleRecipe = (recipe: Recipe) => {
    setSelectedRecipes(prev =>
      prev.find(r => r.id === recipe.id) ? prev.filter(r => r.id !== recipe.id) : [...prev, recipe],
    );
  };

  const toggleExercise = (exercise: Exercise) => {
    setSelectedExercises(prev =>
      prev.find(e => e.id === exercise.id) ? prev.filter(e => e.id !== exercise.id) : [...prev, exercise],
    );
  };

  const handleConfirm = () => {
    if (!selectedRecipes.length || !selectedExercises.length) {
      alert('Selecione pelo menos uma receita e um exercício.');
      return;
    }
    onConfirm(selectedRecipes, selectedExercises);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Criar Rotina Manual</h2>
          <p className="text-on-surface-secondary text-sm">
            Monte sua rotina escolhendo receitas e exercícios.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="text-on-surface-secondary hover:text-on-surface"
        >
          <i className="fa-solid fa-times text-2xl"></i>
        </button>
      </div>

      <div className="flex gap-4 mb-6 border-b border-surface-200">
        <button
          onClick={() => setActiveTab('recipes')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'recipes'
              ? 'text-primary border-b-2 border-primary'
              : 'text-on-surface-secondary'
          }`}
        >
          <i className="fa-solid fa-utensils mr-2"></i>
          Receitas ({selectedRecipes.length})
        </button>
        <button
          onClick={() => setActiveTab('exercises')}
          className={`px-4 py-2 font-semibold transition-colors ${
            activeTab === 'exercises'
              ? 'text-primary border-b-2 border-primary'
              : 'text-on-surface-secondary'
          }`}
        >
          <i className="fa-solid fa-dumbbell mr-2"></i>
          Exercícios ({selectedExercises.length})
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'recipes' ? (
          <motion.div
            key="recipes-tab"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-bold mb-3 text-on-surface">🥗 Salgadas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {recipes.filter(r => r.tipo === 'salgada').map(recipe => (
                  <RecipeSelectionCard key={recipe.id} recipe={recipe} isSelected={!!selectedRecipes.find(r => r.id === recipe.id)} onToggleSelect={toggleRecipe} />
                ))}
              </div>
            </div>
             <div>
              <h3 className="text-lg font-bold mb-3 text-on-surface">🍰 Doces</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {recipes.filter(r => r.tipo === 'doce').map(recipe => (
                  <RecipeSelectionCard key={recipe.id} recipe={recipe} isSelected={!!selectedRecipes.find(r => r.id === recipe.id)} onToggleSelect={toggleRecipe} />
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="exercises-tab"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {exercises.map(ex => (
                    <ExerciseSelectionCard key={ex.id} exercise={ex} isSelected={!!selectedExercises.find(e => e.id === ex.id)} onToggleSelect={toggleExercise} onViewVideo={setViewingExercise} />
                ))}
              </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 flex justify-end gap-4">
        <button
          onClick={onCancel}
          className="px-6 py-3 rounded-lg font-semibold text-on-surface-secondary hover:bg-surface-100 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirm}
          disabled={!selectedRecipes.length || !selectedExercises.length}
          className="px-6 py-3 rounded-lg font-semibold bg-primary text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirmar Rotina
        </button>
      </div>

       <AnimatePresence>
        {viewingExercise && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setViewingExercise(null)}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              layout
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface-100 rounded-xl max-w-2xl w-full"
            >
              <div className="p-4 flex justify-between items-center border-b border-surface-200">
                <h3 className="font-bold text-sm">{viewingExercise.nome}</h3>
                <button onClick={() => setViewingExercise(null)} className="text-on-surface-secondary hover:text-on-surface text-xl">&times;</button>
              </div>
              <div className="aspect-video bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${viewingExercise.videoId}?autoplay=1&modestbranding=1&rel=0`}
                  title={viewingExercise.nome}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="border-0"
                ></iframe>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateRoutinePage;