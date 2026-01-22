


import React, { useState } from 'react';
import { Exercise, UITexts } from '../types';
import EditableField from '../components/EditableField';

interface ExerciseCardProps {
  exercise: Exercise;
  isSelected: boolean;
  onSelect: (exercise: Exercise) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, isSelected, onSelect }) => {
    // Determinar a URL do thumbnail
    const getThumbnailUrl = () => {
        if (exercise.videoUrl) {
            // Para vídeos diretos, não temos thumbnail específico
            return '/api/placeholder/320/180';
        }
        // Thumbnail do YouTube
        return `https://img.youtube.com/vi/${exercise.videoId}/hqdefault.jpg`;
    };

    return (
    <div
        onClick={() => onSelect(exercise)}
        className={`bg-surface-100 rounded-lg overflow-hidden border-2 cursor-pointer transition-all duration-300 hover:border-surface-300
        ${isSelected ? 'border-primary' : 'border-surface-200'}`}
    >
        <div className="aspect-video bg-black relative">
            <img src={getThumbnailUrl()} alt={exercise.nome} className="w-full h-full object-cover"/>
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              {isSelected && (
                <div className="absolute top-2 right-2 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                    <i className="fa-solid fa-check"></i>
                </div>
            )}
        </div>
        <div className="p-4">
            <h3 className="font-semibold text-base mb-2 text-on-surface truncate">{exercise.nome}</h3>
            <div className="flex flex-wrap gap-2 text-xs font-medium">
                <span className="bg-surface-200 text-on-surface-secondary px-2.5 py-1 rounded-full">{exercise.nivel}</span>
                <span className="bg-surface-200 text-on-surface-secondary px-2.5 py-1 rounded-full">{exercise.duracao}</span>
            </div>
        </div>
    </div>
    );
};


interface ExerciseSelectionPageProps {
  onExerciseSelectionSuccess: (exercises: Exercise[]) => void;
  exercises: Exercise[];
  isEditMode: boolean;
  uiTexts: UITexts;
  onUpdateUiText: (page: 'exerciseSelection', key: string, value: string) => void;
}

const ExerciseSelectionPage: React.FC<ExerciseSelectionPageProps> = ({ onExerciseSelectionSuccess, exercises, isEditMode, uiTexts, onUpdateUiText }) => {
    const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
    const texts = uiTexts.exerciseSelection;

    const handleSelectExercise = (exercise: Exercise) => {
        setSelectedExercises(prev => 
            prev.find(e => e.id === exercise.id) 
            ? prev.filter(e => e.id !== exercise.id) 
            : [...prev, exercise]
        );
    };

    return (
        <div className="min-h-screen p-4 pb-32 bg-background">
            <div className="container mx-auto max-w-6xl">
                 <div className="text-center mb-8 p-4">
                    <EditableField as="h1" isEditing={isEditMode} value={texts.title} onChange={v => onUpdateUiText('exerciseSelection', 'title', v)} className="text-3xl font-bold mb-2" />
                    <EditableField as="p" isEditing={isEditMode} value={texts.subtitle} onChange={v => onUpdateUiText('exerciseSelection', 'subtitle', v)} className="text-on-surface-secondary mb-4" />
                     <div className="inline-block bg-surface-100 text-on-surface font-semibold px-4 py-2 rounded-full text-sm">
                        <span>{selectedExercises.length}</span> <EditableField as="span" isEditing={isEditMode} value={texts.counterText} onChange={v => onUpdateUiText('exerciseSelection', 'counterText', v)} />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {exercises.map(exercise => (
                        <ExerciseCard 
                            key={exercise.id}
                            exercise={exercise}
                            isSelected={selectedExercises.some(e => e.id === exercise.id)}
                            onSelect={handleSelectExercise}
                        />
                    ))}
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm flex justify-center border-t border-surface-200">
                    <button 
                        onClick={() => onExerciseSelectionSuccess(selectedExercises)}
                        disabled={selectedExercises.length === 0}
                        className="bg-primary text-on-primary font-semibold py-3 px-12 rounded-md text-base transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                         <EditableField as="span" isEditing={isEditMode} value={texts.submitButton} onChange={v => onUpdateUiText('exerciseSelection', 'submitButton', v)} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExerciseSelectionPage;