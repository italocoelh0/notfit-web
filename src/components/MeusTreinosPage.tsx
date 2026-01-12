
// components/MeusTreinosPage.tsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserData, Exercise, DailyRoutine, MuscleGroup } from '../types';

interface MeusTreinosPageProps {
    userData: UserData;
    onUpdateUserData: (updates: Partial<UserData>) => Promise<boolean>;
    exercises: Exercise[];
    onBack: () => void;
    onSendNotification: (message: string) => void;
}

const WEEK_DAYS = [
    { id: 1, label: 'Segunda-feira' },
    { id: 2, label: 'Terça-feira' },
    { id: 3, label: 'Quarta-feira' },
    { id: 4, label: 'Quinta-feira' },
    { id: 5, label: 'Sexta-feira' },
    { id: 6, label: 'Sábado' },
    { id: 7, label: 'Domingo' },
];

const MUSCLE_GROUPS: MuscleGroup[] = [
    'Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps', 'Abdômen', 'Cardio', 'Antebraço'
];

const MeusTreinosPage: React.FC<MeusTreinosPageProps> = ({ userData, onUpdateUserData, exercises, onBack, onSendNotification }) => {
    // Estado principal da montagem: dia -> lista de exercícios selecionados
    const [isBuilding, setIsBuilding] = useState(false);
    const [currentStep, setCurrentStep] = useState<'days' | 'config-day'>('days');
    const [editingDay, setEditingDay] = useState<number | null>(null);
    
    // Armazenamento temporário da rotina sendo montada
    const [tempRoutine, setTempRoutine] = useState<Record<number, Exercise[]>>({});
    const [selectedGroups, setSelectedGroups] = useState<MuscleGroup[]>([]);

    const hasRoutine = !!userData.routine;

    const handleStartBuilding = () => {
        setIsBuilding(true);
        setCurrentStep('days');
        // Inicializa com o que o usuário já tem, se houver
        if (userData.routine) {
            const initial: Record<number, Exercise[]> = {};
            userData.routine.dailyRoutines.slice(0, 7).forEach(day => {
                initial[day.day] = day.exercises;
            });
            setTempRoutine(initial);
        }
    };

    const handleOpenDayConfig = (dayId: number) => {
        setEditingDay(dayId);
        const existingEx = tempRoutine[dayId] || [];
        // Pré-seleciona os grupos baseados nos exercícios que já existem no dia
        const groups = Array.from(new Set(existingEx.map(e => e.grupoMuscular)));
        setSelectedGroups(groups as MuscleGroup[]);
        setCurrentStep('config-day');
    };

    const toggleGroup = (group: MuscleGroup) => {
        setSelectedGroups(prev => 
            prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
        );
    };

    const toggleExercise = (ex: Exercise) => {
        if (!editingDay) return;
        const currentList = tempRoutine[editingDay] || [];
        const isSelected = currentList.some(item => item.id === ex.id);
        
        const newList = isSelected 
            ? currentList.filter(item => item.id !== ex.id)
            : [...currentList, ex];
            
        setTempRoutine({ ...tempRoutine, [editingDay]: newList });
    };

    const filteredExercises = useMemo(() => {
        if (selectedGroups.length === 0) return [];
        return exercises.filter(ex => selectedGroups.includes(ex.grupoMuscular));
    }, [selectedGroups, exercises]);

    const handleSaveFullRoutine = async () => {
        // Criar estrutura de 30 dias baseada no ciclo de 7 dias montado
        const dailyRoutines: DailyRoutine[] = [];
        for (let i = 1; i <= 30; i++) {
            const dayOfWeek = ((i - 1) % 7) + 1;
            dailyRoutines.push({
                day: i,
                breakfast: null,
                lunch: null,
                dinner: null,
                snack: null,
                exercises: tempRoutine[dayOfWeek] || []
            });
        }

        const success = await onUpdateUserData({
            routine: {
                type: 'manual',
                startDate: new Date().toISOString(),
                duration: 30,
                dailyRoutines
            }
        });

        if (success) {
            onSendNotification("Sua nova rotina de treinos foi salva!");
            setIsBuilding(false);
        }
    };

    if (isBuilding) {
        return (
            <div className="fixed inset-0 bg-black z-[100] flex flex-col overflow-hidden">
                {/* Header Dinâmico */}
                <div className="p-6 pt-safe border-b border-white/10 flex justify-between items-center bg-surface-100">
                    <div>
                        {currentStep === 'days' ? (
                            <>
                                <h2 className="font-anton text-2xl text-white uppercase tracking-wide">Minha Semana</h2>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Toque no dia para editar</p>
                            </>
                        ) : (
                            <>
                                <h2 className="font-anton text-2xl text-white uppercase tracking-wide">
                                    {WEEK_DAYS.find(d => d.id === editingDay)?.label}
                                </h2>
                                <p className="text-[10px] text-primary uppercase font-bold tracking-widest">Passo: Grupos e Exercícios</p>
                            </>
                        )}
                    </div>
                    <button 
                        onClick={() => currentStep === 'days' ? setIsBuilding(false) : setCurrentStep('days')} 
                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white"
                    >
                        <i className={`fa-solid ${currentStep === 'days' ? 'fa-times' : 'fa-chevron-left'}`}></i>
                    </button>
                </div>

                {/* Passo 1: Lista de Dias */}
                {currentStep === 'days' && (
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {WEEK_DAYS.map(day => {
                            const dayExCount = tempRoutine[day.id]?.length || 0;
                            return (
                                <button
                                    key={day.id}
                                    onClick={() => handleOpenDayConfig(day.id)}
                                    className="w-full bg-surface-100/50 border border-white/5 p-5 rounded-2xl flex items-center gap-5 hover:bg-surface-200 transition-all text-left group"
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-anton text-xl border transition-colors
                                        ${dayExCount > 0 ? 'bg-primary border-primary text-white' : 'bg-black/20 border-white/10 text-gray-600'}`}>
                                        {day.id}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-bold text-base">{day.label}</p>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                                            {dayExCount > 0 ? `${dayExCount} Exercícios selecionados` : 'Toque para montar este dia'}
                                        </p>
                                    </div>
                                    <i className="fa-solid fa-chevron-right text-gray-700 group-hover:text-white transition-colors"></i>
                                </button>
                            );
                        })}
                        
                        <div className="pt-4 pb-10">
                            <button
                                onClick={handleSaveFullRoutine}
                                className="w-full bg-gradient-to-r from-primary to-orange-600 text-white font-anton uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-primary/20"
                            >
                                Finalizar Montagem
                            </button>
                        </div>
                    </div>
                )}

                {/* Passo 2: Configuração do Dia (Grupos + Exercícios com Vídeo) */}
                {currentStep === 'config-day' && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Seletor de Grupos (Chips) */}
                        <div className="p-4 border-b border-white/5 bg-black/20">
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-3">Selecione os grupos para este dia:</p>
                            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                                {MUSCLE_GROUPS.map(group => (
                                    <button
                                        key={group}
                                        onClick={() => toggleGroup(group)}
                                        className={`flex-shrink-0 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all
                                        ${selectedGroups.includes(group) 
                                            ? 'bg-primary border-primary text-white' 
                                            : 'bg-white/5 border-white/10 text-gray-500'}`}
                                    >
                                        {group}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Lista de Exercícios com Vídeos */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {selectedGroups.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 px-10">
                                    <i className="fa-solid fa-hand-pointer text-4xl mb-4"></i>
                                    <p className="font-anton uppercase tracking-wide">Selecione um grupo acima</p>
                                    <p className="text-xs mt-1">Escolha o que deseja treinar para ver os vídeos dos exercícios disponíveis.</p>
                                </div>
                            ) : (
                                filteredExercises.map(ex => {
                                    const isSelected = tempRoutine[editingDay!]?.some(item => item.id === ex.id);
                                    return (
                                        <div 
                                            key={ex.id}
                                            className={`relative overflow-hidden rounded-3xl border transition-all duration-300 ${isSelected ? 'bg-primary/10 border-primary' : 'bg-surface-100 border-white/5'}`}
                                        >
                                            <div className="flex gap-4 p-3">
                                                {/* Video Thumbnail Area */}
                                                <div className="w-32 h-24 rounded-2xl overflow-hidden bg-black flex-shrink-0 relative group">
                                                    <img 
                                                        src={`https://img.youtube.com/vi/${ex.videoId}/mqdefault.jpg`} 
                                                        alt="" 
                                                        className="w-full h-full object-cover opacity-60"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <a 
                                                            href={`https://youtube.com/watch?v=${ex.videoId}`} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg"
                                                        >
                                                            <i className="fa-solid fa-play text-[10px] ml-0.5"></i>
                                                        </a>
                                                    </div>
                                                </div>

                                                <div className="flex-1 py-1">
                                                    <h4 className="font-bold text-white text-sm leading-tight mb-1">{ex.nome}</h4>
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{ex.grupoMuscular} • {ex.duracao}</p>
                                                    
                                                    <button 
                                                        onClick={() => toggleExercise(ex)}
                                                        className={`mt-3 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all
                                                        ${isSelected 
                                                            ? 'bg-primary text-white' 
                                                            : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'}`}
                                                    >
                                                        {isSelected ? 'Selecionado' : 'Adicionar'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Botão Concluir Dia */}
                        <div className="p-4 bg-surface-100 border-t border-white/10 safe-area-bottom">
                             <button 
                                onClick={() => setCurrentStep('days')}
                                className="w-full bg-white text-black font-anton uppercase tracking-widest py-4 rounded-xl"
                             >
                                Concluir {WEEK_DAYS.find(d => d.id === editingDay)?.label.split('-')[0]}
                             </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="pb-24">
            <div className="flex items-center gap-3 mb-8">
                <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-surface-100 rounded-full text-white">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <h2 className="font-anton text-2xl text-white uppercase tracking-wide">Meus Treinos</h2>
            </div>

            {!hasRoutine ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 animate-pulse">
                        <i className="fa-solid fa-dumbbell text-4xl text-gray-600"></i>
                    </div>
                    <h3 className="font-anton text-2xl text-white uppercase mb-2">Montar meu treino</h3>
                    <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                        Personalize sua rotina semanal escolhendo seus exercícios favoritos por vídeo.
                    </p>
                    <button 
                        onClick={handleStartBuilding}
                        className="w-full bg-primary text-white font-anton uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-primary/20"
                    >
                        Montar Meus Treinos
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-surface-200 to-surface-100 rounded-3xl p-6 border border-white/10">
                        <h3 className="font-anton text-white text-xl uppercase mb-4 flex items-center gap-2">
                            <i className="fa-solid fa-calendar-check text-primary"></i> Sua Divisão Atual
                        </h3>
                        <div className="space-y-3">
                            {WEEK_DAYS.map(day => {
                                const dayRoutine = userData.routine?.dailyRoutines.find(r => r.day === day.id);
                                const exercises = dayRoutine?.exercises || [];
                                const groups = Array.from(new Set(exercises.map(e => e.grupoMuscular))).join(', ');
                                
                                return (
                                    <div key={day.id} className="flex justify-between items-start py-3 border-b border-white/5 last:border-0 gap-4">
                                        <span className="text-xs font-bold text-gray-500 uppercase">{day.label.split('-')[0]}</span>
                                        <span className={`text-xs font-anton uppercase text-right ${exercises.length === 0 ? 'text-gray-600' : 'text-white'}`}>
                                            {exercises.length === 0 ? 'Descanso' : groups}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <button 
                        onClick={handleStartBuilding}
                        className="w-full bg-white/5 border border-white/10 hover:border-primary text-white font-anton uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-3"
                    >
                        <i className="fa-solid fa-rotate"></i>
                        Montar Novo Treino
                    </button>
                </div>
            )}
        </div>
    );
};

export default MeusTreinosPage;
