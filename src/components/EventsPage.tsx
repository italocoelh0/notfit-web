
import React, { useState, useEffect, useRef } from 'react';
import { EventData, UserData, EventType, DashboardSection, Competition } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import EventDetailModal from './EventDetailModal';
import Avatar from './Avatar';

// --- Types for Groups (Mock) ---
interface GroupData {
    id: number;
    name: string;
    description: string;
    imageUrl: string;
    membersCount: number;
    isMember: boolean;
    category?: string;
}

interface SocialPageProps {
  events: EventData[];
  currentUser: UserData;
  onJoinEvent: (eventId: number) => void;
  onCreateEvent: (eventData: Omit<EventData, 'id' | 'creatorId' | 'participantIds' | 'updates'>) => void;
  onSendNotification: (message: string) => void;
  setActiveSection: (section: DashboardSection) => void;
  onCreateCompetition?: (compData: Omit<Competition, 'id' | 'currentUserScore' | 'participantsCount' | 'leaderboard'>) => void;
  allUsers?: UserData[];
}

// --- Mock Groups Data ---
const MOCK_GROUPS: GroupData[] = [
    {
        id: 1,
        name: "Corredores da Manhã",
        description: "Grupo focado em corridas matinais para começar o dia com energia.",
        imageUrl: "https://images.unsplash.com/photo-1552674605-46d50402f71c?q=80&w=1470&auto=format&fit=crop",
        membersCount: 142,
        isMember: false,
        category: "Corrida"
    },
    {
        id: 2,
        name: "Trilheiros de Fim de Semana",
        description: "Aventuras e trilhas para quem ama a natureza.",
        imageUrl: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=1470&auto=format&fit=crop",
        membersCount: 89,
        isMember: true,
        category: "Trilha"
    },
    {
        id: 3,
        name: "Calistenia Urbana",
        description: "Dominando o peso do corpo nas barras da cidade.",
        imageUrl: "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?q=80&w=1469&auto=format&fit=crop",
        membersCount: 205,
        isMember: false,
        category: "Calistenia"
    }
];

// --- Scoring Rules for Competitions ---
const SCORING_RULES = [
    { id: 'active_days', icon: 'fa-calendar-check', label: 'Dias ativos', desc: 'A maioria dos dias com pelo menos um check-in' },
    { id: 'hustle_points', icon: 'fa-star', label: 'Pontos de hustle', desc: 'Sistema de pontuação personalizável baseado em atividades' },
    { id: 'checkin_count', icon: 'fa-hashtag', label: 'Contagem de check-in', desc: 'Maior número de check-ins' },
    { id: 'duration', icon: 'fa-stopwatch', label: 'Duração', desc: 'A maior parte do tempo gasto ativo' },
    { id: 'distance', icon: 'fa-route', label: 'Distância', desc: 'Maior distância percorrida' },
    { id: 'steps', icon: 'fa-shoe-prints', label: 'Passos', desc: 'A maioria dos passos dados' },
    { id: 'calories', icon: 'fa-fire', label: 'Calorias', desc: 'Mais calorias queimadas' },
];

// --- Sub-Components ---

const CompetitionCard: React.FC<{ comp: Competition; onClick: () => void }> = ({ comp, onClick }) => (
    <div onClick={onClick} className="bg-surface-100 rounded-2xl p-4 border border-white/5 mb-3 relative overflow-hidden cursor-pointer hover:bg-surface-200 transition-colors active:scale-[0.98]">
        <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-lg bg-surface-200 flex-shrink-0 overflow-hidden border border-white/10">
                {comp.banner ? <img src={comp.banner} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-2xl"><i className="fa-solid fa-trophy text-gray-500"></i></div>}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-anton uppercase text-white truncate">{comp.name}</h4>
                <p className="text-xs text-gray-400 line-clamp-1">{comp.description}</p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded uppercase tracking-wider">{comp.scoringRule.label}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{new Date(comp.endDate).toLocaleDateString('pt-BR', {day: '2-digit', month:'short'})}</span>
                </div>
            </div>
            <div className="text-right">
                <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Pontos</span>
                <span className="text-xl font-anton text-white">{comp.currentUserScore?.toFixed(0) || 0}</span>
            </div>
        </div>
    </div>
);

const EventListItem: React.FC<{
    event: EventData;
    onClick: () => void;
    isParticipating: boolean;
    onToggleJoin: (e: React.MouseEvent) => void;
}> = ({ event, onClick, isParticipating, onToggleJoin }) => (
    <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={onClick}
        className="bg-surface-100 rounded-2xl p-4 border border-white/5 cursor-pointer hover:bg-surface-200 transition-colors group"
    >
        <div className="flex gap-4">
            <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-surface-200">
                <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase">
                    {new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h4 className="font-anton uppercase text-white truncate pr-2 text-sm">{event.title}</h4>
                    {event.requiresApproval && <i className="fa-solid fa-lock text-[10px] text-gray-500 mt-1"></i>}
                </div>
                <p className="text-xs text-gray-400 line-clamp-2 mb-2">{event.description}</p>
                <div className="flex justify-between items-end">
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-2">
                        <span><i className="fa-solid fa-location-dot"></i> {event.location.city}</span>
                        <span>•</span>
                        <span>{event.time}</span>
                    </div>
                    <button
                        onClick={onToggleJoin}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                            isParticipating
                                ? 'bg-white/10 text-white border border-white/20'
                                : 'bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20'
                        }`}
                    >
                        {isParticipating ? 'Participando' : 'Entrar'}
                    </button>
                </div>
            </div>
        </div>
    </motion.div>
);

const GroupListItem: React.FC<{
    group: GroupData;
    onToggle: () => void;
}> = ({ group, onToggle }) => (
    <div className="bg-surface-100 rounded-2xl p-4 border border-white/5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 flex-shrink-0 bg-surface-200">
            <img src={group.imageUrl} alt={group.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="font-anton uppercase text-white text-sm truncate">{group.name}</h4>
            <p className="text-xs text-gray-400 line-clamp-1 mb-1">{group.description}</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{group.membersCount} Membros</p>
        </div>
        <button
            onClick={onToggle}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                group.isMember 
                    ? 'bg-white/10 text-green-400 border border-white/10' 
                    : 'bg-surface-200 text-gray-400 hover:bg-surface-300 hover:text-white'
            }`}
        >
            <i className={`fa-solid ${group.isMember ? 'fa-check' : 'fa-plus'}`}></i>
        </button>
    </div>
);

const CreateEventModal: React.FC<{
    onClose: () => void;
    onCreateEvent: (eventData: any) => void;
}> = ({ onClose, onCreateEvent }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [type, setType] = useState<EventType>('Outro');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreateEvent({
            title,
            description,
            date,
            time,
            location: { city, state },
            type,
            imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1470&auto=format&fit=crop',
            participantIds: [],
            requiresApproval: false
        });
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-surface-100 w-full max-w-md rounded-2xl p-6 border border-white/10 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <h3 className="font-anton uppercase text-xl text-white mb-4 tracking-wide">Criar Evento</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary focus:outline-none transition-colors" required />
                    <textarea placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary focus:outline-none h-24 transition-colors" required />
                    <div className="grid grid-cols-2 gap-4">
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary focus:outline-none" required />
                        <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary focus:outline-none" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <input placeholder="Cidade" value={city} onChange={e => setCity(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary focus:outline-none" required />
                        <input placeholder="UF" value={state} onChange={e => setState(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary focus:outline-none" maxLength={2} required />
                    </div>
                    <select value={type} onChange={e => setType(e.target.value as EventType)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary focus:outline-none appearance-none">
                        <option value="Outro">Outro</option>
                        <option value="Corrida">Corrida</option>
                        <option value="Trilha">Trilha</option>
                        <option value="Ciclismo">Ciclismo</option>
                    </select>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-surface-200 text-gray-300 font-bold text-xs uppercase tracking-wider hover:bg-surface-300 transition-colors">Cancelar</button>
                        <button type="submit" className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">Criar</button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

const CreateGroupModal: React.FC<{
    onClose: () => void;
    onCreateGroup: (groupData: any) => void;
}> = ({ onClose, onCreateGroup }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onCreateGroup({
            name,
            description,
            category,
            imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1470&auto=format&fit=crop'
        });
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className="bg-surface-100 w-full max-w-md rounded-2xl p-6 border border-white/10 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <h3 className="font-anton uppercase text-xl text-white mb-4 tracking-wide">Novo Grupo</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input placeholder="Nome do Grupo" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary focus:outline-none transition-colors" required />
                    <textarea placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary focus:outline-none h-24 transition-colors" required />
                    <input placeholder="Categoria (ex: Corrida)" value={category} onChange={e => setCategory(e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary focus:outline-none transition-colors" required />
                    
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl bg-surface-200 text-gray-300 font-bold text-xs uppercase tracking-wider hover:bg-surface-300 transition-colors">Cancelar</button>
                        <button type="submit" className="flex-1 py-3 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-wider hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20">Criar</button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

const SocialHubCard: React.FC<{
    onClick: () => void;
    icon: string;
    title: string;
    subtitle: string;
    bgImage?: string;
}> = ({ onClick, icon, title, subtitle, bgImage }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="relative w-full p-4 rounded-2xl border border-white/10 cursor-pointer overflow-hidden group transition-all duration-300 flex items-center gap-4 bg-black/40 hover:bg-white/5"
    >
         {bgImage && (
            <div className="absolute inset-0 opacity-30 group-hover:opacity-40 transition-opacity">
                <img src={bgImage} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                <div className="absolute inset-0 bg-black/50"></div>
            </div>
         )}

        <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-br from-surface-200 to-black border border-white/10 flex items-center justify-center shrink-0 shadow-lg">
            <i className={`${icon} text-xl text-white`}></i>
        </div>

        <div className="relative z-10 flex-1">
            <h3 className="font-anton uppercase text-lg tracking-wide text-white">
                {title}
            </h3>
            <p className="text-xs text-gray-300 uppercase tracking-wider font-medium mt-0.5">
                {subtitle}
            </p>
        </div>

        <div className="relative z-10 text-white/20 group-hover:text-primary transition-colors">
            <i className="fa-solid fa-chevron-right text-lg"></i>
        </div>
    </motion.div>
);

// --- Competitions Component ---
const CompetitionsView: React.FC<{ onBack: () => void; currentUser: UserData; onCreate: (data: any) => void; allUsers?: UserData[] }> = ({ onBack, currentUser, onCreate, allUsers }) => {
    const [step, setStep] = useState<'list' | 'create_1' | 'create_2' | 'create_3' | 'dashboard'>('list');
    // State for viewing an existing competition
    const [selectedComp, setSelectedComp] = useState<Competition | null>(null);
    const [dashboardTab, setDashboardTab] = useState<'details' | 'ranking' | 'chat'>('details');
    const [memberSearchQuery, setMemberSearchQuery] = useState('');

    const [compData, setCompData] = useState({
        name: '',
        description: '',
        startDate: '21 de nov. de 2025', // Mock initial date
        endDate: '',
        duration: 30, // Default 30 days
        banner: null as string | null,
        scoringRule: SCORING_RULES[2],
        privacy: 'open'
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const activeCompetitions = currentUser.competitions || [];

    // If we are in dashboard, we are either viewing an existing competition or just finished creating one
    const isCreator = selectedComp ? selectedComp.creatorId === currentUser.id : true; // Default true for new creation flow

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const result = ev.target?.result as string;
                if(step === 'dashboard' && selectedComp) {
                    // Directly update mock data for preview
                    setSelectedComp({...selectedComp, banner: result});
                } else {
                    setCompData({ ...compData, banner: result });
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(`https://share.gymrats.app/join?code=CORZLBAY`);
        alert("Link copiado!");
    };

    const handleFinalizeCreation = () => {
        const now = new Date();
        const end = new Date();
        end.setDate(now.getDate() + compData.duration);

        const newComp = {
            name: compData.name,
            description: compData.description,
            banner: compData.banner,
            startDate: now.toISOString(),
            endDate: end.toISOString(),
            duration: compData.duration,
            scoringRule: {
                id: compData.scoringRule.id,
                label: compData.scoringRule.label,
                icon: compData.scoringRule.icon
            },
            privacy: compData.privacy as 'open' | 'restricted'
        };
        onCreate(newComp);
        setStep('list');
    };

    const renderBackHeader = (title: string, backAction: () => void) => (
        <div className="fixed top-0 left-0 w-full z-[60] px-4 py-4 flex items-center gap-3 bg-gradient-to-b from-black/90 to-transparent pt-6 pt-safe">
            <button 
                onClick={backAction} 
                className="w-10 h-10 flex items-center justify-center bg-surface-200 rounded-full text-white hover:bg-primary hover:text-white transition-colors border border-white/10"
            >
                <i className="fa-solid fa-arrow-left"></i>
            </button>
            <span className="font-anton uppercase tracking-wider text-lg text-white">{title}</span>
        </div>
    );

    const calculateEndDate = (duration: number) => {
        const start = new Date();
        start.setDate(start.getDate() + duration);
        return start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const handleAddMember = (user: UserData) => {
        if (!selectedComp) return;
        // Check if already member
        if (selectedComp.leaderboard.some(m => m.userId === user.id)) return;

        const newMember = {
            userId: user.id,
            name: user.name,
            avatar: user.userAvatar,
            score: 0
        };
        
        // In a real app, this would be an API call. Here we update local state for preview.
        setSelectedComp({
            ...selectedComp,
            participantsCount: selectedComp.participantsCount + 1,
            leaderboard: [...selectedComp.leaderboard, newMember]
        });
        setMemberSearchQuery('');
    };

    const handleRemoveMember = (userId: string) => {
        if (!selectedComp) return;
        setSelectedComp({
            ...selectedComp,
            participantsCount: selectedComp.participantsCount - 1,
            leaderboard: selectedComp.leaderboard.filter(m => m.userId !== userId)
        });
    };

    // --- RENDER STEPS ---

    if (step === 'list') {
        return (
            <div className="h-full flex flex-col pt-20 px-4">
                {renderBackHeader("Competições", onBack)}

                <div className="text-center mb-8 mt-4">
                    <h2 className="font-anton uppercase text-3xl text-white tracking-wide">Seus Desafios</h2>
                    <p className="text-gray-400 text-sm mt-2">Desafie seus amigos e supere limites.</p>
                </div>

                {activeCompetitions.length > 0 ? (
                    <div className="flex-1 overflow-y-auto custom-scrollbar mb-8">
                        {activeCompetitions.map(comp => (
                            <CompetitionCard 
                                key={comp.id} 
                                comp={comp} 
                                onClick={() => {
                                    setSelectedComp(comp);
                                    setStep('dashboard');
                                    setDashboardTab('details');
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center opacity-60 mb-10">
                        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                            <i className="fa-solid fa-trophy text-4xl text-gray-500"></i>
                        </div>
                        <p className="text-gray-500 font-anton uppercase tracking-wide text-lg">Nenhuma competição ativa</p>
                    </div>
                )}

                <button 
                    onClick={() => {
                        setSelectedComp(null);
                        setStep('create_1');
                    }}
                    className="w-full bg-primary text-white font-anton uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform mb-8"
                >
                    Criar Desafio
                </button>
            </div>
        );
    }

    // Creation Steps 1-3 remain largely the same...
    if (step === 'create_1') {
        return (
            <div className="h-full flex flex-col pt-24 px-4 bg-black overflow-y-auto custom-scrollbar pb-20">
                {renderBackHeader("Novo Desafio", () => setStep('list'))}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-anton uppercase text-2xl text-white tracking-wide text-primary">CRIE O DESAFIO</h2>
                    <button onClick={() => setStep('create_2')} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-colors">Próximo <i className="fa-solid fa-arrow-right ml-1"></i></button>
                </div>
                {/* Banner Upload */}
                <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-video rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center mb-8 relative overflow-hidden cursor-pointer group hover:border-primary/50 hover:bg-white/5 transition-all shadow-lg">
                    {compData.banner ? <img src={compData.banner} className="w-full h-full object-cover transition-opacity group-hover:opacity-80" /> : <><div className="w-16 h-16 rounded-full bg-surface-200 border border-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform group-hover:border-primary/50 shadow-lg"><i className="fa-solid fa-camera text-2xl text-gray-400 group-hover:text-white transition-colors"></i></div><span className="text-gray-400 text-xs uppercase tracking-widest font-bold group-hover:text-primary transition-colors">Adicionar Banner</span></>}
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                </div>
                <div className="space-y-6">
                    <div><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Nome do Desafio</label><input type="text" placeholder="Ex: Desafio de Verão" value={compData.name} onChange={(e) => setCompData({...compData, name: e.target.value})} className="w-full bg-surface-100 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors font-bold shadow-sm"/></div>
                    <div><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Descrição</label><textarea placeholder="Descreva as regras e o objetivo..." value={compData.description} onChange={(e) => setCompData({...compData, description: e.target.value})} className="w-full bg-surface-100 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors text-sm h-24 resize-none shadow-sm"/></div>
                    <div className="bg-surface-100 rounded-xl p-4 border border-white/10"><div className="flex justify-between items-center py-2 border-b border-white/5 mb-3"><span className="text-gray-400 text-sm">Data de início</span><span className="text-white font-bold text-sm">Hoje</span></div><label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Duração</label><div className="grid grid-cols-4 gap-2 mb-3">{[1, 7, 15, 30].map((days) => (<button key={days} onClick={() => setCompData({...compData, duration: days})} className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${compData.duration === days ? 'bg-primary border-primary text-white shadow-lg' : 'bg-black/20 border-white/10 text-gray-400 hover:bg-white/5'}`}>{days} {days === 1 ? 'Dia' : 'Dias'}</button>))}</div><div className="flex justify-between items-center py-2 border-t border-white/5 mt-2 pt-3"><span className="text-gray-400 text-sm">Data final estimada</span><span className="text-primary font-bold text-sm">{calculateEndDate(compData.duration)}</span></div></div>
                </div>
            </div>
        );
    }

    if (step === 'create_2') {
        return (
            <div className="h-full flex flex-col pt-24 px-4 bg-black">
                {renderBackHeader("Regras", () => setStep('create_1'))}
                <div className="mb-6"><h2 className="font-anton uppercase text-xl text-white">Sistema de pontuação</h2><p className="text-gray-400 text-xs mt-1">Como o vencedor será decidido?</p></div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pb-10">{SCORING_RULES.map(rule => (<div key={rule.id} onClick={() => { setCompData({...compData, scoringRule: rule}); setStep('create_3'); }} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 active:scale-[0.98] transition-all cursor-pointer group"><div className="w-10 h-10 rounded-full bg-surface-200 flex items-center justify-center group-hover:bg-primary transition-colors"><i className={`fa-solid ${rule.icon} text-white text-lg`}></i></div><div className="flex-1"><h4 className="text-white font-bold text-sm uppercase tracking-wide">{rule.label}</h4><p className="text-gray-500 text-xs leading-tight mt-1">{rule.desc}</p></div><i className="fa-solid fa-chevron-right text-gray-600 text-xs group-hover:text-white transition-colors"></i></div>))}</div>
            </div>
        );
    }

    if (step === 'create_3') {
        return (
            <div className="h-full flex flex-col pt-24 px-4 bg-black relative">
                {renderBackHeader("Convidar", () => setStep('create_2'))}
                <div className="mb-8"><h2 className="font-anton uppercase text-2xl text-white mb-2">Convidar para desafio</h2><p className="text-gray-400 text-sm">Convide membros para o grupo compartilhando o link abaixo.</p></div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between mb-8"><span className="text-xs text-gray-300 truncate mr-2 font-mono bg-black/20 px-2 py-1 rounded">gymrats.app/join?code=CORZLBAY</span><button onClick={copyLink} className="text-primary text-xs font-bold uppercase tracking-wider hover:text-white transition-colors">Copiar</button></div>
                <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Privacidade</h3>
                <div className="space-y-3 mb-10">
                    <div onClick={() => setCompData({...compData, privacy: 'open'})} className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl border transition-colors ${compData.privacy === 'open' ? 'bg-white/10 border-primary' : 'bg-surface-100 border-white/5'}`}><div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${compData.privacy === 'open' ? 'border-primary' : 'border-gray-500'}`}>{compData.privacy === 'open' && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}</div><div><p className="text-white font-bold text-sm">Aberto</p><p className="text-gray-500 text-xs">Qualquer pessoa com o link pode participar.</p></div></div>
                    <div onClick={() => setCompData({...compData, privacy: 'restricted'})} className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl border transition-colors ${compData.privacy === 'restricted' ? 'bg-white/10 border-primary' : 'bg-surface-100 border-white/5'}`}><div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${compData.privacy === 'restricted' ? 'border-primary' : 'border-gray-500'}`}>{compData.privacy === 'restricted' && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}</div><div><p className="text-white font-bold text-sm">Restrito</p><p className="text-gray-500 text-xs">Você deve aprovar cada membro.</p></div></div>
                </div>
                <div className="mt-auto pb-8"><button onClick={() => { if (navigator.share) { navigator.share({ title: compData.name, url: 'https://share.gymrats.app/join?code=CORZLBAY' }); } handleFinalizeCreation(); }} className="w-full bg-primary text-white font-anton uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 mb-3 hover:scale-[1.02] transition-transform shadow-lg shadow-primary/20"><i className="fa-solid fa-arrow-up-from-bracket"></i> Compartilhar & Finalizar</button><button onClick={handleFinalizeCreation} className="w-full text-gray-500 hover:text-white font-bold text-xs uppercase tracking-wider py-3 transition-colors">Pular por enquanto</button></div>
            </div>
        );
    }

    // 5. DASHBOARD - OVERHAULED FOR CONTROLLER / VIEWER
    if (step === 'dashboard') {
        const displayData = selectedComp || {
            name: compData.name,
            description: compData.description,
            banner: compData.banner,
            duration: compData.duration,
            currentUserScore: 0,
            participantsCount: 1,
            leaderboard: [],
            scoringRule: SCORING_RULES[0],
            creatorId: currentUser.id
        };

        const isNewCreation = !selectedComp;

        return (
            <div className="h-full flex flex-col pt-24 px-4 bg-black">
                {renderBackHeader(displayData.name || "Desafio", () => {
                    if (isNewCreation) handleFinalizeCreation();
                    else { setStep('list'); setSelectedComp(null); }
                })}

                <div className="flex-1 overflow-y-auto custom-scrollbar pb-[100px]">
                    {/* Banner Section (Editable for Leader) */}
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-6 border border-white/10 group">
                        {displayData.banner ? (
                            <img src={displayData.banner} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-surface-200 flex items-center justify-center text-white/20">
                                <i className="fa-solid fa-image text-4xl"></i>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        
                        {isCreator && (
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white cursor-pointer hover:bg-primary transition-colors z-20"
                            >
                                <i className="fa-solid fa-pencil text-xs"></i>
                            </div>
                        )}
                        
                        <div className="absolute bottom-4 left-4 right-4">
                            {isCreator ? (
                                <input 
                                    type="text"
                                    value={selectedComp ? selectedComp.name : compData.name}
                                    onChange={(e) => setSelectedComp(prev => prev ? {...prev, name: e.target.value} : null)}
                                    className="bg-transparent text-2xl font-anton uppercase text-white w-full focus:outline-none focus:border-b focus:border-primary mb-1"
                                />
                            ) : (
                                <h2 className="text-2xl font-anton uppercase text-white tracking-wide mb-1">{displayData.name}</h2>
                            )}
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                                <span className="bg-primary/20 text-primary px-2 py-0.5 rounded font-bold uppercase tracking-wider">{displayData.scoringRule?.label || 'Pontos'}</span>
                                <span>• {displayData.duration} dias</span>
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                    </div>

                    {/* Description */}
                    <div className="mb-6 px-1">
                        {isCreator ? (
                            <textarea
                                value={selectedComp ? selectedComp.description : compData.description}
                                onChange={(e) => setSelectedComp(prev => prev ? {...prev, description: e.target.value} : null)}
                                className="w-full bg-surface-100/50 text-sm text-gray-300 p-3 rounded-xl border border-white/5 focus:border-primary focus:outline-none resize-none"
                                rows={3}
                                placeholder="Descrição do desafio..."
                            />
                        ) : (
                            <p className="text-sm text-gray-400 leading-relaxed">{displayData.description}</p>
                        )}
                    </div>

                    {/* Leader Info */}
                    <div className="flex items-center gap-3 mb-6 bg-surface-100 p-3 rounded-xl border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                            <i className="fa-solid fa-crown"></i>
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Líder do Desafio</p>
                            <p className="text-sm text-white font-bold">
                                {isCreator ? 'Você' : 'Organizador'}
                            </p>
                        </div>
                    </div>

                    {/* Ranking / Members List */}
                    {dashboardTab === 'ranking' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-anton uppercase text-white text-lg tracking-wide">Participantes ({displayData.leaderboard?.length || 0})</h3>
                                {!isCreator && <button onClick={copyLink} className="text-xs text-primary font-bold uppercase tracking-wider hover:text-white transition-colors">Convidar +</button>}
                            </div>

                            {/* Member Search (Leader Only) */}
                            {isCreator && (
                                <div className="relative mb-4">
                                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
                                    <input 
                                        type="text" 
                                        placeholder="Adicionar membro (@usuario)" 
                                        value={memberSearchQuery}
                                        onChange={(e) => setMemberSearchQuery(e.target.value)}
                                        className="w-full bg-surface-100 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-primary"
                                    />
                                    {memberSearchQuery && (
                                        <div className="absolute top-full left-0 right-0 bg-surface-200 border border-white/10 rounded-b-lg z-20 max-h-40 overflow-y-auto">
                                            {allUsers?.filter(u => u.username.includes(memberSearchQuery) && !displayData.leaderboard.some(m => m.userId === u.id)).map(u => (
                                                <div key={u.id} onClick={() => handleAddMember(u)} className="p-2 hover:bg-white/10 cursor-pointer flex items-center gap-2">
                                                    <Avatar src={u.userAvatar} size="sm" />
                                                    <span className="text-xs text-white">{u.username}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {displayData.leaderboard && displayData.leaderboard.length > 0 ? (
                                displayData.leaderboard
                                    .sort((a, b) => b.score - a.score)
                                    .map((user, index) => (
                                        <div key={user.userId} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${user.userId === currentUser.id ? 'bg-primary/10 border-primary/30' : 'bg-surface-100 border-white/5'}`}>
                                            <div className="w-6 text-center font-anton text-lg text-white/50">
                                                {index + 1}
                                            </div>
                                            <Avatar src={user.avatar} alt={user.name} size="sm" />
                                            <div className="flex-1">
                                                <p className="text-white font-bold text-sm">{user.name}</p>
                                                {user.userId === currentUser.id && <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Você</span>}
                                            </div>
                                            <div className="text-right flex items-center gap-3">
                                                <span className="block font-anton text-lg text-white">{user.score} <span className="text-[10px] text-gray-500 font-sans font-normal">pts</span></span>
                                                {isCreator && user.userId !== currentUser.id && (
                                                    <button onClick={() => handleRemoveMember(user.userId)} className="text-gray-600 hover:text-red-500 transition-colors">
                                                        <i className="fa-solid fa-times"></i>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p>Nenhum participante pontuou ainda.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {dashboardTab === 'chat' && (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                            <i className="fa-regular fa-comments text-3xl mb-2"></i>
                            <p className="text-xs uppercase tracking-widest">Chat do Grupo em breve</p>
                        </div>
                    )}
                </div>

                {/* Custom Bottom Navigation for Competition Dashboard */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end px-8 bg-black/95 backdrop-blur-lg pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-white/10 z-30">
                     <button 
                        onClick={() => setDashboardTab('ranking')}
                        className={`flex flex-col items-center gap-1 w-16 ${dashboardTab === 'ranking' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                     >
                         <i className="fa-solid fa-medal text-xl"></i>
                         <span className="text-[10px] font-bold uppercase tracking-wider">Ranking</span>
                     </button>

                     {/* The Big Orange Action Button */}
                     <button 
                        onClick={() => {
                            if (isCreator) {
                                // Save changes (mock)
                                alert("Alterações salvas!");
                            } else {
                                copyLink();
                            }
                        }}
                        className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-3xl shadow-[0_0_20px_rgba(252,82,0,0.5)] -mb-6 transform hover:scale-110 transition-transform border-4 border-black"
                     >
                         <i className={`fa-solid ${isCreator ? 'fa-check' : 'fa-user-plus'}`}></i>
                     </button>

                     <button 
                        onClick={() => setDashboardTab('chat')}
                        className={`flex flex-col items-center gap-1 w-16 ${dashboardTab === 'chat' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                     >
                         <i className="fa-regular fa-comment text-xl"></i>
                         <span className="text-[10px] font-bold uppercase tracking-wider">Chat</span>
                     </button>
                </div>
            </div>
        );
    }

    return null;
};

export const SocialPage: React.FC<SocialPageProps> = ({ events, currentUser, onJoinEvent, onCreateEvent, onSendNotification, setActiveSection, onCreateCompetition, allUsers }) => {
  const [view, setView] = useState<'hub' | 'events' | 'groups' | 'competitions'>('hub');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [groups, setGroups] = useState<GroupData[]>(MOCK_GROUPS);

  const handleToggleGroup = (id: number) => {
      setGroups(prev => prev.map(g => g.id === id ? { ...g, isMember: !g.isMember } : g));
      onSendNotification("Status do grupo atualizado!");
  };

  const handleCreateGroup = (data: any) => {
      const newGroup: GroupData = {
          id: Date.now(),
          name: data.name,
          description: data.description,
          imageUrl: data.imageUrl,
          membersCount: 1,
          isMember: true,
          category: data.category
      };
      setGroups(prev => [newGroup, ...prev]);
      onSendNotification("Grupo criado com sucesso!");
  };

  // The entire Social section is wrapped in a fixed full-screen container to ensure
  // the Dashboard header (with profile button) is covered by the Social headers.
  return (
    <div className="fixed inset-0 z-[50] w-full h-full bg-black flex flex-col overflow-hidden">
      {/* Content Area - Scrollable */}
      <div className="flex-1 overflow-y-auto custom-scrollbar w-full h-full">
        {view === 'hub' && (
            <div className="w-full h-full flex flex-col items-center justify-center pb-20 pt-16 px-4 relative">
                {/* Back Header for HUB */}
                <div className="absolute top-0 left-0 w-full z-[60] px-4 py-4 flex items-center gap-3 bg-gradient-to-b from-black/90 to-transparent pt-6">
                        <button 
                            onClick={() => setActiveSection('feed')} 
                            className="w-10 h-10 flex items-center justify-center bg-surface-200 rounded-full text-white hover:bg-primary hover:text-white transition-colors border border-white/10"
                        >
                            <i className="fa-solid fa-arrow-left"></i>
                        </button>
                        <span className="font-anton uppercase tracking-wider text-lg text-white">Social</span>
                </div>

                {/* Background decorative elements */}
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full filter blur-[150px] opacity-30 animate-pulse pointer-events-none"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full filter blur-[150px] opacity-30 animate-pulse delay-1000 pointer-events-none"></div>

                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 w-full max-w-md flex flex-col justify-center gap-6 mt-8"
                >
                    <div className="text-center mb-4">
                        <h1 className="font-anton uppercase text-4xl text-white tracking-widest drop-shadow-lg">
                            Social <span className="text-primary">Hub</span>
                        </h1>
                        <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] mt-2">Conecte-se e mova-se</p>
                    </div>

                    <div className="w-full space-y-4">
                        <SocialHubCard 
                            title="Eventos" 
                            subtitle="Participe de encontros e treinos" 
                            icon="fa-solid fa-calendar-day"
                            onClick={() => setView('events')}
                            bgImage="https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=1470&auto=format&fit=crop"
                        />
                        <SocialHubCard 
                            title="Grupos" 
                            subtitle="Entre para comunidades exclusivas" 
                            icon="fa-solid fa-users"
                            onClick={() => setView('groups')}
                            bgImage="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1470&auto=format&fit=crop"
                        />
                        <SocialHubCard 
                            title="Competições" 
                            subtitle="Compita com seus amigos" 
                            icon="fa-solid fa-trophy"
                            onClick={() => setView('competitions')}
                            bgImage="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1470&auto=format&fit=crop"
                        />
                    </div>
                </motion.div>
            </div>
        )}

        {view === 'events' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-32 pt-16 px-4 max-w-md mx-auto">
                {/* Back Header for EVENTS */}
                <div className="fixed top-0 left-0 w-full z-[60] px-4 py-4 flex items-center gap-3 bg-background/90 backdrop-blur-md border-b border-white/5 pt-6">
                    <button onClick={() => setView('hub')} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <h2 className="font-anton uppercase text-xl text-white tracking-wide">Eventos</h2>
                </div>

                <div className="mb-8 text-center mt-4">
                    <button 
                        onClick={() => setCreateModalOpen(true)} 
                        className="bg-white/5 border border-white/10 hover:bg-primary hover:border-primary text-white font-anton uppercase tracking-widest py-4 px-8 rounded-2xl text-sm transition-all duration-300 group"
                    >
                        <i className="fa-solid fa-plus mr-2 group-hover:rotate-90 transition-transform duration-300"></i> 
                        Criar Novo Evento
                    </button>
                </div>

                {events.length > 0 ? (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {events.map(event => (
                                <EventListItem 
                                    key={event.id} 
                                    event={event} 
                                    onClick={() => setSelectedEvent(event)}
                                    isParticipating={event.participantIds.includes(currentUser.id)}
                                    onToggleJoin={(e) => { e.stopPropagation(); onJoinEvent(event.id); }}
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-20 opacity-50">
                        <i className="fa-solid fa-calendar-xmark text-4xl mb-4 block text-gray-600"></i>
                        <p className="font-anton uppercase text-xl text-gray-500 tracking-wide">Nenhum evento encontrado</p>
                    </div>
                )}
            </motion.div>
        )}

        {view === 'groups' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-32 pt-16 px-4 max-w-md mx-auto">
                {/* Back Header for GROUPS */}
                 <div className="fixed top-0 left-0 w-full z-[60] px-4 py-4 flex items-center gap-3 bg-background/90 backdrop-blur-md border-b border-white/5 pt-6">
                    <button onClick={() => setView('hub')} className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors">
                        <i className="fa-solid fa-arrow-left"></i>
                    </button>
                    <h2 className="font-anton uppercase text-xl text-white tracking-wide">Grupos</h2>
                </div>

                <div className="mb-8 text-center mt-4">
                    <button 
                        onClick={() => setCreateGroupModalOpen(true)} 
                        className="bg-white/5 border border-white/10 hover:bg-primary hover:border-primary text-white font-anton uppercase tracking-widest py-4 px-8 rounded-2xl text-sm transition-all duration-300 group"
                    >
                        <i className="fa-solid fa-plus mr-2 group-hover:rotate-90 transition-transform duration-300"></i> 
                        Criar Novo Grupo
                    </button>
                </div>

                <div className="space-y-4">
                    {groups.map(group => (
                        <GroupListItem 
                            key={group.id}
                            group={group}
                            onToggle={() => handleToggleGroup(group.id)}
                        />
                    ))}
                </div>
            </motion.div>
        )}

        {view === 'competitions' && (
            <CompetitionsView 
                onBack={() => setView('hub')} 
                currentUser={currentUser} 
                onCreate={onCreateCompetition || (() => {})}
                allUsers={allUsers}
            />
        )}
      </div>

      <AnimatePresence>
        {selectedEvent && (
            <EventDetailModal 
                event={selectedEvent}
                currentUser={currentUser}
                onClose={() => setSelectedEvent(null)}
                onJoinEvent={onJoinEvent}
                onSendNotification={onSendNotification}
            />
        )}
        {isCreateModalOpen && <CreateEventModal onClose={() => setCreateModalOpen(false)} onCreateEvent={onCreateEvent} />}
        {isCreateGroupModalOpen && <CreateGroupModal onClose={() => setCreateGroupModalOpen(false)} onCreateGroup={handleCreateGroup} />}
      </AnimatePresence>
    </div>
  );
};

export default SocialPage;
