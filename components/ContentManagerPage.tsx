
// components/ContentManagerPage.tsx
import React, { useState, useMemo } from 'react';
import { Exercise, Recipe, ExerciseCategory, ExerciseLevel, MuscleGroup } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ContentManagerPageProps {
    exercises: Exercise[];
    recipes: Recipe[];
    onUpdateExercise: (exercise: Exercise) => void;
    onAddExercise: (exercise: Omit<Exercise, 'id'>) => void;
    onDeleteExercise: (id: number) => void;
    onUpdateRecipe: (recipe: Recipe) => void;
    onAddRecipe: (recipe: Omit<Recipe, 'id'>) => void;
    onDeleteRecipe: (id: number) => void;
    onBack: () => void;
}

type Tab = 'exercises' | 'recipes';

const extractYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const ContentManagerPage: React.FC<ContentManagerPageProps> = ({
    exercises, recipes, onUpdateExercise, onAddExercise, onDeleteExercise,
    onUpdateRecipe, onAddRecipe, onDeleteRecipe, onBack
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('exercises');
    const [search, setSearch] = useState('');
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Form States
    const [formData, setFormData] = useState<any>({});

    const filteredItems = useMemo(() => {
        const term = search.toLowerCase();
        if (activeTab === 'exercises') {
            return exercises.filter(e => e.nome.toLowerCase().includes(term) || e.grupoMuscular.toLowerCase().includes(term));
        } else {
            return recipes.filter(r => r.nome.toLowerCase().includes(term) || r.categoria.toLowerCase().includes(term));
        }
    }, [activeTab, search, exercises, recipes]);

    const handleEdit = (item: any) => {
        setEditingItem(item);
        setFormData({ ...item });
        setIsCreating(false);
    };

    const handleCreate = () => {
        const initialData = activeTab === 'exercises' 
            ? { nome: '', videoId: '', descricao: '', nivel: 'Iniciante', duracao: '3x 12', calorias: '5 cal/min', grupoMuscular: 'Peito', categoria: 'Musculação' }
            : { nome: '', tipo: 'salgada', icon: '🍲', categoria: 'Almoço', ingredientes: [], modoPreparo: [], beneficio: '' };
        
        setFormData(initialData);
        setEditingItem(initialData); // Use editing item state for modal visibility
        setIsCreating(true);
    };

    const handleSave = () => {
        if (activeTab === 'exercises') {
            // Process Video URL if needed
            let finalVideoId = formData.videoId;
            if (finalVideoId.includes('http') || finalVideoId.includes('youtube')) {
                const extracted = extractYoutubeId(finalVideoId);
                if (extracted) finalVideoId = extracted;
            }

            const payload = { ...formData, videoId: finalVideoId };
            
            if (isCreating) onAddExercise(payload);
            else onUpdateExercise(payload);
        } else {
            // Recipes
            const payload = { ...formData };
            if (typeof payload.ingredientes === 'string') payload.ingredientes = payload.ingredientes.split('\n');
            if (typeof payload.modoPreparo === 'string') payload.modoPreparo = payload.modoPreparo.split('\n');
            
            if (isCreating) onAddRecipe(payload);
            else onUpdateRecipe(payload);
        }
        setEditingItem(null);
    };

    const handleDelete = (id: number) => {
        if (window.confirm('Tem certeza que deseja excluir este item?')) {
            if (activeTab === 'exercises') onDeleteExercise(id);
            else onDeleteRecipe(id);
            setEditingItem(null);
        }
    };

    const inputClass = "w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary transition-colors text-sm";
    const labelClass = "text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1 block";

    return (
        <div className="fixed inset-0 bg-[#121212] z-[60] flex flex-col">
            {/* Header */}
            <div className="bg-surface-100/90 backdrop-blur-md px-4 py-4 pt-safe border-b border-white/10 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="w-8 h-8 flex items-center justify-center bg-surface-200 rounded-full text-white hover:bg-white/20 transition-colors">
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <h2 className="font-anton uppercase tracking-wide text-lg text-white">Gerenciador</h2>
                </div>
                <button 
                    onClick={handleCreate}
                    className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                >
                    <i className="fa-solid fa-plus mr-2"></i> Novo
                </button>
            </div>

            {/* Tabs & Search */}
            <div className="p-4 space-y-4 bg-surface-100 border-b border-white/5">
                <div className="flex bg-black/30 p-1 rounded-xl">
                    <button 
                        onClick={() => setActiveTab('exercises')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'exercises' ? 'bg-surface-200 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Exercícios
                    </button>
                    <button 
                        onClick={() => setActiveTab('recipes')}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'recipes' ? 'bg-surface-200 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        Receitas
                    </button>
                </div>
                <div className="relative">
                    <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={`Buscar ${activeTab === 'exercises' ? 'exercícios' : 'receitas'}...`}
                        className="w-full bg-black/20 border border-white/5 rounded-lg py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-white/20"
                    />
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                {filteredItems.map((item: any) => (
                    <motion.div 
                        key={item.id}
                        layoutId={`item-${item.id}`}
                        onClick={() => handleEdit(item)}
                        className="bg-surface-100 p-3 rounded-xl border border-white/5 flex items-center gap-4 cursor-pointer hover:bg-surface-200 transition-colors group"
                    >
                        {activeTab === 'exercises' ? (
                            <img 
                                src={`https://img.youtube.com/vi/${item.videoId}/default.jpg`} 
                                className="w-16 h-12 object-cover rounded-lg bg-black" 
                                alt=""
                            />
                        ) : (
                            <div className="w-12 h-12 rounded-lg bg-surface-200 flex items-center justify-center text-2xl">
                                {item.icon}
                            </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                            <h4 className="text-white font-bold text-sm truncate">{item.nome}</h4>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                                {activeTab === 'exercises' ? item.grupoMuscular : item.categoria}
                            </p>
                        </div>
                        <i className="fa-solid fa-pencil text-gray-600 group-hover:text-primary transition-colors"></i>
                    </motion.div>
                ))}
            </div>

            {/* Edit/Create Modal */}
            <AnimatePresence>
                {editingItem && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-[70] flex items-end sm:items-center justify-center sm:p-4 backdrop-blur-sm"
                        onClick={() => setEditingItem(null)}
                    >
                        <motion.div 
                            initial={{ y: '100%' }} 
                            animate={{ y: 0 }} 
                            exit={{ y: '100%' }}
                            onClick={e => e.stopPropagation()}
                            className="bg-surface-100 w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl border-t sm:border border-white/10 max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
                        >
                            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-surface-200/50">
                                <h3 className="font-anton uppercase text-white tracking-wide text-lg">
                                    {isCreating ? 'Novo Item' : 'Editar Conteúdo'}
                                </h3>
                                {(!isCreating && editingItem.id) && (
                                    <button onClick={() => handleDelete(editingItem.id)} className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest px-3 py-1 bg-red-500/10 rounded-lg">
                                        Excluir
                                    </button>
                                )}
                            </div>

                            <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                                {activeTab === 'exercises' ? (
                                    <>
                                        {/* Video Preview Logic */}
                                        <div className="aspect-video bg-black rounded-xl overflow-hidden relative border border-white/10 mb-4 group">
                                            {formData.videoId ? (
                                                <iframe 
                                                    width="100%" height="100%" 
                                                    src={`https://www.youtube.com/embed/${extractYoutubeId(formData.videoId) || formData.videoId}`} 
                                                    frameBorder="0" allowFullScreen
                                                    className="opacity-80 group-hover:opacity-100 transition-opacity"
                                                ></iframe>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500 flex-col gap-2">
                                                    <i className="fa-brands fa-youtube text-3xl"></i>
                                                    <span className="text-xs">Insira o ID ou URL do vídeo</span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className={labelClass}>Nome do Exercício</label>
                                            <input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className={inputClass} placeholder="Ex: Supino Reto" />
                                        </div>
                                        
                                        <div>
                                            <label className={labelClass}>Vídeo (URL ou ID do YouTube)</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    value={formData.videoId} 
                                                    onChange={e => setFormData({...formData, videoId: e.target.value})} 
                                                    className={inputClass} 
                                                    placeholder="https://youtu.be/..." 
                                                />
                                                <button className="bg-surface-200 px-3 rounded-xl text-gray-400 hover:text-white border border-white/10">
                                                    <i className="fa-solid fa-paste"></i>
                                                </button>
                                            </div>
                                            <p className="text-[9px] text-gray-500 mt-1">Cole o link completo, nós extraímos o ID para você.</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClass}>Grupo Muscular</label>
                                                <select value={formData.grupoMuscular} onChange={e => setFormData({...formData, grupoMuscular: e.target.value})} className={inputClass}>
                                                    {['Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps', 'Abdômen', 'Cardio'].map(g => (
                                                        <option key={g} value={g}>{g}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelClass}>Categoria</label>
                                                <select value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} className={inputClass}>
                                                    {['Musculação', 'Aeróbico', 'Funcional', 'Alongamento', 'Em casa'].map(c => (
                                                        <option key={c} value={c}>{c}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className={labelClass}>Nível</label>
                                                <select value={formData.nivel} onChange={e => setFormData({...formData, nivel: e.target.value})} className={inputClass}>
                                                    <option value="Iniciante">Iniciante</option>
                                                    <option value="Intermediário">Médio</option>
                                                    <option value="Avançado">Pro</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelClass}>Séries/Reps</label>
                                                <input value={formData.duracao} onChange={e => setFormData({...formData, duracao: e.target.value})} className={inputClass} placeholder="Ex: 3x12" />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Gasto Calórico</label>
                                                <input value={formData.calorias} onChange={e => setFormData({...formData, calorias: e.target.value})} className={inputClass} placeholder="~5 cal" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelClass}>Descrição / Instruções</label>
                                            <textarea 
                                                value={formData.descricao} 
                                                onChange={e => setFormData({...formData, descricao: e.target.value})} 
                                                className={`${inputClass} min-h-[100px] resize-none`} 
                                                placeholder="Detalhes sobre a execução..."
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-20 h-20 bg-surface-200 rounded-2xl flex items-center justify-center text-4xl border border-white/10">
                                                <input 
                                                    value={formData.icon} 
                                                    onChange={e => setFormData({...formData, icon: e.target.value})} 
                                                    className="bg-transparent w-full h-full text-center focus:outline-none" 
                                                    maxLength={2}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <label className={labelClass}>Nome da Receita</label>
                                                <input value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className={inputClass} placeholder="Ex: Omelete Fit" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className={labelClass}>Tipo</label>
                                                <select value={formData.tipo} onChange={e => setFormData({...formData, tipo: e.target.value})} className={inputClass}>
                                                    <option value="salgada">Salgada</option>
                                                    <option value="doce">Doce</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelClass}>Refeição Sugerida</label>
                                                <input value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} className={inputClass} placeholder="Ex: Almoço" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className={labelClass}>Benefícios</label>
                                            <textarea value={formData.beneficio} onChange={e => setFormData({...formData, beneficio: e.target.value})} className={inputClass} rows={2} placeholder="Por que é saudável?" />
                                        </div>

                                        <div className="space-y-4 border-t border-white/10 pt-4">
                                            <div>
                                                <label className={labelClass}>Ingredientes (Um por linha)</label>
                                                <textarea 
                                                    value={Array.isArray(formData.ingredientes) ? formData.ingredientes.join('\n') : formData.ingredientes} 
                                                    onChange={e => setFormData({...formData, ingredientes: e.target.value.split('\n')})} 
                                                    className={`${inputClass} min-h-[100px] font-mono text-xs`} 
                                                    placeholder="- 2 ovos..."
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Modo de Preparo (Um passo por linha)</label>
                                                <textarea 
                                                    value={Array.isArray(formData.modoPreparo) ? formData.modoPreparo.join('\n') : formData.modoPreparo} 
                                                    onChange={e => setFormData({...formData, modoPreparo: e.target.value.split('\n')})} 
                                                    className={`${inputClass} min-h-[100px] font-mono text-xs`} 
                                                    placeholder="1. Bata os ovos..."
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="p-4 border-t border-white/10 bg-surface-200/50 flex gap-3">
                                <button onClick={() => setEditingItem(null)} className="flex-1 py-3 rounded-xl text-gray-400 font-bold uppercase tracking-wider text-xs hover:bg-white/5 transition-colors">
                                    Cancelar
                                </button>
                                <button onClick={handleSave} className="flex-1 py-3 rounded-xl bg-primary text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity">
                                    Salvar Alterações
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ContentManagerPage;
