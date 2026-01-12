
// components/EventDetailModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { EventData, UserData, EventComment } from '../types';
import { api } from '../services/api';

const FORBIDDEN_WORDS = [
    'idiota', 'babaca', 'otário', 'trouxa', 'lixo', 'merda', 'bosta', 'caralho', 
    'porra', 'puta', 'vagabundo', 'corno', 'arrombado', 'foder', 'cu', 'buceta'
];
const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const PHONE_REGEX = /(?:\(?\d{2}\)?\s?)?(?:\d{4,5}-?\d{4})/g;


interface EventDetailModalProps {
    event: EventData;
    currentUser: UserData;
    onClose: () => void;
    onJoinEvent: (eventId: number) => void;
    onSendNotification: (message: string) => void;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, currentUser, onClose, onJoinEvent, onSendNotification }) => {
    const isParticipating = event.participantIds.includes(currentUser.id);
    const eventDate = new Date(event.date);
    const [comments, setComments] = useState<EventComment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const commentsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchComments = async () => {
            setIsLoading(true);
            try {
                const commentsData = await api.events.getComments(event.id);
                setComments(commentsData);
            } catch (error: any) {
                console.error("Erro ao buscar comentários:", error.message || error);
                onSendNotification('Não foi possível carregar os comentários.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchComments();
    }, [event.id, onSendNotification]);
    
    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [comments]);


    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedComment = newComment.trim();
        if (!trimmedComment) return;
        if (!isParticipating) return; // Segurança extra

        // Moderação
        if (EMAIL_REGEX.test(trimmedComment)) {
            onSendNotification("Não é permitido enviar e-mails no chat.");
            return;
        }
        if (PHONE_REGEX.test(trimmedComment)) {
            onSendNotification("Não é permitido enviar números de telefone no chat.");
            return;
        }
        for (const word of FORBIDDEN_WORDS) {
            if (trimmedComment.toLowerCase().includes(word)) {
                onSendNotification("Sua mensagem contém palavras ofensivas e foi bloqueada.");
                return;
            }
        }
        
        const tempText = newComment;
        setNewComment('');
        
        try {
            const newCommentData = await api.events.addComment({
                event_id: event.id,
                user_id: currentUser.id,
                text: tempText,
                profile: { // Para update otimista
                    name: currentUser.name,
                    user_avatar: currentUser.userAvatar
                }
            });
            
            setComments(prev => [...prev, newCommentData]);
        } catch(error: any) {
            console.error("Erro ao enviar comentário:", error.message || error);
            onSendNotification("Erro ao enviar comentário.");
            setNewComment(tempText);
        }
    };

    return (
        <motion.div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
            <motion.div className="bg-surface-100 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-surface-200" initial={{ scale: 0.9, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={e => e.stopPropagation()}>
                <div className="relative">
                    <img src={event.imageUrl} alt={event.title} className="h-64 w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <button onClick={onClose} className="absolute top-4 right-4 text-white bg-black/30 rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/50"><i className="fa-solid fa-times"></i></button>
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                         <div className="flex gap-2 mb-2">
                            <span className="text-xs font-bold bg-primary px-2 py-1 rounded inline-block">{event.type}</span>
                            {event.requiresApproval && <span className="text-xs font-bold bg-surface-300 px-2 py-1 rounded inline-block"><i className="fa-solid fa-lock mr-1"></i>Privado</span>}
                         </div>
                         <h2 className="text-2xl font-bold">{event.title}</h2>
                    </div>
                </div>
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Details */}
                    <div className="w-full md:w-1/3 p-4 border-b md:border-b-0 md:border-r border-surface-200 overflow-y-auto">
                        <h3 className="font-bold mb-3">Detalhes</h3>
                        <p className="text-sm text-on-surface-secondary mb-4">{event.description}</p>
                        <ul className="text-sm space-y-2 text-on-surface-secondary">
                            <li className="flex items-center gap-3"><i className="fa-solid fa-calendar w-4 text-center text-primary"></i>{eventDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</li>
                            <li className="flex items-center gap-3"><i className="fa-solid fa-clock w-4 text-center text-primary"></i>{event.time}</li>
                            <li className="flex items-center gap-3"><i className="fa-solid fa-location-dot w-4 text-center text-primary"></i>{event.location.city}, {event.location.state}</li>
                            <li className="flex items-center gap-3"><i className="fa-solid fa-users w-4 text-center text-primary"></i>{event.participantIds.length} participante(s)</li>
                        </ul>
                         <button 
                            onClick={() => onJoinEvent(event.id)} 
                            className={`w-full mt-6 py-2 rounded-md font-semibold text-sm transition-colors ${isParticipating ? 'bg-surface-200 text-on-surface' : 'bg-primary text-white'}`}
                         >
                             {isParticipating 
                                ? 'Sair do Evento' 
                                : event.requiresApproval ? 'Solicitar Participação' : 'Participar do Evento'
                             }
                         </button>
                    </div>
                    {/* Chat */}
                    <div className="flex-1 flex flex-col p-4 bg-surface-100 relative">
                        <h3 className="font-bold mb-3">Comentários</h3>
                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-3">
                            {isLoading ? <p className="text-sm text-center text-on-surface-secondary">Carregando...</p> : comments.length > 0 ? comments.map(c => (
                                <div key={c.id} className="flex items-start gap-2">
                                    <div className="w-8 h-8 bg-surface-200 rounded-full flex-shrink-0 overflow-hidden">
                                        {(c.profile?.user_avatar || '').startsWith('data:image') || (c.profile?.user_avatar || '').startsWith('http') ? (
                                            <img src={c.profile.user_avatar} className="w-full h-full object-cover" alt={c.profile?.name} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-sm">{c.profile?.user_avatar || '👤'}</div>
                                        )}
                                    </div>
                                    <div className="bg-surface-200 rounded-lg px-3 py-2 text-sm flex-1"><p><span className="font-semibold mr-2">{c.profile?.name}</span>{c.text}</p></div>
                                </div>
                            )) : <p className="text-sm text-center text-on-surface-secondary pt-8">Seja o primeiro a comentar!</p>}
                            <div ref={commentsEndRef}></div>
                        </div>

                        {isParticipating ? (
                            <form onSubmit={handleCommentSubmit} className="flex items-center gap-2 pt-3 border-t border-surface-200">
                                <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Tire sua dúvida..." className="flex-1 bg-surface-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                                <button type="submit" className="text-primary font-semibold text-sm hover:opacity-80 disabled:opacity-50" disabled={!newComment.trim()}>Enviar</button>
                            </form>
                        ) : (
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-surface-100 border-t border-surface-200 text-center">
                                <p className="text-sm text-on-surface-secondary mb-2">Você precisa participar do evento para comentar.</p>
                                <button onClick={() => onJoinEvent(event.id)} className="text-primary text-sm font-bold hover:underline">
                                    {event.requiresApproval ? 'Solicitar Entrada' : 'Participar Agora'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default EventDetailModal;
