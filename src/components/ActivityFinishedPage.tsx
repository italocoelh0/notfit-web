
// components/ActivityFinishedPage.tsx
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { RecordedActivity } from '../types';
import { formatTime } from '../lib/geolocation';

interface ActivityFinishedPageProps {
  activityData: Omit<RecordedActivity, 'id' | 'date'>;
  onSave: (data: Partial<RecordedActivity>) => void;
  onDiscard: () => void;
}

const ActivityFinishedPage: React.FC<ActivityFinishedPageProps> = ({ activityData, onSave, onDiscard }) => {
    const { distance, time, elevationGain, mapImageUrl, sport, avgHeartRate } = activityData;
    
    // Form State
    const [title, setTitle] = useState(`${sport.name} ${new Date().getHours() < 12 ? 'Matinal' : new Date().getHours() < 18 ? 'Vespertina' : 'Noturna'}`);
    const [description, setDescription] = useState('');
    const [effort, setEffort] = useState(5); // 1-10
    const [visibility, setVisibility] = useState<'todos' | 'seguidores' | 'apenas_eu'>('todos');
    const [mediaFiles, setMediaFiles] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
        setIsSaving(true);
        // Aqui você incluiria logicamente as mediaFiles no objeto salvo
        setTimeout(() => {
            onSave({
                title,
                description,
                effort,
                visibility,
                mediaFiles
            }); 
        }, 1000);
    };

    const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            const remainingSlots = 8 - mediaFiles.length;
            
            if (remainingSlots <= 0) return;

            const filesToProcess = filesArray.slice(0, remainingSlots);

            filesToProcess.forEach(file => {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    if (ev.target?.result) {
                        setMediaFiles(prev => [...prev, ev.target!.result as string]);
                    }
                };
                reader.readAsDataURL(file as Blob);
            });
        }
    };

    const removeMedia = (index: number) => {
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
    };

    const inputStyles = "w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all";
    const sectionStyles = "bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-5";

    return (
        <motion.div
            className="fixed inset-0 bg-[#121212] z-50 flex flex-col overflow-y-auto pb-10 custom-scrollbar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            {/* Background Decoration */}
            <div className="fixed top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full filter blur-[120px] opacity-20 pointer-events-none"></div>
            <div className="fixed bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-900/10 rounded-full filter blur-[120px] opacity-20 pointer-events-none"></div>

            {/* Header */}
            <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl px-4 py-4 flex justify-between items-center border-b border-white/5">
                <button onClick={onDiscard} className="text-gray-400 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
                    Cancelar
                </button>
                <h1 className="text-white font-anton uppercase tracking-wide text-lg">Salvar Atividade</h1>
                <div className="w-16"></div> {/* Spacer for visual balance */}
            </div>

            <div className="p-4 space-y-6 relative z-10 max-w-md mx-auto w-full">
                
                {/* Main Form Card */}
                <div className={sectionStyles}>
                    {/* Activity Tag */}
                    <div className="mb-6">
                         <div className="flex items-center justify-between mb-2">
                            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Esporte</label>
                         </div>
                         <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                             <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl">
                                <i className={sport.icon}></i>
                             </div>
                             <span className="text-white font-anton uppercase tracking-wide text-lg">{sport.name}</span>
                             <i className="fa-solid fa-chevron-down text-gray-600 ml-auto text-xs"></i>
                         </div>
                    </div>

                    {/* Title Input */}
                    <div className="mb-4">
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2 block">Título</label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-transparent text-xl font-bold text-white placeholder-gray-600 border-b border-white/20 pb-2 focus:outline-none focus:border-primary transition-colors"
                            placeholder="Nome da sua atividade"
                        />
                    </div>

                    {/* Description Input */}
                    <div>
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2 block">Descrição</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={inputStyles}
                            placeholder="Como foi o treino? Use @ para marcar amigos."
                            rows={3}
                        />
                    </div>
                </div>

                {/* Media & Map Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Map Preview - KM Removed */}
                    <div className={`col-span-2 sm:col-span-1 ${sectionStyles} !p-0 overflow-hidden relative aspect-square group`}>
                         {mapImageUrl ? (
                             <img src={mapImageUrl} alt="Mapa" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                         ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-600 bg-black/20">
                                 <i className="fa-solid fa-map-location-dot text-4xl opacity-20"></i>
                             </div>
                         )}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none"></div>
                         <div className="absolute bottom-3 left-3">
                             <p className="text-[10px] text-gray-400 uppercase tracking-widest">Rota</p>
                             <p className="text-xs font-bold text-white">Visualização do percurso</p>
                         </div>
                    </div>
                    
                    {/* Media Upload Section - Habilitado para até 8 midias */}
                    <div className={`col-span-2 sm:col-span-1 ${sectionStyles} !p-2 relative aspect-square flex flex-col`}>
                        <input 
                            type="file" 
                            multiple 
                            accept="image/*" 
                            ref={fileInputRef} 
                            onChange={handleMediaUpload} 
                            className="hidden" 
                        />
                        
                        {mediaFiles.length === 0 ? (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors group"
                            >
                                <div className="w-12 h-12 rounded-full bg-surface-200 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                    <i className="fa-solid fa-camera text-white/70"></i>
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-white">Adicionar Mídia</span>
                                <span className="text-[9px] text-gray-600 mt-1">Até 8 fotos</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-1.5 h-full overflow-y-auto custom-scrollbar content-start">
                                {mediaFiles.map((src, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                                        <img src={src} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                                        <button 
                                            onClick={() => removeMedia(idx)}
                                            className="absolute top-0.5 right-0.5 bg-black/60 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <i className="fa-solid fa-times"></i>
                                        </button>
                                    </div>
                                ))}
                                {mediaFiles.length < 8 && (
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square rounded-lg border border-white/10 bg-white/5 flex items-center justify-center cursor-pointer hover:bg-white/10"
                                    >
                                        <i className="fa-solid fa-plus text-white/50"></i>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {mediaFiles.length > 0 && (
                            <div className="absolute bottom-3 right-3 bg-black/70 px-2 py-1 rounded text-[9px] font-bold text-white pointer-events-none">
                                {mediaFiles.length}/8
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Row - Updated with Distance */}
                <div className="flex justify-between gap-2">
                     <div className={`${sectionStyles} flex-1 text-center py-4`}>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1">Distância</p>
                        <p className="text-lg font-anton text-white tracking-wide">{distance.toFixed(2)} km</p>
                     </div>
                     <div className={`${sectionStyles} flex-1 text-center py-4`}>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1">Tempo</p>
                        <p className="text-lg font-anton text-white tracking-wide">{formatTime(time)}</p>
                     </div>
                     <div className={`${sectionStyles} flex-1 text-center py-4`}>
                        <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold mb-1">Elevação</p>
                        <p className="text-lg font-anton text-white tracking-wide">{elevationGain?.toFixed(0) || 0}m</p>
                     </div>
                </div>

                {/* Details Section */}
                <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                    <h3 className="font-anton uppercase text-white tracking-wide mb-6 text-lg flex items-center gap-2">
                        <i className="fa-solid fa-sliders text-primary text-xs"></i> Detalhes
                    </h3>
                    
                    {/* Effort Slider */}
                    <div className="mb-6">
                        <div className="flex justify-between mb-3">
                            <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Esforço Percebido</label>
                            <span className="text-xs font-anton text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{effort}/10</span>
                        </div>
                        <div className="relative h-8 flex items-center">
                             <div className="absolute inset-x-0 h-1 bg-surface-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" style={{ width: `${effort * 10}%` }}></div>
                             </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="10" 
                                value={effort} 
                                onChange={(e) => setEffort(Number(e.target.value))}
                                className="absolute inset-x-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                             <div 
                                className="absolute w-4 h-4 bg-white rounded-full shadow-lg border-2 border-surface-100 pointer-events-none transition-all"
                                style={{ left: `calc(${effort * 10}% - 8px)` }}
                             ></div>
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                            <span>Leve</span>
                            <span>Intenso</span>
                        </div>
                    </div>

                    {/* Visibility */}
                    <div>
                        <label className="text-xs font-bold text-gray-300 uppercase tracking-wider block mb-3">Visibilidade</label>
                        <div className="grid grid-cols-3 gap-2 bg-black/20 p-1 rounded-xl border border-white/5">
                            <button 
                                onClick={() => setVisibility('todos')}
                                className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${visibility === 'todos' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Todos
                            </button>
                            <button 
                                onClick={() => setVisibility('seguidores')}
                                className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${visibility === 'seguidores' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Seguidores
                            </button>
                            <button 
                                onClick={() => setVisibility('apenas_eu')}
                                className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${visibility === 'apenas_eu' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Privado
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Actions Footer */}
                <div className="pt-4 pb-8 space-y-3">
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full bg-primary text-white font-anton uppercase tracking-widest py-4 rounded-2xl shadow-[0_0_20px_rgba(252,82,0,0.4)] hover:shadow-[0_0_30px_rgba(252,82,0,0.6)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {isSaving ? (
                            <><i className="fa-solid fa-circle-notch fa-spin"></i> Salvando...</>
                        ) : (
                            <>Salvar Atividade <i className="fa-solid fa-check"></i></>
                        )}
                    </button>
                </div>

            </div>
        </motion.div>
    );
};

export default ActivityFinishedPage;
