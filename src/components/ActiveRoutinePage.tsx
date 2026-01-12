
// components/ActiveRoutinePage.tsx

import React, { useMemo, useState } from 'react';
import { UserRoutine, Exercise, Recipe } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ActiveRoutinePageProps {
  routine: UserRoutine;
  onReset: () => void;
  viewType?: 'full' | 'workout' | 'diet';
}

const MetricCard: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
    <div className={`relative p-4 rounded-2xl border overflow-hidden ${highlight ? 'bg-primary/10 border-primary/50' : 'bg-black/40 border-white/10'}`}>
        {highlight && <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 rounded-full blur-xl -mr-8 -mt-8"></div>}
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-2xl font-anton tracking-wide ${highlight ? 'text-primary' : 'text-white'}`}>{value}</p>
    </div>
);

const MealCard: React.FC<{ label: string; meal: Recipe | null; icon: string }> = ({ label, meal, icon }) => (
    <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 flex items-center gap-4 group hover:bg-white/5 transition-colors">
        <div className="w-12 h-12 rounded-full bg-surface-200 flex items-center justify-center text-2xl border border-white/5 group-hover:border-primary/30 transition-colors">
            {icon}
        </div>
        <div className="flex-1">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-0.5">{label}</p>
            {meal ? (
                <>
                    <h4 className="text-sm font-bold text-white leading-tight">{meal.nome}</h4>
                    <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded mt-1 inline-block">{meal.categoria}</span>
                </>
            ) : (
                <p className="text-xs text-gray-400 italic">Livre escolha / Jejum</p>
            )}
        </div>
        {meal && <i className="fa-solid fa-chevron-right text-white/20 text-xs"></i>}
    </div>
);

const ExerciseCard: React.FC<{ exercise: Exercise }> = ({ exercise }) => (
    <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-4 relative overflow-hidden group">
        <div className="flex justify-between items-start mb-2">
            <span className="bg-white/10 text-white text-[10px] px-2 py-0.5 rounded uppercase tracking-wider border border-white/10">
                {exercise.grupoMuscular}
            </span>
            <span className="text-[10px] text-gray-400 uppercase">{exercise.nivel}</span>
        </div>
        <h4 className="text-lg font-anton text-white tracking-wide mb-1 group-hover:text-primary transition-colors">{exercise.nome}</h4>
        <div className="flex items-center gap-3 text-xs text-gray-400 mt-2">
            <span className="flex items-center gap-1"><i className="fa-solid fa-clock text-primary"></i> {exercise.duracao}</span>
            <span className="flex items-center gap-1"><i className="fa-solid fa-fire text-primary"></i> {exercise.calorias}</span>
        </div>
    </div>
);

const ActiveRoutinePage: React.FC<ActiveRoutinePageProps> = ({ routine, onReset, viewType = 'full' }) => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const currentDay = useMemo(() => {
    const start = new Date(routine.startDate);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    return Math.min(diffDays, routine.duration);
  }, [routine]);

  const daily = routine.dailyRoutines[selectedDay - 1];

  const showDiet = viewType === 'full' || viewType === 'diet';
  const showWorkout = viewType === 'full' || viewType === 'workout';
  const showMetrics = viewType === 'full' || viewType === 'workout';

  return (
    <div className="pb-32">
      {/* Header & Progress */}
      <div className="relative mb-8">
        <div className="flex justify-between items-end mb-6">
            <div>
                <div className="flex items-center gap-2 mb-1">
                     <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                     <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
                        {viewType === 'diet' ? 'Dieta Ativa' : viewType === 'workout' ? 'Treino Ativo' : 'Plano Ativo'}
                     </p>
                </div>
                <h2 className="text-3xl font-anton text-white uppercase tracking-wide">
                    Dia {currentDay} <span className="text-white/30 text-lg align-top">/ {routine.duration}</span>
                </h2>
            </div>
            <button
                onClick={() => setShowResetConfirm(true)}
                className="text-xs text-red-500 hover:text-red-400 uppercase tracking-widest font-bold border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all"
            >
                Resetar
            </button>
        </div>

        {/* Timeline Scroll */}
        <div className="flex gap-3 overflow-x-auto pb-4 hide-scrollbar snap-x">
            {routine.dailyRoutines.map((_, idx) => {
                const day = idx + 1;
                const isCurrent = day === currentDay;
                const isSelected = day === selectedDay;
                const isPast = day < currentDay;

                return (
                    <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`snap-center flex-shrink-0 w-14 h-20 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-300 border relative overflow-hidden
                        ${isSelected 
                            ? 'bg-primary border-primary text-white shadow-[0_0_15px_rgba(252,82,0,0.4)] scale-105' 
                            : isCurrent
                                ? 'bg-white/10 border-white/30 text-white'
                                : isPast
                                    ? 'bg-black/20 border-white/5 text-gray-500'
                                    : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/5'
                        }`}
                    >
                        <span className="text-[10px] uppercase tracking-wider font-bold">Dia</span>
                        <span className={`font-anton text-2xl ${isSelected ? 'text-white' : 'text-white/80'}`}>{day}</span>
                        {isPast && <i className="fa-solid fa-check absolute bottom-1 right-1 text-[10px] text-green-500"></i>}
                    </button>
                );
            })}
        </div>
      </div>

      {/* AI Metrics Dashboard (Conditional) */}
      {showMetrics && routine.type === 'ai' && routine.currentIMC && routine.targetIMC && (
        <div className="grid grid-cols-3 gap-3 mb-8">
            <MetricCard label="IMC Atual" value={routine.currentIMC.toFixed(1)} />
            <MetricCard label="IMC Alvo" value={routine.targetIMC.toFixed(1)} highlight />
            <MetricCard label="Peso Alvo" value={`${routine.targetWeight?.toFixed(1)}kg`} />
        </div>
      )}

      {/* Daily Content */}
      <motion.div
        key={selectedDay}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-8"
      >
        {/* Meals Section */}
        {showDiet && (
            <section>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                        <i className="fa-solid fa-leaf text-sm"></i>
                    </div>
                    <h3 className="font-anton uppercase text-xl text-white tracking-wide">Alimentação</h3>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                    <MealCard label="Café da Manhã" meal={daily.breakfast} icon="☕" />
                    <MealCard label="Almoço" meal={daily.lunch} icon="🍽️" />
                    <MealCard label="Jantar" meal={daily.dinner} icon="🌙" />
                    <MealCard label="Lanche" meal={daily.snack} icon="🍎" />
                </div>
            </section>
        )}

        {/* Workout Section */}
        {showWorkout && (
            <section>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <i className="fa-solid fa-dumbbell text-sm"></i>
                    </div>
                    <h3 className="font-anton uppercase text-xl text-white tracking-wide">Treino do Dia</h3>
                </div>

                {daily.exercises.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {daily.exercises.map(ex => (
                            <ExerciseCard key={ex.id} exercise={ex} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-surface-100/50 border border-white/10 rounded-xl p-8 text-center">
                        <i className="fa-solid fa-bed text-3xl text-gray-500 mb-3"></i>
                        <p className="font-anton uppercase text-lg text-white tracking-wide">Dia de Descanso</p>
                        <p className="text-xs text-gray-400">Recuperação é parte do processo.</p>
                    </div>
                )}
            </section>
        )}

        {/* Daily Check-in Button */}
        {selectedDay === currentDay && (
             <div className="mt-8">
                <button className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white font-anton uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all hover:scale-[1.02] flex items-center justify-center gap-3">
                    <i className="fa-solid fa-check-circle text-xl"></i>
                    Concluir Dia {currentDay}
                </button>
             </div>
        )}
      </motion.div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              className="bg-surface-100 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-triangle-exclamation text-red-500 text-xl"></i>
              </div>
              <h3 className="font-anton uppercase text-xl text-white text-center mb-2 tracking-wide">Resetar Plano?</h3>
              <p className="text-gray-400 text-sm text-center mb-6 leading-relaxed">
                Todo o seu progresso atual será perdido e você voltará para a seleção de rotina.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowResetConfirm(false);
                    onReset();
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white hover:bg-red-500 font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-900/20 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActiveRoutinePage;
