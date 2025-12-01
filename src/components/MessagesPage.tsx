
import React from 'react';
import { ChatConversation, UserProfile, UserData } from '../types';
import Avatar from './Avatar';

interface MessagesPageProps {
  conversations: ChatConversation[];
  onNavigateToChat: (user: UserData) => void;
}

const MessagesPage: React.FC<MessagesPageProps> = ({ conversations, onNavigateToChat }) => {
  
  const handleChatClick = (profile: UserProfile) => {
      // Transform UserProfile to UserData partial for navigation
      // We only need basic info to start the chat context
      const contactData: any = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          userAvatar: profile.avatar, // Map avatar -> userAvatar
          username: profile.name.toLowerCase().replace(/\s/g, ''), // Fallback
          isVerified: false
      };
      onNavigateToChat(contactData);
  };

  return (
    <div className="pb-24">
      <div className="text-center mb-8 mt-4">
        <h2 className="text-2xl font-anton uppercase tracking-wide text-white">Mensagens</h2>
        <p className="text-xs text-on-surface-secondary uppercase tracking-widest">Suas conversas recentes</p>
      </div>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-black/20 border border-white/5 rounded-2xl">
          <div className="w-16 h-16 bg-surface-200 rounded-full flex items-center justify-center mb-4 text-gray-600">
             <i className="fa-regular fa-comments text-3xl"></i>
          </div>
          <h3 className="text-lg font-anton uppercase tracking-wide text-white">Nenhuma conversa</h3>
          <p className="text-gray-500 text-xs uppercase tracking-widest text-center mt-1">
            Inicie um chat pelo perfil de um usuário.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map(convo => (
            <button
              key={convo.id}
              onClick={() => handleChatClick(convo.otherUser)}
              className="w-full flex items-center gap-4 p-4 bg-surface-100/50 backdrop-blur-sm border border-white/5 rounded-2xl hover:bg-white/5 transition-all text-left group"
            >
              <Avatar src={convo.otherUser.avatar} alt={convo.otherUser.name} size="md" className="group-hover:scale-105 transition-transform" />
              
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-sm text-white truncate group-hover:text-primary transition-colors">{convo.otherUser.name}</h3>
                  <p className="text-[10px] text-gray-500 flex-shrink-0 ml-2 font-mono">
                     {new Date(convo.lastMessage.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                     <p className="text-xs text-gray-400 truncate w-full pr-4">{convo.lastMessage.text || 'Áudio'}</p>
                     {convo.unreadCount > 0 && (
                         <span className="w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                             {convo.unreadCount}
                         </span>
                     )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
