
import React from 'react';
import { UserData } from '../types';
import { motion } from 'framer-motion';
import Avatar from './Avatar';

interface ProducerStudentDetailProps {
    student: UserData;
    onBack: () => void;
    onPublish: () => void;
    onMessage: () => void;
}

const ProducerStudentDetail: React.FC<ProducerStudentDetailProps> = ({ student, onBack, onPublish, onMessage }) => {
    const isPending = student.consultancy?.status === 'pending';

    return (
        <div className="pb-32 min-h-screen bg-background flex flex-col">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-surface-100/90 backdrop-blur-md px-4 py-4 flex items-center gap-3 border-b border-white/10">
                <button onClick={onBack} className="w-8 h-8 flex items-center justify-center bg-surface-200 rounded-full text-white hover:bg-primary hover:text-white transition-colors">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <span className="font-anton uppercase tracking-wider text-lg text-white">Detalhes do Aluno</span>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                {/* Profile Card */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 rounded-full p-1 border-2 border-dashed border-white/20 mb-4">
                        <Avatar src={student.userAvatar} alt={student.name} size="xl" className="w-full h-full" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">{student.name}</h2>
                    <p className="text-sm text-gray-400">@{student.username}</p>
                    
                    <div className="flex gap-2 mt-4">
                        <button onClick={onMessage} className="px-4 py-2 bg-surface-200 rounded-lg text-xs font-bold uppercase tracking-wider text-white hover:bg-surface-300 transition-colors flex items-center gap-2">
                            <i className="fa-regular fa-comment"></i> Mensagem
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-surface-100 p-3 rounded-xl border border-white/5 text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold">Idade</p>
                        <p className="text-lg font-anton text-white">{student.age} <span className="text-[10px] font-sans text-gray-500">anos</span></p>
                    </div>
                    <div className="bg-surface-100 p-3 rounded-xl border border-white/5 text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold">Peso</p>
                        <p className="text-lg font-anton text-white">{student.weight} <span className="text-[10px] font-sans text-gray-500">kg</span></p>
                    </div>
                    <div className="bg-surface-100 p-3 rounded-xl border border-white/5 text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold">Altura</p>
                        <p className="text-lg font-anton text-white">{student.height} <span className="text-[10px] font-sans text-gray-500">cm</span></p>
                    </div>
                </div>

                {/* Goals */}
                <div className="bg-surface-100 p-5 rounded-2xl border border-white/5 mb-6">
                    <h3 className="font-anton uppercase text-white tracking-wide mb-3 flex items-center gap-2">
                        <i className="fa-solid fa-bullseye text-primary"></i> Objetivo Principal
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {student.goals.map((goal, i) => (
                            <span key={i} className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-300 border border-white/10">
                                {goal}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Action Card */}
                <div className={`p-6 rounded-2xl border ${isPending ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-green-500/10 border-green-500/30'}`}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-white">Status do Plano</h3>
                        {isPending ? (
                            <span className="px-2 py-1 bg-yellow-500 text-black text-[10px] font-bold uppercase rounded">Pendente</span>
                        ) : (
                            <span className="px-2 py-1 bg-green-500 text-black text-[10px] font-bold uppercase rounded">Publicado</span>
                        )}
                    </div>
                    
                    {isPending ? (
                        <div>
                            <p className="text-sm text-gray-300 mb-4">Este aluno está aguardando seu treino/dieta. Gere o plano para liberar o acesso dele.</p>
                            <button 
                                onClick={onPublish}
                                className="w-full bg-primary text-white font-anton uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
                            >
                                <i className="fa-solid fa-wand-magic-sparkles"></i> Gerar e Publicar Treino
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-gray-300 mb-4">O treino já foi enviado. Você pode editar ou atualizar quando necessário.</p>
                            <button className="w-full bg-surface-200 text-white font-anton uppercase tracking-widest py-3 rounded-xl hover:bg-surface-300 transition-colors border border-white/10">
                                Editar Treino Atual
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProducerStudentDetail;
