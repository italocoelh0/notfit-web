import React, { useState, useMemo } from 'react';
import { UserData, Post, DashboardSection, RecordedActivity, Badge } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import SettingsMenu from './SettingsMenu';
import { formatTime, formatPace } from '../lib/geolocation';
import { BADGES_DATABASE } from '../constants';

interface ProfilePageProps {
  userData: UserData;
  posts: Post[];
  onNavigateToEdit: () => void;
  onNavigate: (section: DashboardSection) => void;
  onUpdateUserData: (updates: Partial<UserData>) => void;
  onViewImage: (url: string) => void;
  onLogout: () => void;
  onNavigateToAdmin: () => void;
}

const Stat: React.FC<{ value: string | number; label: string }> = ({ value, label }) => (
    <div className="text-center">
        <p className="text-xl font-bold">{value}</p>
        <p className="text-sm text-on-surface-secondary">{label}</p>
    </div>
);

const ActivityCard: React.FC<{ activity: RecordedActivity }> = ({ activity }) => (
    <div className="bg-surface-100 rounded-lg p-4 border border-surface-200">
        <div className="flex justify-between items-start mb-3">
            <div>
                <p className="font-bold flex items-center gap-2">
                    <i className={activity.sport.icon}></i>
                    {activity.sport.name}
                </p>
                <p className="text-xs text-on-surface-secondary">{new Date(activity.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
            <span className="text-2xl">{activity.sport.icon.startsWith('fa-') ? '' : activity.sport.icon.slice(0,2)}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
            <div>
                <p className="text-xl font-bold">{activity.distance.toFixed(2)}</p>
                <p className="text-xs text-on-surface-secondary">km</p>
            </div>
            <div>
                <p className="text-xl font-bold">{formatTime(activity.time)}</p>
                <p className="text-xs text-on-surface-secondary">Tempo</p>
            </div>
            <div>
                <p className="text-xl font-bold">{formatPace(activity.pace)}</p>
                <p className="text-xs text-on-surface-secondary">/km</p>
            </div>
        </div>
    </div>
)

const ProfilePage: React.FC<ProfilePageProps> = ({ userData, posts, onNavigateToEdit, onNavigate, onUpdateUserData, onViewImage, onLogout }) => {
    const userPosts = useMemo(() => posts.filter(p => p.userId === userData.id), [posts, userData.id]);
    const [isSettingsOpen, setSettingsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'TUDO' | 'FOTOS' | 'VIDEOS' | 'ATIVIDADES'>('TUDO');

    const equippedBadge = useMemo(() => {
        return BADGES_DATABASE.find(b => b.id === userData.equippedBadgeId);
    }, [userData.equippedBadgeId]);

    const filteredPosts = useMemo(() => {
        switch (activeTab) {
            case 'FOTOS':
                return userPosts.filter(p => p.imageUrl && !p.videoUrl);
            case 'VIDEOS':
                return userPosts.filter(p => p.videoUrl);
            case 'TUDO':
            default:
                return userPosts;
        }
    }, [activeTab, userPosts]);

    const TabButton: React.FC<{ label: 'TUDO' | 'FOTOS' | 'VIDEOS' | 'ATIVIDADES', icon: string }> = ({ label, icon }) => (
        <button
            onClick={() => setActiveTab(label)}
            className={`flex-1 py-3 text-center text-xl transition-colors ${activeTab === label ? 'text-on-surface border-b border-on-surface' : 'text-on-surface-secondary'}`}
        >
            <i className={`fa-solid ${icon}`}></i>
        </button>
    );

    const getPostIcon = (post: Post) => {
        if (post.videoUrl) return 'fa-play';
        if (post.imageUrl) return 'fa-images';
        return null;
    };

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <div className="bg-black px-4 py-2 border-b border-surface-300">
                <div className="flex justify-between items-center">
                <h2 className="font-bold text-xl flex items-center">
                    {userData.username?.replace('@', '')}
                    {userData.isVerified && <span className="ml-2 text-blue-400 text-lg"><i className="fa-solid fa-check-circle"></i></span>}
                </h2>
                <div className="flex items-center gap-5 text-2xl">
                    <button onClick={() => setSettingsOpen(true)} className="hover:text-primary"><i className="fa-solid fa-bars"></i></button>
                </div>
                </div>
            </div>
            
            {/* Profile Info */}
            <div className="pt-4 px-4">
                <div className="flex items-center justify-between">
                <div className="w-24 h-24 rounded-full flex-shrink-0 relative">
                    <div className="w-full h-full bg-surface-200 rounded-full overflow-hidden flex items-center justify-center">
                        {userData.userAvatar.startsWith('data:image') ? (
                        <img src={userData.userAvatar} alt={userData.name} className="w-full h-full object-cover" />
                        ) : (
                        <div className="text-5xl">{userData.userAvatar}</div>
                        )}
                    </div>
                    {equippedBadge && equippedBadge.type === 'frame' && (
                        <img src={equippedBadge.imageUrl} alt="Moldura" className="absolute inset-0 w-full h-full object-contain pointer-events-none"/>
                    )}
                    {equippedBadge && equippedBadge.type === 'badge' && (
                        <img src={equippedBadge.imageUrl} alt="Emblema" className="absolute -bottom-2 -right-2 w-10 h-10 object-contain pointer-events-none"/>
                    )}
                </div>
                <div className="flex-1 flex justify-around">
                    <Stat value={userPosts.length} label="Posts" />
                    <Stat value={userData.followerIds.length} label="Seguidores" />
                    <Stat value={userData.followingIds.length} label="Seguindo" />
                </div>
                </div>
                <div className="mt-4">
                <h3 className="font-semibold">{userData.name}</h3>
                <p className="text-sm text-on-surface-secondary whitespace-pre-wrap">{userData.bio}</p>
                </div>
                <div className="flex gap-2 mt-4">
                <button onClick={onNavigateToEdit} className="flex-1 bg-surface-200 text-on-surface font-semibold py-2 rounded-md text-sm hover:bg-surface-300">
                    Editar perfil
                </button>
                <button className="flex-1 bg-surface-200 text-on-surface font-semibold py-2 rounded-md text-sm hover:bg-surface-300">
                    Compartilhar perfil
                </button>
                </div>
            </div>

            {/* Media Tabs */}
            <div className="mt-6 border-y border-surface-300 flex">
                <TabButton label="TUDO" icon="fa-table-cells" />
                <TabButton label="FOTOS" icon="fa-image" />
                <TabButton label="VIDEOS" icon="fa-video" />
                <TabButton label="ATIVIDADES" icon="fa-chart-line" />
            </div>

            {/* Content */}
            <div className="pb-4">
                {activeTab === 'ATIVIDADES' ? (
                     <div className="p-2 space-y-2">
                        {(userData.activities && userData.activities.length > 0) ? (
                            userData.activities.map(activity => <ActivityCard key={activity.id} activity={activity} />)
                        ) : (
                            <div className="text-center py-16">
                                <i className="fa-solid fa-person-running text-5xl text-on-surface-secondary mb-4"></i>
                                <h3 className="font-bold text-xl">Nenhuma atividade</h3>
                                <p className="text-on-surface-secondary">Registre sua primeira atividade para vê-la aqui.</p>
                            </div>
                        )}
                     </div>
                ) : filteredPosts.length > 0 ? (
                <div className="grid grid-cols-3 gap-0.5">
                    <AnimatePresence>
                    {filteredPosts.map(post => (
                    <motion.div 
                        key={post.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="aspect-square bg-surface-100 cursor-pointer relative group"
                        onClick={() => post.imageUrl && onViewImage(post.imageUrl)}
                    >
                        {getPostIcon(post) && <i className={`fa-solid ${getPostIcon(post)} absolute top-2 right-2 text-white text-xs z-10`} style={{textShadow: '0 0 4px black'}}></i>}
                        
                        {post.imageUrl ? (
                            <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover"/>
                        ) : post.videoUrl ? (
                            <video src={post.videoUrl} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-on-surface-secondary p-2">
                                <p className="text-xs text-center line-clamp-3">{post.content}</p>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-semibold">
                            <span className="flex items-center gap-2"><i className="fa-solid fa-heart"></i> {post.likedByUserIds.length}</span>
                        </div>
                    </motion.div>
                    ))}
                    </AnimatePresence>
                </div>
                ) : (
                <div className="text-center py-16">
                    <i className="fa-solid fa-camera text-5xl text-on-surface-secondary mb-4"></i>
                    <h3 className="font-bold text-xl">Sem publicações</h3>
                    <p className="text-on-surface-secondary">Comece a compartilhar sua jornada!</p>
                </div>
                )}
            </div>

            <SettingsMenu 
                isOpen={isSettingsOpen}
                onClose={() => setSettingsOpen(false)}
                userData={userData}
                onUpdateUserData={onUpdateUserData}
                onLogout={onLogout}
                onNavigate={onNavigate}
            />
        </div>
    );
};

export default ProfilePage;