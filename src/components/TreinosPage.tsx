
import React, { useState, useMemo, useEffect } from 'react';
import { Exercise, MuscleGroup, ExerciseCategory, UITexts, ExerciseLevel, UserData, DashboardSection } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import EditableField from './EditableField';
import { createManualRoutine } from '@lib/routineService';

const BLANK_EXERCISE: Omit<Exercise, 'id'> = {
    nome: "Novo Exercício",
    videoId: "dQw4w9WgXcQ",
    descricao: "Descrição do novo exercício.",
    nivel: "Iniciante",
    duracao: "3x 15",
    calorias: "~5 cal/min",
    grupoMuscular: "Peito",
    categoria: 'Musculação',
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
        if (isNew) {
            onAddExercise(editedExercise as Omit<Exercise, 'id'>);
        } else {
            onUpdateExercise(editedExercise as Exercise);
        }
        onClose();
    };

    const handleDelete = () => {
        if (!isNew && window.confirm(`Tem certeza que deseja deletar o exercício "${exercise.nome}"?`)) {
            onDeleteExercise((exercise as Exercise).id);
            onClose();
        }
    }
    
    const handleInputChange = (field: keyof Omit<Exercise, 'id'>, value: string) => {
        setEditedExercise(prev => prev ? {...prev, [field]: value} : null);
    };
    
    const inputClass = "w-full bg-black/40 text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-gray-500";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-surface-100/90 backdrop-blur-xl border border-white/10 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
                <div className="aspect-video bg-black relative">
                     <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${editedExercise.videoId}?autoplay=1&modestbranding=1&rel=0&controls=0`}
                        title={editedExercise.nome}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="border-0"
                    ></iframe>
                    <div className="absolute inset-0 pointer-events-none border-b border-white/10"></div>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {isAdmin ? (
                        <>
                           <input value={editedExercise.nome} onChange={e => handleInputChange('nome', e.target.value)} className={`${inputClass} text-2xl font-anton uppercase tracking-wide mb-4`} placeholder="NOME DO EXERCÍCIO" />
                           <textarea value={editedExercise.descricao} onChange={e => handleInputChange('descricao', e.target.value)} className={`${inputClass} text-sm mb-6 min-h-[80px]`} placeholder="Descrição..." />
                           
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div><label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Nível</label><input value={editedExercise.nivel} onChange={e => handleInputChange('nivel', e.target.value)} className={inputClass} /></div>
                                <div><label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Séries/Reps</label><input value={editedExercise.duracao} onChange={e => handleInputChange('duracao', e.target.value)} className={inputClass} /></div>
                                <div><label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Calorias</label><input value={editedExercise.calorias} onChange={e => handleInputChange('calorias', e.target.value)} className={inputClass} /></div>
                                <div><label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-1">YouTube ID</label><input value={editedExercise.videoId} onChange={e => handleInputChange('videoId', e.target.value)} className={inputClass} /></div>
                           </div>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-3xl font-anton uppercase text-white tracking-wide">{editedExercise.nome}</h3>
                                <div className="bg-primary/20 border border-primary/30 px-3 py-1 rounded-full">
                                    <span className="text-primary text-xs font-bold uppercase tracking-wider">{editedExercise.duracao}</span>
                                </div>
                            </div>
                            
                            <p className="text-gray-400 text-sm mb-6 leading-relaxed border-l-2 border-primary/50 pl-4">{editedExercise.descricao}</p>
                            
                            <div className="flex flex-wrap gap-3">
                                <div className="px-4 py-2 rounded-lg bg-black/30 border border-white/5 text-xs text-gray-300 flex items-center gap-2">
                                    <i className="fa-solid fa-layer-group text-primary"></i> {editedExercise.nivel}
                                </div>
                                <div className="px-4 py-2 rounded-lg bg-black/30 border border-white/5 text-xs text-gray-300 flex items-center gap-2">
                                    <i className="fa-solid fa-fire text-primary"></i> {editedExercise.calorias}
                                </div>
                                <div className="px-4 py-2 rounded-lg bg-black/30 border border-white/5 text-xs text-gray-300 flex items-center gap-2">
                                    <i className="fa-solid fa-dumbbell text-primary"></i> {editedExercise.grupoMuscular}
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <div className="p-6 mt-auto border-t border-white/10 flex justify-between items-center bg-black/20">
                    <div>
                        {isAdmin && !isNew && <button onClick={handleDelete} className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-widest">Deletar</button>}
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest px-4 py-2">Fechar</button>
                        {isAdmin && <button onClick={handleSave} className="bg-primary text-white px-6 py-2 rounded-full font-anton uppercase tracking-wider text-sm hover:bg-primary-hover shadow-lg shadow-primary/20">Salvar</button>}
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
}> = ({ exercise, isAdded, onToggleAdd, onViewVideo }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden group hover:bg-white/5 hover:border-white/20 transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row">
          {/* Thumbnail Section */}
          <div 
            onClick={() => onViewVideo(exercise)}
            className="relative w-full sm:w-40 h-40 sm:h-auto cursor-pointer overflow-hidden"
          >
              <img 
                src={`https://img.youtube.com/vi/${exercise.videoId}/mqdefault.jpg`} 
                alt={exercise.nome} 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" 
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 bg-primary/90 rounded-full flex items-center justify-center text-white shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
                      <i className="fa-solid fa-play ml-1"></i>
                  </div>
              </div>
              <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  {exercise.duracao}
              </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                  <div className="flex justify-between items-start">
                      <h3 className="font-anton uppercase text-lg text-white tracking-wide group-hover:text-primary transition-colors mb-1 line-clamp-1">
                          {exercise.nome}
                      </h3>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3">{exercise.descricao}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-gray-300 uppercase tracking-wider">
                          {exercise.grupoMuscular}
                      </span>
                      <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-gray-300 uppercase tracking-wider">
                          {exercise.nivel}
                      </span>
                  </div>
              </div>

              <button 
                onClick={() => onToggleAdd(exercise)} 
                className={`w-full py-2 rounded-lg font-anton uppercase tracking-wider text-xs transition-all duration-300 flex items-center justify-center gap-2
                ${isAdded 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' 
                    : 'bg-white/10 text-white border border-white/20 hover:bg-primary hover:border-primary hover:shadow-[0_0_15px_rgba(252,82,0,0.3)]'
                }`}
              >
                  <i className={`fa-solid ${isAdded ? 'fa-minus' : 'fa-plus'}`}></i>
                  {isAdded ? 'Remover' : 'Adicionar ao Treino'}
              </button>
          </div>
      </div>
    </motion.div>
  );
};


interface TreinosPageProps {
    exercises: Exercise[];
    isAdmin: boolean;
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

const muscleGroupFilters = ['Peito', 'Dorsal', 'Bíceps', 'Tríceps', 'Inferiores', 'Ombros', 'Abdômen', 'Antebraço'];
const categoryFilters: ExerciseCategory[] = ['Musculação', 'Aeróbico', 'Funcional', 'Alongamento', 'Em casa', 'Mobilidade', 'Elástico', 'MAT Pilates', 'Laboral'];
const levelFilters: ExerciseLevel[] = ['Iniciante', 'Intermediário', 'Avançado'];

const groupMapping: { [key: string]: MuscleGroup } = {
    'Dorsal': 'Costas',
    'Inferiores': 'Pernas'
};

const FilterDropdown: React.FC<{ title: string, options: string[], selected: string[], onToggle: (option: string) => void }> = ({ title, options, selected, onToggle }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className={`px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wider border transition-all ${selected.length > 0 ? 'bg-primary/20 border-primary text-white' : 'bg-black/40 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'}`}
            >
                {title} {selected.length > 0 && <span className="bg-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{selected.length}</span>}
                <i className={`fa-solid fa-chevron-down text-[10px] transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10, scale: 0.95 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        exit={{ opacity: 0, y: -10, scale: 0.95 }} 
                        className="absolute top-full mt-2 w-48 bg-surface-100/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-30 p-2 space-y-1 overflow-hidden"
                    >
                        {options.map(option => (
                            <button 
                                key={option} 
                                onClick={() => onToggle(option)} 
                                className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg transition-colors uppercase tracking-wide ${selected.includes(option) ? 'bg-primary text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'}`}
                            >
                                {option}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const TreinosPage: React.FC<TreinosPageProps> = ({ exercises, isAdmin, onUpdateExercise, onAddExercise, onDeleteExercise, isEditMode, uiTexts, onUpdateUiText, onUpdateUserData, onSendNotification, setActiveSection }) => {
    const [selectedExercise, setSelectedExercise] = useState<Exercise | Omit<Exercise, 'id'> | null>(null);
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<ExerciseCategory[]>([]);
    const [selectedLevels, setSelectedLevels] = useState<ExerciseLevel[]>([]);
    const [addedExercises, setAddedExercises] = useState<Exercise[]>([]);
    const [isAddedListVisible, setIsAddedListVisible] = useState(false);
    const texts = uiTexts.treinos;

    const handleToggleGroup = (group: string) => {
        setSelectedGroups(prev => prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]);
    };
    const handleToggleCategory = (category: string) => {
        setSelectedCategories(prev => prev.includes(category as ExerciseCategory) ? prev.filter(c => c !== category) : [...prev, category as ExerciseCategory]);
    };
    const handleToggleLevel = (level: string) => {
        setSelectedLevels(prev => prev.includes(level as ExerciseLevel) ? prev.filter(l => l !== level) : [...prev, level as ExerciseLevel]);
    };
    const handleClearFilters = () => {
        setSelectedGroups([]);
        setSelectedCategories([]);
        setSelectedLevels([]);
    };
    
    const handleToggleExercise = (exercise: Exercise) => {
        setAddedExercises(prev => {
            const isAdded = prev.some(e => e.id === exercise.id);
            if (isAdded) {
                return prev.filter(e => e.id !== exercise.id);
            } else {
                return [...prev, exercise];
            }
        });
    };

    const handleAddToRoutine = async () => {
        if (addedExercises.length === 0) return;

        const newRoutine = createManualRoutine([], addedExercises);
        const success = await onUpdateUserData({ routine: newRoutine });

        if (success) {
            onSendNotification('Exercícios adicionados à sua rotina!');
            setAddedExercises([]);
            setIsAddedListVisible(false);
            setActiveSection('rotina');
        } else {
            onSendNotification('Ocorreu um erro ao salvar sua rotina.');
        }
    };

    const filteredExercises = useMemo(() => {
        if (selectedGroups.length === 0 && selectedCategories.length === 0 && selectedLevels.length === 0) {
            return exercises;
        }
        return exercises.filter(ex => {
            const groupMatch = selectedGroups.length === 0 || selectedGroups.some(g => (groupMapping[g] || g) === ex.grupoMuscular);
            const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(ex.categoria);
            const levelMatch = selectedLevels.length === 0 || selectedLevels.includes(ex.nivel);
            return groupMatch && categoryMatch && levelMatch;
        });
    }, [exercises, selectedGroups, selectedCategories, selectedLevels]);

    const handleOpenModal = (exercise: Exercise) => { setSelectedExercise(exercise); };
    const handleAddNewExercise = () => { setSelectedExercise(BLANK_EXERCISE); };
    const handleCloseModal = () => { setSelectedExercise(null); };

    return (
        <div className="pb-32">
            {/* Header de navegação interno */}
            <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-md -mx-4 px-4 py-3 flex items-center gap-3 border-b border-white/10">
                <button onClick={() => setActiveSection('rotina')} className="w-8 h-8 flex items-center justify-center bg-surface-100 rounded-full text-white hover:bg-primary hover:text-white transition-colors">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <span className="font-anton uppercase tracking-wider text-lg">Plano de Treino</span>
            </div>

             {/* Filters Header */}
            <div className="sticky top-[calc(4rem+52px)] z-20 py-4 bg-background/80 backdrop-blur-md mb-6 -mx-4 px-4 border-b border-white/5">
                 <div className="flex flex-wrap gap-3 justify-center items-center">
                    <FilterDropdown title="Grupos" options={muscleGroupFilters} selected={selectedGroups} onToggle={handleToggleGroup} />
                    <FilterDropdown title="Categorias" options={categoryFilters} selected={selectedCategories} onToggle={handleToggleCategory} />
                    <FilterDropdown title="Nível" options={levelFilters} selected={selectedLevels} onToggle={handleToggleLevel} />
                    {(selectedGroups.length > 0 || selectedCategories.length > 0 || selectedLevels.length > 0) && (
                        <button onClick={handleClearFilters} className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/20 transition-colors">
                            <i className="fa-solid fa-times" />
                            Limpar
                        </button>
                    )}
                 </div>
            </div>
            
            {isAdmin && isEditMode && (
                <div className="mb-8 text-center">
                    <button 
                        onClick={handleAddNewExercise} 
                        className="bg-white/5 border border-white/10 hover:bg-primary hover:border-primary text-white font-anton uppercase tracking-widest py-4 px-8 rounded-2xl text-sm transition-all duration-300 group"
                    >
                        <i className="fa-solid fa-plus mr-2 group-hover:rotate-90 transition-transform duration-300"></i> 
                        Adicionar Exercício
                    </button>
                </div>
            )}
            
            {filteredExercises.length > 0 ? (
                <div className="space-y-4">
                    {filteredExercises.map(exercise => (
                        <ExerciseListItem 
                            key={exercise.id}
                            exercise={exercise}
                            isAdded={addedExercises.some(e => e.id === exercise.id)}
                            onToggleAdd={handleToggleExercise}
                            onViewVideo={handleOpenModal}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 opacity-50">
                    <i className="fa-solid fa-dumbbell text-4xl mb-4 block"></i>
                    <p className="font-anton uppercase text-xl text-gray-500 tracking-wide">Nenhum treino encontrado</p>
                </div>
            )}
            
            <AnimatePresence>
                {addedExercises.length > 0 && (
                    <motion.div
                        initial={{ y: 100 }}
                        animate={{ y: 0 }}
                        exit={{ y: 100 }}
                        className="fixed bottom-24 left-4 right-4 z-30 flex justify-center pointer-events-none"
                    >
                         <button 
                            onClick={() => setIsAddedListVisible(true)} 
                            className="pointer-events-auto bg-primary text-white shadow-[0_0_30px_rgba(252,82,0,0.5)] rounded-full px-6 py-3 flex items-center gap-3 font-anton uppercase tracking-wider text-sm hover:scale-105 transition-transform"
                        >
                             <span className="bg-white text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{addedExercises.length}</span>
                             Finalizar Seleção
                             <i className="fa-solid fa-arrow-right"></i>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isAddedListVisible && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex flex-col justify-end"
                        onClick={() => setIsAddedListVisible(false)}
                    >
                        <motion.div
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            className="bg-surface-100/95 border-t border-white/10 rounded-t-3xl max-h-[70vh] flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-white/10 flex-shrink-0 text-center">
                                <h3 className="font-anton uppercase text-xl tracking-wide">Seus Exercícios</h3>
                                <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{addedExercises.length} selecionados</p>
                            </div>
                            
                            <div className="overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {addedExercises.map(exercise => (
                                    <div key={exercise.id} className="bg-black/40 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <img src={`https://img.youtube.com/vi/${exercise.videoId}/mqdefault.jpg`} alt={exercise.nome} className="w-16 h-12 rounded-lg object-cover opacity-80" />
                                            <div>
                                                <p className="font-bold text-sm text-white">{exercise.nome}</p>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{exercise.grupoMuscular}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleToggleExercise(exercise)} className="text-red-500 hover:text-red-400 transition-colors w-8 h-8 flex items-center justify-center">
                                            <i className="fa-solid fa-times text-lg"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                             <div className="p-6 mt-auto border-t border-white/10 bg-black/20 safe-area-bottom">
                                <button
                                    onClick={handleAddToRoutine}
                                    disabled={addedExercises.length === 0}
                                    className="w-full bg-primary text-white font-anton uppercase tracking-widest text-sm py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Criar Rotina Agora
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedExercise && (
                    <ExerciseModal 
                        exercise={selectedExercise} 
                        onClose={handleCloseModal}
                        isAdmin={isAdmin && isEditMode}
                        onUpdateExercise={onUpdateExercise}
                        onAddExercise={onAddExercise}
                        onDeleteExercise={onDeleteExercise}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default TreinosPage;
