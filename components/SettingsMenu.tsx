
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserData, DashboardSection } from '../types';
import { BADGES_DATABASE } from '../constants';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  userData: UserData;
  onUpdateUserData: (updates: Partial<UserData>) => void;
  onLogout: () => void;
  onNavigate: (section: DashboardSection) => void;
}

const LEGAL_CONTENT = `TERMOS DE USO ... (conteúdo omitido por brevidade)`;

const LegalModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <motion.div 
        className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
    >
        <motion.div 
            className="bg-surface-100 w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[80vh]"
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
        >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-surface-200/50 rounded-t-2xl">
                <h3 className="font-anton uppercase text-white tracking-wide text-lg">Termos & Privacidade</h3>
                <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                    <i className="fa-solid fa-times text-xl"></i>
                </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-sans">
                {LEGAL_CONTENT}
            </div>
            <div className="p-4 border-t border-white/10 bg-surface-200/50 rounded-b-2xl">
                <button onClick={onClose} className="w-full bg-primary text-white font-bold py-3 rounded-xl uppercase tracking-widest text-xs hover:bg-primary-hover transition-colors">
                    Fechar
                </button>
            </div>
        </motion.div>
    </motion.div>
);

const MenuItem: React.FC<{ icon: string; label: string; onClick?: () => void; className?: string }> = ({ icon, label, onClick, className = '' }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 text-left hover:bg-white/5 rounded-xl transition-colors group ${className}`}>
    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-gray-400 group-hover:text-white transition-colors">
         <i className={`fa-solid ${icon} text-lg ${className ? '' : ''}`}></i>
    </div>
    <span className="font-medium text-sm flex-1 text-gray-300 group-hover:text-white transition-colors">{label}</span>
    <i className="fa-solid fa-chevron-right text-xs text-gray-600 group-hover:text-white/50 transition-colors"></i>
  </button>
);

const SettingsMenu: React.FC<SettingsMenuProps> = ({ isOpen, onClose, userData, onUpdateUserData, onLogout, onNavigate }) => {
  const [showLegalModal, setShowLegalModal] = useState(false);

  const handlePrivacyToggle = () => {
    onUpdateUserData({ isProfilePublic: !userData.isProfilePublic });
  };
  
  const handleNavigation = (section: DashboardSection) => {
    onNavigate(section);
    onClose();
  };

  const equippedBadge = useMemo(() => {
    return BADGES_DATABASE.find(b => b.id === userData.equippedBadgeId);
  }, [userData.equippedBadgeId]);

  const isAdmin = userData.role === 'admin';
  const userAvatar = userData?.userAvatar || '';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
            <motion.div
                className="fixed inset-0 bg-black/80 z-[90] backdrop-blur-sm"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
            />
            <motion.div
                className="fixed inset-y-0 left-0 w-80 bg-black/90 backdrop-blur-2xl z-[100] shadow-[0_0_50px_rgba(0,0,0,0.5)] border-r border-white/10 flex flex-col overflow-hidden"
                initial={{ x: '-100%' }} animate={{ x: '0%' }} exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                onClick={e => e.stopPropagation()}
            >
                {/* Decorative Background Elements */}
                <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-primary/10 rounded-full filter blur-[100px] opacity-30 pointer-events-none"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-purple-900/20 rounded-full filter blur-[100px] opacity-30 pointer-events-none"></div>

                {/* User Header */}
                <div className="relative z-10 p-6 border-b border-white/10 bg-white/5">
                    <div className="flex items-start justify-between mb-6">
                        <div className="relative w-20 h-20">
                            <div className="w-20 h-20 rounded-full overflow-hidden bg-surface-200 border-2 border-white/10 shadow-lg">
                                {userAvatar.startsWith('data:image') || userAvatar.startsWith('http') ? (
                                    <img src={userAvatar} alt={userData?.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl">{userAvatar || '👤'}</div>
                                )}
                            </div>
                             {equippedBadge && equippedBadge.type === 'frame' && (
                                <img src={equippedBadge.imageUrl} alt="Moldura" className="absolute inset-0 w-full h-full object-contain pointer-events-none scale-110"/>
                            )}
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                            <i className="fa-solid fa-times"></i>
                        </button>
                    </div>
                    
                    <h2 className="font-anton text-2xl text-white uppercase tracking-wide leading-none">{userData?.name}</h2>
                    <p className="text-xs text-gray-400 mt-1 font-medium tracking-wider">@{userData?.username}</p>
                </div>

                {/* Menu Items */}
                <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    
                    {/* AMBIENTES / MODOS DE ACESSO */}
                    {(userData.isProfessional || isAdmin) && (
                        <div className="mb-6 pb-4 border-b border-white/10">
                             <div className="px-4 py-2 text-[10px] font-bold uppercase text-gray-500 tracking-[0.2em] mb-2">Modo de Acesso</div>
                             
                             {(userData.isProfessional || isAdmin) && (
                                <button 
                                    onClick={() => handleNavigation('producerPanel')}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl transition-all bg-purple-900/20 border border-purple-500/30 hover:bg-purple-900/40 mb-2 group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400">
                                        <i className="fa-solid fa-briefcase text-lg"></i>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <span className="font-anton uppercase tracking-wide text-white text-sm block group-hover:text-purple-300 transition-colors">Logar como Profissional</span>
                                        <span className="text-[10px] text-gray-400 block">Gestão de Alunos</span>
                                    </div>
                                    <i className="fa-solid fa-chevron-right text-xs text-purple-500"></i>
                                </button>
                             )}
                        </div>
                    )}

                    {isAdmin && (
                        <MenuItem icon="fa-user-shield" label="Painel do Administrador" onClick={() => handleNavigation('adminPanel')} />
                    )}
                    
                    <div className="px-4 py-2 text-[10px] font-bold uppercase text-gray-500 tracking-[0.2em] mt-2">Conta</div>
                    
                    <MenuItem icon="fa-box-archive" label="Itens Arquivados" onClick={() => handleNavigation('archived')} />
                    <MenuItem icon="fa-bell" label="Notificações" onClick={() => handleNavigation('notifications')} />
                    
                    <div className="px-4 py-2 text-[10px] font-bold uppercase text-gray-500 tracking-[0.2em] mt-6">Suporte</div>
                    
                    <MenuItem icon="fa-circle-question" label="Ajuda e Suporte" onClick={() => handleNavigation('support')} />
                    <MenuItem icon="fa-file-lines" label="Política de Privacidade" onClick={() => setShowLegalModal(true)} />
                    
                    <div className="pt-4 mt-6 border-t border-white/10">
                        <button onClick={onLogout} className="w-full flex items-center gap-4 p-4 text-left hover:bg-red-500/10 rounded-xl transition-colors group">
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0 text-red-500">
                                <i className="fa-solid fa-right-from-bracket text-lg"></i>
                            </div>
                            <span className="font-medium text-sm flex-1 text-red-400 group-hover:text-red-300">Sair da Conta</span>
                        </button>
                    </div>
                </div>
                
                <div className="p-4 text-center text-[10px] text-gray-600 font-mono border-t border-white/5 bg-black/40">
                    NowFit v1.2.0 - Role: {userData.role.toUpperCase()}
                </div>
            </motion.div>

            {showLegalModal && <LegalModal onClose={() => setShowLegalModal(false)} />}
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsMenu;
