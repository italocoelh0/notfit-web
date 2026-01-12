
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserData, DirectMessage } from '../types';
import Avatar from '../components/Avatar';

interface ChatViewPageProps {
  contact: UserData;
  messages: DirectMessage[];
  currentUserId: string;
  onBack: () => void;
  onSendMessage: (text: string) => void;
  onSendAudioMessage: (audioBlob: Blob) => void;
}

const ChatViewPage: React.FC<ChatViewPageProps> = ({ 
  contact, 
  messages, 
  currentUserId,
  onBack, 
  onSendMessage,
  onSendAudioMessage
}) => {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        if(audioBlob.size > 0) {
            onSendAudioMessage(audioBlob);
        }
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error("Failed to get microphone access:", err);
      alert("Não foi possível acessar o microfone. Verifique permissões.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      onSendMessage(messageText);
      setMessageText('');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen w-full bg-black flex flex-col overflow-hidden">
      {/* Header - Infinite look (blends with top) */}
      <div className="bg-surface-100/95 backdrop-blur-md px-4 py-4 flex items-center gap-3 border-b border-white/5 z-20">
        <button onClick={onBack} className="text-white hover:text-primary transition-colors w-8 h-8 flex items-center justify-center">
          <i className="fas fa-arrow-left"></i>
        </button>
        <Avatar src={contact.userAvatar} alt={contact.name} size="md" />
        <div className="flex-1">
          <h2 className="font-bold text-white text-sm">{contact.name}</h2>
          <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <p className="text-[10px] text-gray-400 font-medium">Online agora</p>
          </div>
        </div>
      </div>

      {/* Messages - Full Height Background */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-black custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
            <Avatar src={contact.userAvatar} alt={contact.name} size="xl" className="mb-4 opacity-50 grayscale" />
            <p className="text-gray-500 text-sm">
              Nenhuma mensagem ainda.<br/>Diga olá para {contact.name.split(' ')[0]}!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === currentUserId;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] ${isOwn ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`px-4 py-2.5 text-sm shadow-md ${
                      isOwn
                        ? 'bg-primary text-white rounded-2xl rounded-tr-none'
                        : 'bg-surface-200 text-gray-100 rounded-2xl rounded-tl-none border border-white/5'
                    }`}
                  >
                     {msg.audioUrl ? (
                      <audio controls src={msg.audioUrl} className="max-w-[200px] h-8"></audio>
                    ) : msg.text ? (
                      <p className="leading-relaxed">{msg.text}</p>
                    ) : null}
                  </div>
                  <p className={`text-[9px] text-gray-600 mt-1 px-1 font-medium ${
                    isOwn ? 'text-right' : 'text-left'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Seamless dark blend */}
      <div className="bg-surface-100/95 backdrop-blur-md border-t border-white/5 p-3 pb-safe">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
           <AnimatePresence mode="wait">
            {isRecording ? (
              <motion.div
                key="recorder"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: '100%' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 bg-red-500/10 border border-red-500/30 rounded-full px-4 py-3 text-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 font-bold">Gravando...</span>
                </div>
                <span className="text-red-400 font-mono">{new Date(recordingTime * 1000).toISOString().substr(14, 5)}</span>
              </motion.div>
            ) : (
              <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Mensagem..."
                  className="flex-1 bg-surface-200 border border-white/5 rounded-full px-5 py-3 focus:outline-none focus:ring-1 focus:ring-primary text-sm text-white placeholder-gray-500 transition-all"
                />
            )}
          </AnimatePresence>
          
          {!messageText.trim() || isRecording ? (
             <button
                type="button"
                onClick={handleMicClick}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-lg ${isRecording ? 'bg-red-500 text-white scale-110' : 'bg-surface-200 text-gray-400 hover:bg-surface-300 hover:text-white'}`}
            >
                <i className={`fas ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i>
            </button>
          ) : (
            <button 
                type="submit"
                disabled={!messageText.trim()}
                className="w-11 h-11 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-hover transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
              >
                <i className="fas fa-paper-plane text-sm"></i>
              </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatViewPage;
