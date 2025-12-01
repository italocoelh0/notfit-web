
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Post, UserData } from '../types';
import Avatar from './Avatar';

interface CommentsModalProps {
    post: Post;
    currentUser: UserData;
    onClose: () => void;
    onAddComment: (postId: number, text: string) => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ post, currentUser, onClose, onAddComment }) => {
    const [newComment, setNewComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        onAddComment(post.id, newComment);
        setNewComment('');
    };

    return (
        <motion.div
            className="fixed inset-0 bg-black/80 z-[70] flex flex-col justify-end sm:justify-center p-0 sm:p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-surface-100 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl border-t sm:border border-white/10 overflow-hidden flex flex-col max-h-[80vh]"
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-surface-100 z-10">
                    <h3 className="font-anton uppercase text-white tracking-wide">Comentários</h3>
                    <button onClick={onClose} className="text-white/50 hover:text-white">
                        <i className="fa-solid fa-times text-xl"></i>
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-surface-100">
                    {post.comments && post.comments.length > 0 ? (
                        post.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                                <Avatar src={comment.userAvatar} alt={comment.userName} size="sm" />
                                <div className="flex-1">
                                    <div className="bg-surface-200 rounded-2xl rounded-tl-none px-4 py-2 border border-white/5">
                                        <p className="text-xs font-bold text-white mb-0.5">{comment.userName}</p>
                                        <p className="text-sm text-gray-300">{comment.text}</p>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1 ml-2">{new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            <p className="text-sm">Nenhum comentário ainda.</p>
                            <p className="text-xs">Seja o primeiro a comentar!</p>
                        </div>
                    )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10 bg-surface-200">
                    <form onSubmit={handleSubmit} className="flex gap-3 items-center">
                        <Avatar src={currentUser.userAvatar} size="sm" />
                        <div className="flex-1 relative">
                            <input 
                                type="text" 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Adicione um comentário..."
                                className="w-full bg-black/20 border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                autoFocus
                            />
                            <button 
                                type="submit" 
                                disabled={!newComment.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-primary disabled:opacity-50 hover:scale-110 transition-transform p-2"
                            >
                                <i className="fa-solid fa-paper-plane"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CommentsModal;
