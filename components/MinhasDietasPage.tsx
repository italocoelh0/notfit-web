
// components/MinhasDietasPage.tsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserData, Recipe, DailyRoutine } from '../types';

interface MinhasDietasPageProps {
    userData: UserData;
    onUpdateUserData: (updates: Partial<UserData>) => Promise<boolean>;
    recipes: Recipe[];
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

const MEALS = [
    { id: 'breakfast', label: 'Café da Manhã', icon: '☕' },
    { id: 'lunch', label: 'Almoço', icon: '🍽️' },
    { id: 'snack', label: 'Lanche', icon: '🍎' },
    { id: 'dinner', label: 'Jantar', icon: '🌙' },
];

const MinhasDietasPage: React.FC<MinhasDietasPageProps> = ({ userData, onUpdateUserData, recipes, onBack, onSendNotification }) => {
    const [isBuilding, setIsBuilding] = useState(true); // Inicia direto no modo edição para novas
    const [currentStep, setCurrentStep] = useState<'days' | 'config-day' | 'recipe-selector'>('days');
    const [editingDay, setEditingDay] = useState<number | null>(null);
    const [editingMeal, setEditingMeal] = useState<string | null>(null);
    
    // Armazenamento temporário da dieta sendo montada: dia -> refeicao -> receita
    const [tempDiet, setTempDiet] = useState<Record<number, Record<string, Recipe | null>>>({});
    const [search, setSearch] = useState('');

    const handleOpenDayConfig = (dayId: number) => {
        setEditingDay(dayId);
        setCurrentStep('config-day');
    };

    const handleOpenRecipeSelector = (mealId: string) => {
        setEditingMeal(mealId);
        setCurrentStep('recipe-selector');
    };

    const selectRecipe = (recipe: Recipe) => {
        if (!editingDay || !editingMeal) return;
        
        const dayData = tempDiet[editingDay] || {};
        const newDayData = { ...dayData, [editingMeal]: recipe };
        
        setTempDiet({ ...tempDiet, [editingDay]: newDayData });
        setCurrentStep('config-day');
        setEditingMeal(null);
    };

    const filteredRecipes = useMemo(() => {
        return recipes.filter(r => r.nome.toLowerCase().includes(search.toLowerCase()) || r.categoria.toLowerCase().includes(search.toLowerCase()));
    }, [recipes, search]);

    const handleSaveFullDiet = async () => {
        const dailyRoutines: DailyRoutine[] = [];
        for (let i = 1; i <= 30; i++) {
            const dayOfWeek = ((i - 1) % 7) + 1;
            const dData = tempDiet[dayOfWeek] || {};
            dailyRoutines.push({
                day: i,
                breakfast: dData.breakfast || null,
                lunch: dData.lunch || null,
                dinner: dData.dinner || null,
                snack: dData.snack || null,
                exercises: []
            });
        }

        const success = await onUpdateUserData({
            routine: {
                id: `diet_${Date.now()}`,
                title: 'Meu Plano Alimentar',
                type: 'manual',
                startDate: new Date().toISOString(),
                duration: 30,
                dailyRoutines
            }
        });

        if (success) {
            onSendNotification("Sua nova dieta foi salva!");
            onBack();
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 pt-safe border-b border-white/10 flex justify-between items-center bg-surface-100">
                <div>
                    <h2 className="font-anton text-2xl text-white uppercase tracking-wide">
                        {currentStep === 'days' ? 'Montar Dieta' : currentStep === 'config-day' ? WEEK_DAYS.find(d => d.id === editingDay)?.label : 'Selecionar Receita'}
                    </h2>
                    <p className="text-[10px] text-green-500 uppercase font-bold tracking-widest">
                        {currentStep === 'days' ? 'Ciclo Semanal' : currentStep === 'config-day' ? 'Toque na refeição' : editingMeal}
                    </p>
                </div>
                <button 
                    onClick={() => {
                        if (currentStep === 'days') onBack();
                        else if (currentStep === 'config-day') setCurrentStep('days');
                        else setCurrentStep('config-day');
                    }} 
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white"
                >
                    <i className={`fa-solid ${currentStep === 'days' ? 'fa-times' : 'fa-chevron-left'}`}></i>
                </button>
            </div>

            {/* Passo 1: Dias da Semana */}
            {currentStep === 'days' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {WEEK_DAYS.map(day => {
                        const dayMeals = tempDiet[day.id];
                        const count = dayMeals ? Object.values(dayMeals).filter(Boolean).length : 0;
                        return (
                            <button
                                key={day.id}
                                onClick={() => handleOpenDayConfig(day.id)}
                                className="w-full bg-surface-100/50 border border-white/5 p-5 rounded-2xl flex items-center gap-5 hover:bg-surface-200 transition-all text-left"
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-anton text-xl border ${count > 0 ? 'bg-green-500 border-green-500 text-white' : 'bg-black/20 border-white/10 text-gray-600'}`}>
                                    {day.id}
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-bold text-base">{day.label}</p>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5">
                                        {count > 0 ? `${count} Refeições planejadas` : 'Vazio'}
                                    </p>
                                </div>
                                <i className="fa-solid fa-chevron-right text-gray-700"></i>
                            </button>
                        );
                    })}
                    <div className="pt-4 pb-10">
                        <button onClick={handleSaveFullDiet} className="w-full bg-green-600 text-white font-anton uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-green-900/20">
                            Salvar Dieta Completa
                        </button>
                    </div>
                </div>
            )}

            {/* Passo 2: Refeições do Dia */}
            {currentStep === 'config-day' && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {MEALS.map(meal => {
                        const selected = tempDiet[editingDay!]?.[meal.id];
                        return (
                            <div 
                                key={meal.id}
                                onClick={() => handleOpenRecipeSelector(meal.id)}
                                className="bg-surface-100 border border-white/5 p-5 rounded-3xl flex items-center gap-5 cursor-pointer hover:bg-surface-200 transition-all"
                            >
                                <div className="w-14 h-14 bg-black/20 rounded-2xl flex items-center justify-center text-3xl border border-white/5">
                                    {selected ? selected.icon : meal.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-0.5">{meal.label}</p>
                                    <h4 className={`text-base font-bold ${selected ? 'text-green-500' : 'text-white/30 italic'}`}>
                                        {selected ? selected.nome : 'Toque para escolher...'}
                                    </h4>
                                </div>
                                <i className="fa-solid fa-plus-circle text-gray-700"></i>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Passo 3: Seletor de Receita */}
            {currentStep === 'recipe-selector' && (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-white/5">
                        <div className="relative">
                            <i className="fa-solid fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"></i>
                            <input 
                                type="text" 
                                value={search} 
                                onChange={e => setSearch(e.target.value)} 
                                placeholder="Pesquisar receita..." 
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                        {filteredRecipes.map(recipe => (
                            <div 
                                key={recipe.id}
                                onClick={() => selectRecipe(recipe)}
                                className="bg-surface-100 p-4 rounded-2xl border border-white/5 flex items-center gap-4 cursor-pointer hover:bg-white/5"
                            >
                                <div className="text-3xl">{recipe.icon}</div>
                                <div className="flex-1">
                                    <h4 className="text-white font-bold text-sm">{recipe.nome}</h4>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">{recipe.categoria}</p>
                                </div>
                                <i className="fa-solid fa-check text-green-500 opacity-0 group-hover:opacity-100"></i>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MinhasDietasPage;
