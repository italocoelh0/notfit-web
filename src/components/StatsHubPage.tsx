
import React, { useState, useMemo } from 'react';
import { UserData, RecordedActivity } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime, formatPace } from '@lib/geolocation';
import ActivityDetailPage from './ActivityDetailPage';

interface StatsHubPageProps {
  userData: UserData;
  onViewImage: (url: string) => void;
}

// Mock Data for Chart if no real data exists
const WEEKLY_DATA = [
    { day: 'S', value: 30 },
    { day: 'T', value: 0 },
    { day: 'Q', value: 45 },
    { day: 'Q', value: 60 },
    { day: 'S', value: 0 },
    { day: 'S', value: 90 },
    { day: 'D', value: 20 },
];

// Calendar Generator (Simple Mock for current month)
const generateCalendarDays = () => {
    const days = [];
    const totalDays = 30;
    const startDayOffset = 2; // Starts on Tuesday for example

    for (let i = 0; i < startDayOffset; i++) days.push({ day: 0, active: false });
    for (let i = 1; i <= totalDays; i++) {
        // Random active days for demo
        const active = [2, 5, 8, 12, 14, 15, 19, 22, 23, 28].includes(i);
        days.push({ day: i, active });
    }
    return days;
};

const ActivityItem: React.FC<{ activity: RecordedActivity; onClick: () => void }> = ({ activity, onClick }) => (
    <div onClick={onClick} className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors">
        <div className="w-12 h-12 rounded-full bg-surface-200 flex items-center justify-center border border-white/5 text-2xl">
            <i className={activity.sport.icon}></i>
        </div>
        <div className="flex-1">
            <div className="flex justify-between items-start">
                <h4 className="font-anton text-white uppercase tracking-wide">{activity.title || activity.sport.name}</h4>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                    {new Date(activity.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </span>
            </div>
            <div className="flex gap-4 mt-1">
                <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Distância</p>
                    <p className="text-sm font-bold text-white">{activity.distance.toFixed(2)} km</p>
                </div>
                <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Tempo</p>
                    <p className="text-sm font-bold text-white">{formatTime(activity.time)}</p>
                </div>
                 <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Ritmo</p>
                    <p className="text-sm font-bold text-white">{formatPace(activity.pace)}</p>
                </div>
            </div>
        </div>
        <i className="fa-solid fa-chevron-right text-gray-600 text-xs"></i>
    </div>
);

const StatsHubPage: React.FC<StatsHubPageProps> = ({ userData }) => {
    const [activeTab, setActiveTab] = useState<'progresso' | 'atividades'>('progresso');
    const [selectedActivity, setSelectedActivity] = useState<RecordedActivity | null>(null);
    const calendarDays = useMemo(() => generateCalendarDays(), []);

    const activities = userData.activities || [];

    return (
        <div className="pb-32">
            {/* Header & Tabs */}
            <div className="sticky top-16 z-20 bg-background/80 backdrop-blur-md -mx-4 px-4 pb-4 mb-6 border-b border-white/5">
                 <div className="flex justify-center items-center mb-4">
                    <h2 className="font-anton uppercase text-2xl tracking-widest text-white">
                        Suas <span className="text-primary">Estatísticas</span>
                    </h2>
                 </div>
                 
                 <div className="flex p-1 bg-surface-100 rounded-full border border-white/10">
                     <button 
                        onClick={() => setActiveTab('progresso')}
                        className={`flex-1 py-2 rounded-full text-xs font-anton uppercase tracking-widest transition-all ${activeTab === 'progresso' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                     >
                        Progresso
                     </button>
                     <button 
                        onClick={() => setActiveTab('atividades')}
                        className={`flex-1 py-2 rounded-full text-xs font-anton uppercase tracking-widest transition-all ${activeTab === 'atividades' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                     >
                        Atividades
                     </button>
                 </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'progresso' ? (
                    <motion.div 
                        key="progresso"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                    >
                        {/* Weekly Stats Summary */}
                        <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
                            <h3 className="font-anton uppercase text-lg text-white mb-4 tracking-wide border-l-4 border-primary pl-3">Esta Semana</h3>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Distância</p>
                                    <p className="text-2xl font-bold text-white">12.5 <span className="text-xs font-normal text-gray-500">km</span></p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Tempo</p>
                                    <p className="text-2xl font-bold text-white">2h <span className="text-xs font-normal text-gray-500">15m</span></p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Elev.</p>
                                    <p className="text-2xl font-bold text-white">120 <span className="text-xs font-normal text-gray-500">m</span></p>
                                </div>
                            </div>

                            {/* Simple Bar Chart */}
                            <div className="mt-8 h-32 flex items-end justify-between gap-2">
                                {WEEKLY_DATA.map((d, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                        <div 
                                            className="w-full bg-gradient-to-t from-surface-200 to-primary/50 rounded-t-sm relative group" 
                                            style={{ height: `${d.value}%` }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-bold px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                {d.value}%
                                            </div>
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-bold">{d.day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Calendar / Streak */}
                        <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-3xl p-6">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Sua sequência</p>
                                    <h3 className="font-anton uppercase text-2xl text-white tracking-wide">1 Semana</h3>
                                </div>
                                <div className="flex items-center gap-2 text-primary">
                                    <i className="fa-solid fa-fire text-2xl animate-pulse"></i>
                                    <span className="font-bold text-xl">3</span>
                                </div>
                            </div>

                            {/* Calendar Grid */}
                            <div className="mb-4">
                                <p className="text-sm font-bold text-white capitalize mb-4">Novembro 2025</p>
                                <div className="grid grid-cols-7 gap-2 text-center text-xs text-gray-500 font-bold mb-2">
                                    <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
                                </div>
                                <div className="grid grid-cols-7 gap-2">
                                    {calendarDays.map((d, i) => (
                                        <div 
                                            key={i} 
                                            className={`aspect-square rounded-full flex items-center justify-center text-xs font-medium border 
                                            ${d.day === 0 ? 'invisible' : ''}
                                            ${d.active 
                                                ? 'bg-primary text-white border-primary shadow-[0_0_10px_rgba(252,82,0,0.4)]' 
                                                : 'bg-white/5 border-white/5 text-gray-500'
                                            }`}
                                        >
                                            {d.day}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="atividades"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
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
                             <div className="text-center py-20 opacity-50">
                                <i className="fa-solid fa-person-running text-4xl mb-4 block text-gray-600"></i>
                                <p className="font-anton uppercase text-xl text-gray-500 tracking-wide">Nenhuma atividade registrada</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedActivity && (
                    <ActivityDetailPage 
                        activity={selectedActivity} 
                        userData={userData} 
                        onBack={() => setSelectedActivity(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default StatsHubPage;
