
import React, { useState, useMemo } from 'react';
import { UserData } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from './Avatar';
import ProducerStudentDetail from './ProducerStudentDetail';

interface ProducerPanelProps {
    currentUser: UserData;
    allUsers: UserData[];
    onNavigateToChat: (user: UserData) => void;
    onUpdateOtherUser: (userId: string, updates: Partial<UserData>) => void;
}

const ProducerPanel: React.FC<ProducerPanelProps> = ({ currentUser, allUsers, onNavigateToChat, onUpdateOtherUser }) => {
    const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');
    const [selectedStudent, setSelectedStudent] = useState<UserData | null>(null);

    // Filter students subscribed to this professional
    const myStudents = useMemo(() => {
        return allUsers.filter(user => user.consultancy?.professionalId === currentUser.id);
    }, [allUsers, currentUser.id]);

    const pendingStudents = useMemo(() => myStudents.filter(s => s.consultancy?.status === 'pending'), [myStudents]);
    const activeStudents = useMemo(() => myStudents.filter(s => s.consultancy?.status === 'active'), [myStudents]);

    const handlePublishPlan = (studentId: string) => {
        // In a real app, you would also generate or attach the routine here.
        // For mock, we update status to active.
        onUpdateOtherUser(studentId, {
            consultancy: {
                professionalId: currentUser.id,
                startDate: new Date().toISOString(),
                status: 'active'
            }
        });
        
        // Close detail view to refresh list view
        setSelectedStudent(null);
        setActiveTab('active');
    };

    if (selectedStudent) {
        return (
            <ProducerStudentDetail 
                student={selectedStudent} 
                onBack={() => setSelectedStudent(null)}
                onPublish={() => handlePublishPlan(selectedStudent.id)}
                onMessage={() => onNavigateToChat(selectedStudent)}
            />
        );
    }

    return (
        <div className="pb-32 min-h-screen bg-background">
            {/* Header */}
            <div className="bg-surface-100 p-6 rounded-b-3xl shadow-lg mb-6 border-b border-white/5">
                <h1 className="font-anton text-2xl text-white uppercase tracking-wide mb-1">Painel do Produtor</h1>
                <p className="text-xs text-gray-400 uppercase tracking-widest">Gerencie seus alunos</p>
                
                <div className="flex gap-4 mt-6">
                    <div className="flex-1 bg-surface-200/50 p-3 rounded-xl border border-white/5">
                        <p className="text-2xl font-anton text-white">{activeStudents.length}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Ativos</p>
                    </div>
                    <div className="flex-1 bg-surface-200/50 p-3 rounded-xl border border-white/5">
                        <p className="text-2xl font-anton text-white">{pendingStudents.length}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Pendentes</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-4 mb-6">
                <div className="bg-surface-100 p-1 rounded-xl flex">
                    <button 
                        onClick={() => setActiveTab('pending')}
                        className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'pending' ? 'bg-yellow-500/20 text-yellow-500 shadow-sm' : 'text-gray-500'}`}
                    >
                        Aguardando ({pendingStudents.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'active' ? 'bg-green-500/20 text-green-500 shadow-sm' : 'text-gray-500'}`}
                    >
                        Publicados ({activeStudents.length})
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="px-4 space-y-3">
                <AnimatePresence mode="wait">
                    {(activeTab === 'pending' ? pendingStudents : activeStudents).map(student => (
                        <motion.div
                            key={student.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            onClick={() => setSelectedStudent(student)}
                            className="bg-surface-100 p-4 rounded-2xl border border-white/5 flex items-center gap-4 cursor-pointer hover:bg-surface-200 transition-colors group"
                        >
                            <Avatar src={student.userAvatar} alt={student.name} size="md" />
                            <div className="flex-1">
                                <h3 className="font-bold text-white text-sm group-hover:text-primary transition-colors">{student.name}</h3>
                                <p className="text-xs text-gray-400">{student.goals[0] || 'Sem objetivo'}</p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                {activeTab === 'pending' ? (
                                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-[9px] font-bold uppercase tracking-wider border border-yellow-500/20">
                                        Pendente
                                    </span>
                                ) : (
                                    <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[9px] font-bold uppercase tracking-wider border border-green-500/20">
                                        Ativo
                                    </span>
                                )}
                                <i className="fa-solid fa-chevron-right text-xs text-gray-600 group-hover:text-white transition-colors mt-2"></i>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {(activeTab === 'pending' ? pendingStudents : activeStudents).length === 0 && (
                    <div className="text-center py-12 opacity-50">
                        <i className="fa-solid fa-users-slash text-3xl mb-3 text-gray-600"></i>
                        <p className="text-sm text-gray-500 font-medium">Nenhum aluno nesta lista.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProducerPanel;
