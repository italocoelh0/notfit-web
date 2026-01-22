
import React, { useState, useMemo, useEffect } from 'react';
import { Exercise, MuscleGroup, ExerciseCategory, UITexts, ExerciseLevel, UserData, DashboardSection } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import EditableField from './EditableField';
import IntegratedVideoPlayer from './IntegratedVideoPlayer';
import { createManualRoutine } from '../lib/routineService';

const BLANK_EXERCISE: Omit<Exercise, 'id'> = {
    nome: "Novo Exercício",
    videoId: "dQw4w9WgXcQ",
    videoUrl: "",
    descricao: "Descrição do novo exercício.",
    nivel: "Iniciante",
    duracao: "3x 12",
    calorias: "~5 cal/min",
    grupoMuscular: "Peito",
    categoria: 'Musculação',
    isElite: false
};

interface ExerciseModalProps {
    exercise: Exercise | Omit<Exercise, 'id'> | null;
    onClose: () => void;
    isAdmin: boolean;
    onUpdateExercise: (exercise: Exercise) => void;
    onAddExercise: (exercise: Omit<Exercise, 'id'>) => void;
    onDeleteExercise: (exerciseId: number) => void;
}

const ExerciseModal: React.FC<ExerciseModalProps> = ({ exercise, onClose, isAdmin, onUpdateExercise, onAddExercise, onDeleteExercise }) => {
    const isNew = exercise && !('id' in exercise);
    const [editedExercise, setEditedExercise] = useState(exercise);

    useEffect(() => {
        setEditedExercise(exercise);
    }, [exercise]);
    
    if (!exercise || !editedExercise) return null;

    const handleSave = () => {
        if (isNew) onAddExercise(editedExercise as Omit<Exercise, 'id'>);
        else onUpdateExercise(editedExercise as Exercise);
        onClose();
    };

    const handleDelete = () => {
        if (!isNew && window.confirm(`Deseja deletar "${exercise.nome}"?`)) {
            onDeleteExercise((exercise as Exercise).id);
            onClose();
        }
    }
    
    const handleInputChange = (field: keyof Omit<Exercise, 'id'>, value: string | boolean) => {
        setEditedExercise(prev => prev ? {...prev, [field]: value} : null);
    };
    
    const inputClass = "w-full bg-black/40 text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-primary placeholder-gray-500";

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-surface-100/90 backdrop-blur-xl border border-white/10 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <IntegratedVideoPlayer
                        videoUrl={editedExercise.videoUrl || `https://www.youtube.com/watch?v=${editedExercise.videoId}`}
                        title={editedExercise.nome}
                        onClose={() => {}}
                        autoplay={true}
                    />
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {isAdmin ? (
                        <>
                           <input value={editedExercise.nome} onChange={e => handleInputChange('nome', e.target.value)} className={`${inputClass} text-2xl font-anton uppercase tracking-wide mb-4`} placeholder="NOME DO EXERCÍCIO" />
                           <div className="flex items-center gap-2 mb-4">
                               <label className="text-xs text-gray-400 uppercase font-bold">Conteúdo Elite:</label>
                               <input type="checkbox" checked={!!editedExercise.isElite} onChange={e => handleInputChange('isElite', e.target.checked)} className="w-5 h-5" />
                           </div>
                           <textarea value={editedExercise.descricao} onChange={e => handleInputChange('descricao', e.target.value)} className={`${inputClass} text-sm mb-6 min-h-[80px]`} placeholder="Descrição..." />
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div><label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">YouTube ID</label><input value={editedExercise.videoId} onChange={e => handleInputChange('videoId', e.target.value)} className={inputClass} /></div>
                                <div><label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Reps</label><input value={editedExercise.duracao} onChange={e => handleInputChange('duracao', e.target.value)} className={inputClass} /></div>
                           </div>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-3xl font-anton uppercase text-white tracking-wide">{editedExercise.nome}</h3>
                                {editedExercise.isElite && <span className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 px-3 py-1 rounded-full text-[10px] font-bold">ELITE</span>}
                            </div>
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed border-l-2 border-primary pl-4">{editedExercise.descricao}</p>
                        </>
                    )}
                </div>
                <div className="p-6 mt-auto border-t border-white/10 flex justify-between bg-black/20">
                    {isAdmin && !isNew && <button onClick={handleDelete} className="text-xs text-red-500 font-bold uppercase">Deletar</button>}
                    <div className="flex gap-4 ml-auto">
                        <button onClick={onClose} className="text-gray-400 text-xs font-bold uppercase">Fechar</button>
                        {isAdmin && <button onClick={handleSave} className="bg-primary text-white px-6 py-2 rounded-full font-anton uppercase text-sm">Salvar</button>}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    )
}

const ExerciseListItem: React.FC<{
  exercise: Exercise;
  isAdded: boolean;
  onToggleAdd: (exercise: Exercise) => void;
  onViewVideo: (exercise: Exercise) => void;
  canAccess: boolean;
}> = ({ exercise, isAdded, onToggleAdd, onViewVideo, canAccess }) => {
  return (
    <motion.div
      layout
      className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden group hover:bg-white/5 transition-all duration-300 relative"
    >
      {!canAccess && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-10 flex flex-col items-center justify-center p-4 text-center">
              <i className="fa-solid fa-crown text-yellow-500 text-2xl mb-2"></i>
              <p className="font-anton text-white uppercase text-xs">Acesso Elite</p>
              <p className="text-[10px] text-gray-400 mt-1">Upgrade necessário</p>
          </div>
      )}
      <div className="flex flex-col sm:flex-row">
          <div onClick={() => onViewVideo(exercise)} className="relative w-full sm:w-40 h-40 sm:h-auto cursor-pointer overflow-hidden">
              <img src={`https://img.youtube.com/vi/${exercise.videoId}/mqdefault.jpg`} alt={exercise.nome} className="w-full h-full object-cover opacity-80" />
              <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">{exercise.duracao}</div>
          </div>
          <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                  <h3 className="font-anton uppercase text-lg text-white group-hover:text-primary transition-colors line-clamp-1">{exercise.nome}</h3>
                  <div className="flex gap-2 mt-1">
                      <span className="text-[10px] text-gray-500 uppercase font-bold">{exercise.grupoMuscular}</span>
                      <span className="text-[10px] text-gray-500 uppercase font-bold">•</span>
                      <span className="text-[10px] text-gray-500 uppercase font-bold">{exercise.nivel}</span>
                  </div>
              </div>
              <button onClick={() => onToggleAdd(exercise)} className={`w-full py-2 rounded-lg font-anton uppercase text-xs mt-4 ${isAdded ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white hover:bg-primary'}`}>
                  {isAdded ? 'Remover' : 'Adicionar ao Treino'}
              </button>
          </div>
      </div>
    </motion.div>
  );
};

interface TreinosPageProps {
    exercises: Exercise[];
    userData: UserData;
    onUpdateExercise: (exercise: Exercise) => void;
    onAddExercise: (exercise: Omit<Exercise, 'id'>) => void;
    onDeleteExercise: (exerciseId: number) => void;
    isEditMode: boolean;
    uiTexts: UITexts;
    onUpdateUiText: (page: 'treinos', key: string, value: string) => void;
    onUpdateUserData: (updates: Partial<UserData>) => Promise<boolean>;
    onSendNotification: (message: string) => void;
    setActiveSection: (section: DashboardSection) => void;
}

const TreinosPage: React.FC<TreinosPageProps> = ({ exercises, userData, onUpdateExercise, onAddExercise, onDeleteExercise, isEditMode, uiTexts, onUpdateUiText, onUpdateUserData, onSendNotification, setActiveSection }) => {
    const [selectedExercise, setSelectedExercise] = useState<Exercise | Omit<Exercise, 'id'> | null>(null);
    const [addedExercises, setAddedExercises] = useState<Exercise[]>([]);
    
    const isAdmin = userData.role === 'admin';
    const canAccessElite = userData.role === 'elite' || userData.role === 'admin';

    const handleToggleExercise = (exercise: Exercise) => {
        if (exercise.isElite && !canAccessElite) return;
        setAddedExercises(prev => prev.some(e => e.id === exercise.id) ? prev.filter(e => e.id !== exercise.id) : [...prev, exercise]);
    };

    const handleAddToRoutine = async () => {
        const newRoutine = createManualRoutine([], addedExercises);
        const success = await onUpdateUserData({ routine: newRoutine });
        if (success) {
            onSendNotification('Exercícios adicionados!');
            setActiveSection('rotina');
        }
    };

    return (
        <div className="pb-32">
            <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-md -mx-4 px-4 py-3 flex items-center gap-3 border-b border-white/10 mb-6">
                <button onClick={() => setActiveSection('feed')} className="w-8 h-8 flex items-center justify-center bg-surface-100 rounded-full text-white hover:bg-primary transition-colors">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <span className="font-anton uppercase tracking-wider text-lg">Biblioteca de Treino</span>
            </div>
            
            {isAdmin && (
                <div className="mb-8 text-center">
                    <button onClick={() => setSelectedExercise(BLANK_EXERCISE)} className="bg-white/5 border border-white/10 hover:bg-primary text-white font-anton uppercase py-4 px-8 rounded-2xl text-sm">Novo Exercício Admin</button>
                </div>
            )}
            
            <div className="space-y-4">
                {exercises.map(exercise => (
                    <ExerciseListItem 
                        key={exercise.id}
                        exercise={exercise}
                        canAccess={!exercise.isElite || canAccessElite}
                        isAdded={addedExercises.some(e => e.id === exercise.id)}
                        onToggleAdd={handleToggleExercise}
                        onViewVideo={setSelectedExercise}
                    />
                ))}
            </div>

            <AnimatePresence>
                {addedExercises.length > 0 && (
                    <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-24 left-4 right-4 z-30 flex justify-center">
                         <button onClick={handleAddToRoutine} className="bg-primary text-white shadow-xl rounded-full px-8 py-3 font-anton uppercase text-sm flex items-center gap-3 pointer-events-auto">
                             <span className="bg-white text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{addedExercises.length}</span>
                             Gerar Plano de Treino
                         </button>
                    </motion.div>
                )}
                {selectedExercise && (
                    <ExerciseModal exercise={selectedExercise} onClose={() => setSelectedExercise(null)} isAdmin={isAdmin} onUpdateExercise={onUpdateExercise} onAddExercise={onAddExercise} onDeleteExercise={onDeleteExercise} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default TreinosPage;
