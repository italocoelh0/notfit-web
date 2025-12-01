


import React, { useState, useMemo } from 'react';
import { Recipe, UITexts } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import EditableField from '../components/EditableField';

interface RecipeCardProps {
  recipe: Recipe;
  isSelected: boolean;
  onSelect: (recipe: Recipe) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, isSelected, onSelect }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        onClick={() => onSelect(recipe)}
        className={`bg-surface-100 rounded-lg p-4 border-2 cursor-pointer transition-all duration-300 relative overflow-hidden hover:border-surface-300
        ${isSelected ? 'border-primary' : 'border-surface-200'}`}
    >
        {isSelected && (
            <div className="absolute top-2 right-2 bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                <i className="fa-solid fa-check"></i>
            </div>
        )}
        <div className="w-24 h-24 bg-surface-200 rounded-full flex items-center justify-center mx-auto mb-4">
             <span className="text-4xl">{recipe.icon}</span>
        </div>
        <div className="text-center">
            <h3 className="font-semibold text-base mb-2 text-on-surface h-12 flex items-center justify-center">{recipe.nome}</h3>
            <p className="text-on-surface-secondary text-xs h-10">{recipe.beneficio}</p>
        </div>
    </motion.div>
);

interface RecipeSelectionPageProps {
  onRecipeSelectionSuccess: (recipes: Recipe[]) => void;
  recipes: Recipe[];
  isEditMode: boolean;
  uiTexts: UITexts;
  onUpdateUiText: (page: 'recipeSelection', key: string, value: string) => void;
}

const RecipeSelectionPage: React.FC<RecipeSelectionPageProps> = ({ onRecipeSelectionSuccess, recipes, isEditMode, uiTexts, onUpdateUiText }) => {
    const [selectedRecipes, setSelectedRecipes] = useState<Recipe[]>([]);
    const [filter, setFilter] = useState<'todas' | 'salgada' | 'doce'>('todas');
    const texts = uiTexts.recipeSelection;

    const handleSelectRecipe = (recipe: Recipe) => {
        setSelectedRecipes(prev => 
            prev.find(r => r.id === recipe.id) 
            ? prev.filter(r => r.id !== recipe.id) 
            : [...prev, recipe]
        );
    };

    const filteredRecipes = useMemo(() => {
        if (filter === 'todas') return recipes;
        return recipes.filter(r => r.tipo === filter);
    }, [filter, recipes]);
    
    const FilterButton: React.FC<{label: string; value: 'todas' | 'salgada' | 'doce'}> = ({label, value}) => (
      <button 
        onClick={() => setFilter(value)}
        className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors duration-300 ${filter === value ? 'bg-primary text-on-primary' : 'bg-surface-200 text-on-surface-secondary hover:bg-surface-300'}`}
      >
        {label}
      </button>
    );

    return (
        <div className="min-h-screen p-4 pb-32 bg-background">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-8 p-4">
                    <EditableField as="h1" isEditing={isEditMode} value={texts.title} onChange={v => onUpdateUiText('recipeSelection', 'title', v)} className="text-3xl font-bold mb-2" />
                    <EditableField as="p" isEditing={isEditMode} value={texts.subtitle} onChange={v => onUpdateUiText('recipeSelection', 'subtitle', v)} className="text-on-surface-secondary mb-4" />
                    <div className="inline-block bg-surface-100 text-on-surface font-semibold px-4 py-2 rounded-full text-sm">
                        <span>{selectedRecipes.length}</span> <EditableField as="span" isEditing={isEditMode} value={texts.counterText} onChange={v => onUpdateUiText('recipeSelection', 'counterText', v)} />
                    </div>
                </div>

                <div className="flex justify-center gap-3 mb-8 flex-wrap">
                    <FilterButton label="🍽️ Todas" value="todas" />
                    <FilterButton label="🥗 Salgadas" value="salgada" />
                    <FilterButton label="🍰 Doces" value="doce" />
                </div>

                <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    <AnimatePresence>
                        {filteredRecipes.map(recipe => (
                            <RecipeCard 
                                key={recipe.id}
                                recipe={recipe}
                                isSelected={selectedRecipes.some(r => r.id === recipe.id)}
                                onSelect={handleSelectRecipe}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm flex justify-center border-t border-surface-200">
                     <button 
                        onClick={() => onRecipeSelectionSuccess(selectedRecipes)}
                        disabled={selectedRecipes.length === 0}
                        className="bg-primary text-on-primary font-semibold py-3 px-12 rounded-md text-base transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <EditableField as="span" isEditing={isEditMode} value={texts.submitButton} onChange={v => onUpdateUiText('recipeSelection', 'submitButton', v)} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecipeSelectionPage;