
import React, { useState, useMemo } from 'react';
import { UserData, RecordedActivity, Post, DashboardSection } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime, formatPace } from '../lib/geolocation';
import ActivityDetailPage from './ActivityDetailPage';
import { BADGES_DATABASE } from '../constants';
import Avatar from './Avatar';
import SettingsMenu from './SettingsMenu';

interface StatsHubPageProps {
  userData: UserData;
  onViewImage: (url: string) => void;
  posts?: Post[];
  onNavigateToEdit?: () => void;
  onUpdateUserData?: (updates: Partial<UserData>) => void;
  onLogout?: () => void;
  onNavigate?: (section: DashboardSection) => void;
}

// Mock Data for Chart
const WEEKLY_DATA = [
    { day: 'S', value: 30 }, { day: 'T', value: 0 }, { day: 'Q', value: 45 },
    { day: 'Q', value: 60 }, { day: 'S', value: 0 }, { day: 'S', value: 90 }, { day: 'D', value: 20 },
];

const generateCalendarDays = () => {
    const days = [];
    const totalDays = 30;
    const startDayOffset = 2; 
    for (let i = 0; i < startDayOffset; i++) days.push({ day: 0, active: false });
    for (let i = 1; i <= totalDays; i++) {
        const active = [2, 5, 8, 12, 14, 15, 19, 22, 23, 28].includes(i);
        days.push({ day: i, active });
    }
    return days;
};

const ActivityItem: React.FC<{ activity: RecordedActivity; onClick: () => void }> = ({ activity, onClick }) => (
    <div onClick={onClick} className="bg-surface-100/50 backdrop-blur-sm border border-white/5 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-colors active:scale-[0.99] transform duration-200">
        <div className="w-12 h-12 rounded-full bg-surface-200 flex items-center justify-center text-xl text-white shadow-inner">
            <i className={activity.sport.icon}></i>
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-1">
                <h4 className="font-anton text-white uppercase tracking-wide truncate pr-2 text-sm">{activity.title || activity.sport.name}</h4>
                <span className="text-[10px] text-gray-500 font-medium whitespace-nowrap">
                    {new Date(activity.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </span>
            </div>
            <div className="flex gap-4 items-center">
                <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">Distância</span>
                    <span className="text-sm font-bold text-white leading-none">{activity.distance.toFixed(1)} <span className="text-[10px] font-normal text-gray-400">km</span></span>
                </div>
                <div className="w-px h-6 bg-white/10"></div>
                <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">Tempo</span>
                    <span className="text-sm font-bold text-white leading-none">{formatTime(activity.time)}</span>
                </div>
            </div>
        </div>
        <i className="fa-solid fa-chevron-right text-gray-600 text-xs"></i>
    </div>
);

const Stat: React.FC<{ value: string | number; label: string }> = ({ value, label }) => (
    <div className="text-center flex-1">
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{label}</p>
    </div>
);

const StatsHubPage: React.FC<StatsHubPageProps> = ({ 
    userData, 
    onViewImage, 
    posts = [], 
    onNavigateToEdit,
    onUpdateUserData,
    onLogout,
    onNavigate
}) => {
    const [activeTab, setActiveTab] = useState<'perfil' | 'progresso' | 'atividades'>('perfil');
    const [selectedActivity, setSelectedActivity] = useState<RecordedActivity | null>(null);
    const [isSettingsOpen, setSettingsOpen] = useState(false);
    const calendarDays = useMemo(() => generateCalendarDays(), []);

    const activities = userData.activities || [];
    const myPosts = useMemo(() => posts.filter(p => p.userId === userData.id).sort((a,b) => b.id - a.id), [posts, userData.id]);

    const equippedBadge = useMemo(() => {
        return BADGES_DATABASE.find(b => b.id === userData.equippedBadgeId);
    }, [userData.equippedBadgeId]);

    return (
        <div className="bg-black min-h-screen w-full">
            {/* Header Fixo - Efeito Glass */}
            <div className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/5 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-2 px-4">
                 <div className="flex items-center justify-between">
                     {/* Navegação por Abas */}
                     <div className="flex-1 flex p-1 bg-surface-100/80 rounded-xl border border-white/5 max-w-sm mx-auto">
                         <button 
                            onClick={() => setActiveTab('perfil')}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-anton uppercase tracking-widest transition-all duration-300 ${activeTab === 'perfil' ? 'bg-surface-300 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}
                         >
                            Perfil
                         </button>
                         <button 
                            onClick={() => setActiveTab('progresso')}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-anton uppercase tracking-widest transition-all duration-300 ${activeTab === 'progresso' ? 'bg-surface-300 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}
                         >
                            Progresso
                         </button>
                         <button 
                            onClick={() => setActiveTab('atividades')}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-anton uppercase tracking-widest transition-all duration-300 ${activeTab === 'atividades' ? 'bg-surface-300 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}
                         >
                            Atividades
                         </button>
                     </div>
                 </div>
            </div>

            {/* Conteúdo Scrollável */}
            <div className="pb-32 pt-4 px-0 sm:px-4">
                <AnimatePresence mode="wait">
                    {/* --- ABA PERFIL --- */}
                    {activeTab === 'perfil' ? (
                        <motion.div
                            key="perfil"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                             {/* Card Principal de Perfil */}
                             <div className="mx-4 sm:mx-0 bg-surface-100/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none"></div>
                                
                                {/* Botão Configurações */}
                                <button 
                                    onClick={() => setSettingsOpen(true)}
                                    className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-95"
                                >
                                    <i className="fa-solid fa-gear text-xs"></i>
                                </button>

                                <div className="flex flex-col items-center relative z-10">
                                    <div className="w-24 h-24 rounded-full mb-3 relative group shadow-xl">
                                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/10 bg-surface-200">
                                            <Avatar src={userData.userAvatar} alt={userData.name} size="xl" className="w-full h-full" />
                                        </div>
                                        {equippedBadge && equippedBadge.type === 'frame' && (
                                            <img src={equippedBadge.imageUrl} alt="Moldura" className="absolute inset-0 w-full h-full object-contain pointer-events-none scale-110"/>
                                        )}
                                        {equippedBadge && equippedBadge.type === 'badge' && (
                                            <img src={equippedBadge.imageUrl} alt="Emblema" className="absolute -bottom-1 -right-1 w-8 h-8 object-contain pointer-events-none drop-shadow-lg"/>
                                        )}
                                    </div>

                                    <h2 className="font-anton uppercase text-2xl text-white tracking-wide leading-none">{userData.name}</h2>
                                    <div className="flex items-center gap-2 mt-1 mb-3">
                                        <span className="text-xs text-gray-400 font-medium">@{userData.username}</span>
                                        {userData.isVerified && <i className="fa-solid fa-circle-check text-blue-500 text-[10px]"></i>}
                                    </div>

                                    <p className="text-sm text-gray-300 text-center leading-relaxed max-w-xs mb-6 font-light">
                                        {userData.bio || "Sem biografia."}
                                    </p>

                                    <div className="flex w-full justify-between items-center border-t border-white/10 pt-5 px-4">
                                        <Stat value={myPosts.length} label="Posts" />
                                        <div className="w-px h-8 bg-white/10 mx-2"></div>
                                        <Stat value={(userData.followerIds || []).length} label="Seguidores" />
                                        <div className="w-px h-8 bg-white/10 mx-2"></div>
                                        <Stat value={(userData.followingIds || []).length} label="Seguindo" />
                                    </div>
                                    
                                    {onNavigateToEdit && (
                                        <button 
                                            onClick={onNavigateToEdit}
                                            className="mt-6 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-anton uppercase tracking-widest transition-all text-white active:scale-[0.98]"
                                        >
                                            Editar Perfil
                                        </button>
                                    )}
                                </div>
                             </div>

                             {/* Grid de Fotos (Estilo Instagram - Sem Gaps) */}
                             <div>
                                 <div className="flex items-center justify-center gap-2 mb-3 opacity-60">
                                    <i className="fa-solid fa-grid text-[10px]"></i>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">Galeria</span>
                                 </div>

                                 {myPosts.length > 0 ? (
                                    <div className="grid grid-cols-3 gap-0.5">
                                        {myPosts.map((post) => (
                                        <motion.div 
                                            key={post.id}
                                            className="aspect-square bg-surface-200 cursor-pointer relative group overflow-hidden"
                                            whileTap={{ opacity: 0.8 }}
                                            onClick={() => post.imageUrl && onViewImage(post.imageUrl)}
                                        >
                                            {post.imageUrl ? (
                                                <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover"/>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500 bg-surface-300">
                                                    <p className="text-[8px] text-center px-1 line-clamp-3">{post.content}</p>
                                                </div>
                                            )}
                                            {/* Likes Overlay on Hover/Tap */}
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 font-bold text-sm">
                                                <i className="fa-solid fa-heart"></i> {(post.likedByUserIds || []).length}
                                            </div>
                                        </motion.div>
                                        ))}
                                    </div>
                                 ) : (
                                     <div className="py-20 text-center mx-4 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                                         <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <i className="fa-solid fa-image text-xl text-gray-600"></i>
                                         </div>
                                         <p className="font-anton uppercase text-base text-gray-500 tracking-wide">Sem fotos</p>
                                         <p className="text-xs text-gray-600 mt-1">Suas publicações aparecerão aqui.</p>
                                     </div>
                                 )}
                             </div>
                        </motion.div>
                    ) : activeTab === 'progresso' ? (
                        <motion.div 
                            key="progresso"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4 px-4"
                        >
                            {/* Stats Summary */}
                            <div className="bg-surface-100/50 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
                                <h3 className="font-anton uppercase text-lg text-white mb-6 tracking-wide flex items-center gap-2">
                                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                                    Performance Semanal
                                </h3>
                                <div className="grid grid-cols-3 gap-2 text-center divide-x divide-white/5">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-bold">Km Totais</p>
                                        <p className="text-2xl font-anton text-white">12.5</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-bold">Horas</p>
                                        <p className="text-2xl font-anton text-white">2.5</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1 font-bold">Kcal</p>
                                        <p className="text-2xl font-anton text-white">1.2k</p>
                                    </div>
                                </div>

                                {/* Graphic Bars */}
                                <div className="mt-8 h-32 flex items-end justify-between gap-2 px-2">
                                    {WEEKLY_DATA.map((d, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                            <div className="w-full relative">
                                                <div 
                                                    className="w-full bg-gradient-to-t from-surface-300 to-primary rounded-t-sm transition-all duration-500 group-hover:to-primary-hover" 
                                                    style={{ height: `${d.value}px`, opacity: d.value > 0 ? 1 : 0.2 }}
                                                ></div>
                                            </div>
                                            <span className="text-[9px] text-gray-500 font-bold">{d.day}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Streak Card */}
                            <div className="bg-gradient-to-r from-orange-900/20 to-primary/10 border border-primary/20 rounded-3xl p-6 flex justify-between items-center relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-xs text-primary font-bold uppercase tracking-widest mb-1">Sequência Ativa</p>
                                    <h3 className="font-anton uppercase text-3xl text-white tracking-wide">3 Dias</h3>
                                    <p className="text-[10px] text-gray-400 mt-1">Continue assim para ganhar badges!</p>
                                </div>
                                <div className="relative z-10 flex flex-col items-center">
                                    <i className="fa-solid fa-fire text-4xl text-primary animate-pulse drop-shadow-[0_0_10px_rgba(252,82,0,0.5)]"></i>
                                </div>
                                {/* Glow Effect */}
                                <div className="absolute right-0 top-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none"></div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="atividades"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-3 px-4"
                        >
                            {activities.length > 0 ? (
                                activities.map(act => (
                                    <ActivityItem 
                                        key={act.id} 
                                        activity={act} 
                                        onClick={() => setSelectedActivity(act)}
                                    />
                                ))
                            ) : (
                                 <div className="text-center py-20 opacity-50 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                                        <i className="fa-solid fa-person-running text-2xl text-gray-500"></i>
                                    </div>
                                    <p className="font-anton uppercase text-lg text-gray-500 tracking-wide">Sem atividades</p>
                                    <p className="text-xs text-gray-600 max-w-[200px]">Suas corridas, caminhadas e treinos registrados aparecerão aqui.</p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {selectedActivity && (
                    <ActivityDetailPage 
                        activity={selectedActivity} 
                        userData={userData} 
                        onBack={() => setSelectedActivity(null)} 
                    />
                )}
            </AnimatePresence>
            
            <SettingsMenu 
                isOpen={isSettingsOpen} 
                onClose={() => setSettingsOpen(false)} 
                userData={userData}
                onUpdateUserData={onUpdateUserData || (() => {})}
                onLogout={onLogout || (() => {})}
                onNavigate={onNavigate || (() => {})}
            />
        </div>
    );
};

export default StatsHubPage;
