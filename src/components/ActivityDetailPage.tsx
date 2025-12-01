
// components/ActivityDetailPage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { RecordedActivity, UserData } from '../types';
import { formatTime, formatPace } from '@lib/geolocation';

interface ActivityDetailPageProps {
    activity: RecordedActivity;
    userData: UserData;
    onBack: () => void;
}

const ActivityDetailPage: React.FC<ActivityDetailPageProps> = ({ activity, userData, onBack }) => {
    // Calculate activity ordinal number dynamically
    const totalActivities = userData.activities ? userData.activities.length : 1;
    
    // Determine suffix for ordinal number (1ª, 2ª, 3ª...)
    const ordinalSuffix = 'ª'; // In Portuguese 'atividade' is feminine

    return (
        <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed inset-0 bg-background z-[60] overflow-y-auto pb-20"
        >
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/10">
                <button onClick={onBack} className="w-8 h-8 flex items-center justify-center bg-surface-100 rounded-full text-white hover:bg-surface-200 transition-colors">
                    <i className="fa-solid fa-chevron-down"></i>
                </button>
                <span className="font-semibold text-white text-sm">{activity.sport.name}</span>
                <div className="flex gap-3 text-gray-400 text-lg">
                    <button className="hover:text-white"><i className="fa-regular fa-bookmark"></i></button>
                    <button className="hover:text-white"><i className="fa-solid fa-ellipsis"></i></button>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* User Header */}
                <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-200 border border-white/10">
                        {userData.userAvatar.startsWith('data:image') ? (
                            <img src={userData.userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">{userData.userAvatar}</div>
                        )}
                    </div>
                    <div>
                        <h2 className="font-bold text-white text-base">{userData.name}</h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(activity.date).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })} 
                            {' • '} {activity.location?.city || 'Serra'}, {activity.location?.state || 'ES'}
                        </p>
                    </div>
                </div>

                {/* Title & Flames Box (Dynamic) */}
                <div>
                    <h1 className="text-2xl font-bold text-white mb-5">{activity.title || `${activity.sport.name} Vespertina`}</h1>
                    
                    {/* Flames Card based on Photo 3 reference */}
                    <div className="bg-surface-100 p-4 rounded-xl flex items-center justify-between border border-white/5 shadow-lg">
                        <div className="flex items-center gap-4">
                            {/* Hexagon-like shape using css clip-path or just rounded sq for now as closest match */}
                            <div className="bg-primary text-white w-10 h-10 flex items-center justify-center rounded-lg font-anton text-lg shadow-lg shadow-primary/20 border border-white/10 transform rotate-3">
                                {totalActivities}
                            </div>
                            <div>
                                <p className="text-sm text-white font-bold">Flames!</p>
                                <p className="text-xs text-gray-400">Pela sua {totalActivities}{ordinalSuffix} atividade</p>
                            </div>
                        </div>
                        <button className="bg-primary text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20 uppercase tracking-wide">
                            Visualizar
                        </button>
                    </div>
                </div>

                {/* Main Stats */}
                <div className="grid grid-cols-2 gap-y-6 gap-x-4 border-y border-white/10 py-6">
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">Distância</p>
                        <p className="text-2xl font-anton text-white tracking-wide">{activity.distance.toFixed(2)} <span className="text-sm font-sans font-normal text-gray-500">km</span></p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">Ritmo Médio</p>
                        <p className="text-2xl font-anton text-white tracking-wide">{formatPace(activity.pace)} <span className="text-sm font-sans font-normal text-gray-500">/km</span></p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">Tempo Mov.</p>
                        <p className="text-2xl font-anton text-white tracking-wide">{formatTime(activity.time)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">Ganho Elev.</p>
                        <p className="text-2xl font-anton text-white tracking-wide">{activity.elevationGain?.toFixed(0) || 0} <span className="text-sm font-sans font-normal text-gray-500">m</span></p>
                    </div>
                    {activity.avgHeartRate && (
                        <div>
                             <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">Batimentos Médios</p>
                             <p className="text-2xl font-anton text-white tracking-wide flex items-center gap-1">
                                 {activity.avgHeartRate} <i className="fa-solid fa-heart text-red-500 text-sm"></i>
                             </p>
                        </div>
                    )}
                    {activity.calories && (
                        <div>
                             <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-bold">Calorias</p>
                             <p className="text-2xl font-anton text-white tracking-wide">{activity.calories} <span className="text-sm font-sans font-normal text-gray-500">kcal</span></p>
                        </div>
                    )}
                </div>

                {/* Map */}
                {activity.mapImageUrl && (
                    <div className="rounded-xl overflow-hidden border border-white/10 h-64 relative shadow-2xl">
                         <img src={activity.mapImageUrl} className="w-full h-full object-cover" alt="Mapa da atividade" />
                         <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] text-white font-bold border border-white/10 flex items-center gap-2">
                             <i className="fa-solid fa-layer-group text-primary"></i> Mapa 3D
                         </div>
                    </div>
                )}

                {/* Splits (Parciais) */}
                {activity.splits && activity.splits.length > 0 && (
                    <div>
                        <h3 className="font-anton text-white text-lg mb-4 tracking-wide uppercase">Parciais</h3>
                        <div className="bg-surface-100 rounded-xl overflow-hidden border border-white/5">
                            <div className="grid grid-cols-4 p-3 border-b border-white/5 text-[10px] uppercase tracking-wider text-gray-500 font-bold bg-white/5">
                                <span>Km</span>
                                <span className="col-span-2">Ritmo</span>
                                <span className="text-right">Elev.</span>
                            </div>
                            {activity.splits.map((split, idx) => (
                                <div key={idx} className="grid grid-cols-4 p-3 border-b border-white/5 text-sm text-white last:border-0 items-center hover:bg-white/5 transition-colors">
                                    <span className="font-bold text-primary">{split.km}</span>
                                    <div className="col-span-2 flex items-center gap-3">
                                        <div className="h-1.5 rounded-full bg-surface-300 flex-1 overflow-hidden max-w-[100px]">
                                            <div className="h-full bg-gradient-to-r from-primary to-orange-500" style={{ width: `${Math.min(100, (1000 / split.pace) * 8)}%` }}></div>
                                        </div>
                                        <span className="font-mono text-xs">{formatPace(split.pace)}</span>
                                    </div>
                                    <span className="text-right text-gray-400">{split.elevation}m</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Elevation Graph Mock */}
                <div className="bg-surface-100 p-5 rounded-xl border border-white/5 relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-3">
                         <i className="fa-solid fa-circle-info text-gray-600"></i>
                     </div>
                    <h3 className="font-anton text-white text-lg mb-4 tracking-wide uppercase">Elevação</h3>
                    <div className="h-32 flex items-end gap-1 pt-4 border-b border-white/10 pb-1">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} className="flex-1 bg-surface-300/50 hover:bg-primary/50 transition-colors rounded-t-sm" style={{ height: `${20 + Math.random() * 60}%` }}></div>
                        ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-wider">
                        <span>0.0 km</span>
                        <span>{activity.distance.toFixed(1)} km</span>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-center gap-8 py-6 border-t border-white/10 text-gray-400 text-xl">
                    <button className="flex flex-col items-center gap-1 hover:text-primary transition-colors group">
                        <i className="fa-regular fa-thumbs-up group-hover:scale-110 transition-transform"></i> 
                        <span className="text-[10px] uppercase tracking-widest font-bold">Curtir</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 hover:text-primary transition-colors group">
                        <i className="fa-regular fa-comment group-hover:scale-110 transition-transform"></i> 
                        <span className="text-[10px] uppercase tracking-widest font-bold">Comentar</span>
                    </button>
                    <button className="flex flex-col items-center gap-1 hover:text-primary transition-colors group">
                        <i className="fa-solid fa-share-nodes group-hover:scale-110 transition-transform"></i> 
                        <span className="text-[10px] uppercase tracking-widest font-bold">Share</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ActivityDetailPage;
