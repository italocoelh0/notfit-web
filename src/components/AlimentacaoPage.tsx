
import React, { useState, useMemo, useEffect } from 'react';
import { Recipe, UITexts, UserData, DashboardSection } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import EditableField from './EditableField';
import { createManualRoutine } from '@lib/routineService';

const BLANK_RECIPE: Omit<Recipe, 'id'> = {
    nome: "Nova Receita",
    tipo: "salgada",
    icon: "🆕",
    categoria: "Almoço",
    ingredientes: ["Ingrediente 1", "Ingrediente 2"],
    modoPreparo: ["Passo 1", "Passo 2"],
    beneficio: "Benefício da nova receita."
};

const RecipeModal: React.FC<{
    recipe: Recipe | Omit<Recipe, 'id'> | null;
    onClose: () => void;
    isAdmin: boolean;
    onUpdateRecipe: (recipe: Recipe) => void;
    onAddRecipe: (recipe: Omit<Recipe, 'id'>) => void;
    onDeleteRecipe: (recipeId: number) => void;
}> = ({ recipe, onClose, isAdmin, onUpdateRecipe, onAddRecipe, onDeleteRecipe }) => {
    const isNew = recipe && !('id' in recipe);
    const [editedRecipe, setEditedRecipe] = useState(recipe);

    useEffect(() => {
        setEditedRecipe(recipe);
    }, [recipe]);
    
    if (!recipe || !editedRecipe) return null;

    const handleSave = () => {
        if (isNew) {
            onAddRecipe(editedRecipe as Omit<Recipe, 'id'>);
        } else {
            onUpdateRecipe(editedRecipe as Recipe);
        }
        onClose();
    };

    const handleDelete = () => {
        if (!isNew && window.confirm(`Tem certeza que deseja deletar a receita "${recipe.nome}"?`)) {
            onDeleteRecipe((recipe as Recipe).id);
            onClose();
        }
    }
    
    const handleInputChange = (field: keyof Omit<Recipe, 'id'>, value: string | string[]) => {
        setEditedRecipe(prev => prev ? {...prev, [field]: value} : null);
    };
    
    const inputClass = "w-full bg-black/40 text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder-gray-500";
    const textAreaClass = "w-full bg-black/40 text-white p-3 rounded-xl border border-white/10 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-h-[150px] text-sm placeholder-gray-500";

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
                className="bg-surface-100/90 backdrop-blur-xl border border-white/10 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {isAdmin ? (
                        <>
                           <div className="flex items-center gap-4 mb-4">
                                <input value={editedRecipe.icon} onChange={e => handleInputChange('icon', e.target.value)} className={`${inputClass} text-3xl font-bold w-20 text-center h-16`} />
                                <input value={editedRecipe.nome} onChange={e => handleInputChange('nome', e.target.value)} className={`${inputClass} text-xl font-anton uppercase tracking-wide flex-1 h-16`} placeholder="NOME DA RECEITA" />
                           </div>
                           <textarea value={editedRecipe.beneficio} onChange={e => handleInputChange('beneficio', e.target.value)} className={`${textAreaClass} mb-4 h-24`} placeholder="Benefícios..." />
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-white/10">
                                <div><h4 className="font-anton uppercase text-white mb-3 tracking-wider">Ingredientes</h4><textarea value={editedRecipe.ingredientes.join('\n')} onChange={(e) => handleInputChange('ingredientes', e.target.value.split('\n'))} className={textAreaClass} /></div>
                                <div><h4 className="font-anton uppercase text-white mb-3 tracking-wider">Modo de Preparo</h4><textarea value={editedRecipe.modoPreparo.join('\n')} onChange={(e) => handleInputChange('modoPreparo', e.target.value.split('\n'))} className={textAreaClass} /></div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-surface-200 to-black border border-white/10 flex items-center justify-center text-5xl mb-4 shadow-[0_0_30px_rgba(252,82,0,0.2)]">
                                    {editedRecipe.icon}
                                </div>
                                <h3 className="text-3xl font-anton uppercase text-white tracking-wide mb-2">{editedRecipe.nome}</h3>
                                <div className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                                    {editedRecipe.categoria}
                                </div>
                                <p className="text-sm text-gray-400 mt-4 max-w-md font-light leading-relaxed">{editedRecipe.beneficio}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6 pt-6 border-t border-white/10">
                                <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
                                    <h4 className="font-anton uppercase text-lg text-white mb-4 tracking-wider flex items-center gap-2">
                                        <i className="fa-solid fa-basket-shopping text-primary text-xs"></i> Ingredientes
                                    </h4>
                                    <ul className="space-y-3 text-gray-300 text-sm">
                                        {editedRecipe.ingredientes.map((ing, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                                                <span className="leading-relaxed">{ing}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
                                    <h4 className="font-anton uppercase text-lg text-white mb-4 tracking-wider flex items-center gap-2">
                                        <i className="fa-solid fa-fire-burner text-primary text-xs"></i> Preparo
                                    </h4>
                                    <ol className="space-y-4 text-gray-300 text-sm">
                                        {editedRecipe.modoPreparo.map((step, index) => (
                                            <li key={index} className="flex gap-3">
                                                <span className="font-anton text-white/20 text-lg leading-none w-6 text-right">{index + 1}</span>
                                                <span className="leading-relaxed">{step}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <div className="p-6 mt-auto border-t border-white/10 flex justify-between items-center bg-black/20">
                    <div>
                        {isAdmin && !isNew && <button onClick={handleDelete} className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-widest">Deletar Receita</button>}
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest px-4 py-2">Fechar</button>
                        {isAdmin && <button onClick={handleSave} className="bg-primary text-white px-6 py-2 rounded-full font-anton uppercase tracking-wider text-sm hover:bg-primary-hover shadow-lg shadow-primary/20">Salvar</button>}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const RecipeListItem: React.FC<{
  recipe: Recipe;
  isAdded: boolean;
  onToggleAdd: (recipe: Recipe) => void;
  onViewDetails: (recipe: Recipe) => void;
}> = ({ recipe, isAdded, onToggleAdd, onViewDetails }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden group hover:bg-white/5 hover:border-white/20 transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row">
          {/* Thumbnail Section (Icon representation) */}
          <div
            onClick={() => onViewDetails(recipe)}
            className="relative w-full sm:w-40 h-40 sm:h-auto cursor-pointer overflow-hidden bg-gradient-to-br from-surface-200 to-black flex items-center justify-center"
          >
              <span className="text-6xl filter drop-shadow-lg group-hover:scale-110 transition-transform duration-500">{recipe.icon}</span>
              
              <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-white/10">
                  {recipe.categoria}
              </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-4 flex flex-col justify-between">
              <div>
                  <div className="flex justify-between items-start">
                      <h3 className="font-anton uppercase text-lg text-white tracking-wide group-hover:text-primary transition-colors mb-1 line-clamp-1">
                          {recipe.nome}
                      </h3>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2 mb-3">{recipe.beneficio}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                     {recipe.ingredientes.slice(0, 3).map((ing, i) => (
                        <span key={i} className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-gray-300 uppercase tracking-wider truncate max-w-[100px]">
                           <div className="w-1 h-1 rounded-full bg-primary inline-block mr-1"></div>
                           {ing}
                        </span>
                     ))}
                     {recipe.ingredientes.length > 3 && (
                         <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-gray-300 uppercase tracking-wider">+{recipe.ingredientes.length - 3}</span>
                     )}
                  </div>
              </div>

              <button
                onClick={() => onToggleAdd(recipe)}
                className={`w-full py-2 rounded-lg font-anton uppercase tracking-wider text-xs transition-all duration-300 flex items-center justify-center gap-2
                ${isAdded
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'
                    : 'bg-white/10 text-white border border-white/20 hover:bg-primary hover:border-primary hover:shadow-[0_0_15px_rgba(252,82,0,0.3)]'
                }`}
              >
                  <i className={`fa-solid ${isAdded ? 'fa-minus' : 'fa-plus'}`}></i>
                  {isAdded ? 'Remover' : 'Adicionar à Rotina'}
              </button>
          </div>
      </div>
    </motion.div>
  );
};

interface AlimentacaoPageProps {
    recipes: Recipe[];
    isAdmin: boolean;
    onUpdateRecipe: (recipe: Recipe) => void;
    onAddRecipe: (recipe: Omit<Recipe, 'id'>) => void;
    onDeleteRecipe: (recipeId: number) => void;
    isEditMode: boolean;
    uiTexts: UITexts;
    onUpdateUiText: (page: 'alimentacao', key: string, value: string) => void;
    onUpdateUserData: (updates: Partial<UserData>) => Promise<boolean>;
    onSendNotification: (message: string) => void;
    setActiveSection: (section: DashboardSection) => void;
}

const AlimentacaoPage: React.FC<AlimentacaoPageProps> = ({ recipes, isAdmin, onUpdateRecipe, onAddRecipe, onDeleteRecipe, isEditMode, uiTexts, onUpdateUiText, onUpdateUserData, onSendNotification, setActiveSection }) => {
    const [filter, setFilter] = useState<'todas' | 'salgada' | 'doce'>('todas');
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | Omit<Recipe, 'id'> | null>(null);
    const [addedRecipes, setAddedRecipes] = useState<Recipe[]>([]);
    const [isAddedListVisible, setIsAddedListVisible] = useState(false);
    const texts = uiTexts.alimentacao;

    const filteredRecipes = useMemo(() => {
        if (filter === 'todas') return recipes;
        return recipes.filter(r => r.tipo === filter);
    }, [filter, recipes]);

    const handleToggleRecipe = (recipe: Recipe) => {
        setAddedRecipes(prev => {
            const isAdded = prev.some(r => r.id === recipe.id);
            if (isAdded) {
                return prev.filter(r => r.id !== recipe.id);
            } else {
                return [...prev, recipe];
            }
        });
    };

    const handleAddToRoutine = async () => {
        if (addedRecipes.length === 0) return;

        // We use empty array for exercises as we are focusing on recipes here
        const newRoutine = createManualRoutine(addedRecipes, []); 
        const success = await onUpdateUserData({ routine: newRoutine });

        if (success) {
            onSendNotification('Receitas adicionadas à sua rotina!');
            setAddedRecipes([]);
            setIsAddedListVisible(false);
            setActiveSection('rotina');
        } else {
            onSendNotification('Ocorreu um erro ao salvar sua rotina.');
        }
    };

    const FilterButton: React.FC<{label: string, value: 'todas' | 'salgada' | 'doce'}> = ({label, value}) => (
      <button 
        onClick={() => setFilter(value)}
        className={`px-6 py-2 rounded-full font-anton uppercase tracking-widest text-xs transition-all duration-300 border ${
            filter === value 
            ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(252,82,0,0.4)]' 
            : 'bg-black/40 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
        }`}
      >
        {label}
      </button>
    );

    return (
        <div className="pb-32">
             {/* Header de navegação interno */}
            <div className="sticky top-16 z-30 bg-background/90 backdrop-blur-md -mx-4 px-4 py-3 flex items-center gap-3 border-b border-white/10">
                <button onClick={() => setActiveSection('rotina')} className="w-8 h-8 flex items-center justify-center bg-surface-100 rounded-full text-white hover:bg-primary hover:text-white transition-colors">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <span className="font-anton uppercase tracking-wider text-lg">Plano Alimentar</span>
            </div>

            {/* Header Filters */}
            <div className="sticky top-[calc(4rem+52px)] z-20 py-4 bg-background/80 backdrop-blur-md mb-6 -mx-4 px-4 flex justify-center gap-3 border-b border-white/5">
                <FilterButton label="Todas" value="todas" />
                <FilterButton label="Salgadas" value="salgada" />
                <FilterButton label="Doces" value="doce" />
            </div>
            
            {isAdmin && isEditMode && (
                <div className="mb-8 text-center">
                    <button 
                        onClick={() => setSelectedRecipe(BLANK_RECIPE)} 
                        className="bg-white/5 border border-white/10 hover:bg-primary hover:border-primary text-white font-anton uppercase tracking-widest py-4 px-8 rounded-2xl text-sm transition-all duration-300 group"
                    >
                        <i className="fa-solid fa-plus mr-2 group-hover:rotate-90 transition-transform duration-300"></i> 
                        Adicionar Nova Receita
                    </button>
                </div>
            )}
            
            <div className="space-y-4">
                <AnimatePresence>
                    {filteredRecipes.map(recipe => (
                        <RecipeListItem 
                            key={recipe.id} 
                            recipe={recipe} 
                            isAdded={addedRecipes.some(r => r.id === recipe.id)}
                            onToggleAdd={handleToggleRecipe}
                            onViewDetails={() => setSelectedRecipe(recipe)}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {filteredRecipes.length === 0 && (
                <div className="text-center py-20 opacity-50">
                    <p className="font-anton uppercase text-xl text-gray-500 tracking-wide">Nenhuma receita encontrada</p>
                </div>
            )}
            
             <AnimatePresence>
                {selectedRecipe && (
                    <RecipeModal 
                        recipe={selectedRecipe} 
                        onClose={() => setSelectedRecipe(null)}
                        isAdmin={isAdmin && isEditMode}
                        onUpdateRecipe={onUpdateRecipe}
                        onAddRecipe={onAddRecipe}
                        onDeleteRecipe={onDeleteRecipe}
                    />
                )}
            </AnimatePresence>

            {/* Floating Action Button for Selection */}
            <AnimatePresence>
                {addedRecipes.length > 0 && (
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
                             <span className="bg-white text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{addedRecipes.length}</span>
                             Finalizar Seleção
                             <i className="fa-solid fa-arrow-right"></i>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Sheet for Added Recipes */}
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
                                <h3 className="font-anton uppercase text-xl tracking-wide">Sua Seleção</h3>
                                <p className="text-xs text-gray-400 uppercase tracking-widest mt-1">{addedRecipes.length} receitas selecionadas</p>
                            </div>
                            
                            <div className="overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                {addedRecipes.map(recipe => (
                                    <div key={recipe.id} className="bg-black/40 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-surface-200 flex items-center justify-center text-2xl">
                                                {recipe.icon}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-white">{recipe.nome}</p>
                                                <p className="text-[10px] text-gray-400 uppercase tracking-wider">{recipe.categoria}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleToggleRecipe(recipe)} className="text-red-500 hover:text-red-400 transition-colors w-8 h-8 flex items-center justify-center">
                                            <i className="fa-solid fa-times text-lg"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            
                             <div className="p-6 mt-auto border-t border-white/10 bg-black/20 safe-area-bottom">
                                <button
                                    onClick={handleAddToRoutine}
                                    disabled={addedRecipes.length === 0}
                                    className="w-full bg-primary text-white font-anton uppercase tracking-widest text-sm py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Criar Rotina Agora
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AlimentacaoPage;
