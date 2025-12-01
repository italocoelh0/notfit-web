
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

const LEGAL_CONTENT = `TERMOS DE USO

1. Aceitação dos Termos
Ao acessar e usar o NowFit, você concorda em cumprir estes Termos de Uso e todas as leis e regulamentos aplicáveis.

2. Uso da Licença
É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no aplicativo NowFit apenas para visualização transitória pessoal e não comercial.

3. Isenção de Responsabilidade
Os materiais no aplicativo NowFit são fornecidos 'como estão'. O NowFit não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.

---

POLÍTICA DE PRIVACIDADE

1. Coleta de Informações
Solicitamos informações pessoais apenas quando realmente precisamos delas para lhe fornecer um serviço. Fazemo-lo por meios justos e legais, com o seu conhecimento e consentimento. Também informamos por que estamos coletando e como será usado.

2. Uso de Dados
Usamos seus dados para personalizar sua experiência de treino e dieta, melhorar nosso algoritmo de Coach IA e comunicar atualizações importantes sobre sua conta.

3. Proteção de Dados
Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado. Quando armazenamos dados, protegemos dentro de meios comercialmente aceitáveis para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.

4. Compartilhamento
Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto quando exigido por lei.`;

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

  // DEV USER ID CHECK (Hardcoded for demo purposes as 'u1' based on api.ts)
  const isDevUser = userData.id === 'u1';
  const showProfessionalAccess = userData.isProfessional || isDevUser;
  const showStudentAccess = !!userData.consultancy || isDevUser;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
            <motion.div
                className="fixed inset-0 bg-black/80 z-[90] backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />
            <motion.div
                className="fixed inset-y-0 left-0 w-80 bg-black/90 backdrop-blur-2xl z-[100] shadow-[0_0_50px_rgba(0,0,0,0.5)] border-r border-white/10 flex flex-col overflow-hidden"
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                exit={{ x: '-100%' }}
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
                                {userData.userAvatar.startsWith('data:image') ? (
                                    <img src={userData.userAvatar} alt={userData.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl">{userData.userAvatar}</div>
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
                    
                    <h2 className="font-anton text-2xl text-white uppercase tracking-wide leading-none">{userData.name}</h2>
                    <p className="text-xs text-gray-400 mt-1 font-medium tracking-wider">@{userData.username}</p>
                    
                    <div className="flex gap-6 mt-5">
                        <div className="flex flex-col">
                             <span className="text-lg font-anton text-white">{userData.followerIds.length}</span>
                             <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Seguidores</span>
                        </div>
                        <div className="flex flex-col">
                             <span className="text-lg font-anton text-white">{userData.followingIds.length}</span>
                             <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Seguindo</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => handleNavigation('editProfile')}
                        className="mt-6 w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-anton uppercase tracking-widest hover:bg-white/10 transition-colors text-white shadow-lg"
                    >
                        Editar Perfil
                    </button>
                </div>

                {/* Menu Items */}
                <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    
                    {/* AMBIENTES / MODOS DE ACESSO */}
                    {(showProfessionalAccess || showStudentAccess) && (
                        <div className="mb-6 pb-4 border-b border-white/10">
                             <div className="px-4 py-2 text-[10px] font-bold uppercase text-gray-500 tracking-[0.2em] mb-2">Modo de Acesso</div>
                             
                             {showProfessionalAccess && (
                                <button 
                                    onClick={() => handleNavigation('producerPanel')}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl transition-all bg-purple-900/20 border border-purple-500/30 hover:bg-purple-900/40 mb-2 group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 text-purple-400">
                                        <i className="fa-solid fa-briefcase text-lg"></i>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <span className="font-anton uppercase tracking-wide text-white text-sm block group-hover:text-purple-300 transition-colors">Logar como Profissional</span>
                                        <span className="text-[10px] text-gray-400 block">Painel de Gestão</span>
                                    </div>
                                    <i className="fa-solid fa-chevron-right text-xs text-purple-500"></i>
                                </button>
                             )}

                             {showStudentAccess && (
                                <button 
                                    onClick={() => handleNavigation('custom_routine')}
                                    className="w-full flex items-center gap-4 p-4 rounded-xl transition-all bg-green-900/20 border border-green-500/30 hover:bg-green-900/40 group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0 text-green-400">
                                        <i className="fa-solid fa-dumbbell text-lg"></i>
                                    </div>
                                    <div className="flex-1 text-left">
                                        <span className="font-anton uppercase tracking-wide text-white text-sm block group-hover:text-green-300 transition-colors">Logar como Aluno</span>
                                        <span className="text-[10px] text-gray-400 block">Minha Rotina Personalizada</span>
                                    </div>
                                    <i className="fa-solid fa-chevron-right text-xs text-green-500"></i>
                                </button>
                             )}
                        </div>
                    )}

                    {userData.isAdmin && (
                        <MenuItem icon="fa-user-shield" label="Painel do Administrador" onClick={() => handleNavigation('adminPanel')} />
                    )}
                    
                    <div className="px-4 py-2 text-[10px] font-bold uppercase text-gray-500 tracking-[0.2em] mt-2">Conta</div>
                    
                    <MenuItem icon="fa-box-archive" label="Itens Arquivados" onClick={() => handleNavigation('archived')} />
                    <MenuItem icon="fa-bell" label="Notificações" onClick={() => handleNavigation('notifications')} />
                    
                    <div className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-white/5" onClick={handlePrivacyToggle}>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-gray-400">
                                <i className="fa-solid fa-lock text-lg"></i>
                            </div>
                            <span className="font-medium text-sm text-gray-300">Conta Privada</span>
                        </div>
                        <div 
                            className={`w-10 h-5 rounded-full flex items-center p-1 transition-colors duration-300 ${userData.isProfilePublic ? 'bg-white/10 justify-start' : 'bg-primary justify-end'}`}
                        >
                            <motion.div layout className="w-3 h-3 bg-white rounded-full shadow-md"></motion.div>
                        </div>
                    </div>

                    <div className="px-4 py-2 text-[10px] font-bold uppercase text-gray-500 tracking-[0.2em] mt-6">Suporte</div>
                    
                    <MenuItem icon="fa-circle-question" label="Ajuda e Suporte" onClick={() => handleNavigation('support')} />
                    <MenuItem icon="fa-file-lines" label="Política de Privacidade" onClick={() => setShowLegalModal(true)} />
                    
                    <div className="pt-4 mt-6 border-t border-white/10">
                        <button onClick={onLogout} className="w-full flex items-center gap-4 p-4 text-left hover:bg-red-500/10 rounded-xl transition-colors group border border-transparent hover:border-red-500/30">
                            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0 text-red-500">
                                <i className="fa-solid fa-right-from-bracket text-lg"></i>
                            </div>
                            <span className="font-medium text-sm flex-1 text-red-400 group-hover:text-red-300">Sair da Conta</span>
                        </button>
                    </div>
                </div>
                
                <div className="p-4 text-center text-[10px] text-gray-600 font-mono border-t border-white/5 bg-black/40">
                    NowFit v1.2.0
                </div>
            </motion.div>

            {/* Legal Modal rendered conditionally */}
            {showLegalModal && <LegalModal onClose={() => setShowLegalModal(false)} />}
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsMenu;
