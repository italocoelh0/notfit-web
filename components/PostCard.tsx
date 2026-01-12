
import React, { useState } from 'react';
import { Post, UserData } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from './Avatar';

interface PostCardProps {
    post: Post;
    currentUser: UserData;
    onLike: (id: number) => void;
    onShare: (post: Post) => void;
    onViewProfile: (userId: string) => void;
    onDelete: (id: number) => void;
    onEdit: (post: Post) => void;
    onViewImage: (url: string) => void;
    onGiveFlameTrigger: (post: Post) => void;
    onOpenComments: (post: Post) => void;
}

const PostCard: React.FC<PostCardProps> = ({ 
    post, 
    currentUser, 
    onLike, 
    onShare, 
    onViewProfile, 
    onDelete, 
    onEdit, 
    onViewImage, 
    onGiveFlameTrigger,
    onOpenComments
}) => {
    const isLiked = post.likedByUserIds.includes(currentUser.id);
    const isFlamed = post.flamedByUserIds.includes(currentUser.id);
    const [optionsOpen, setOptionsOpen] = useState(false);

    return (
        <div className="bg-surface-100/40 backdrop-blur-md rounded-[32px] border border-white/5 shadow-2xl mb-6 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onViewProfile(post.userId)}>
                    <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-primary to-orange-400">
                        <Avatar src={post.userAvatar} alt={post.userName} size="md" className="ring-2 ring-background" />
                    </div>
                    <div>
                        <p className="font-bold text-sm text-white group-hover:text-primary transition-colors leading-tight">
                            {post.userName} 
                            {post.authorIsVerified && <i className="fa-solid fa-circle-check text-blue-500 text-[10px] ml-1 align-middle"></i>}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            {post.locationName && (
                                <span className="text-[9px] text-primary font-bold flex items-center gap-0.5">
                                    <i className="fa-solid fa-location-dot"></i>
                                    {post.locationName}
                                </span>
                            )}
                            <p className="text-[9px] text-gray-500 font-medium uppercase tracking-tighter">{post.timestamp}</p>
                        </div>
                    </div>
                </div>
                {post.userId === currentUser.id && (
                    <div className="relative">
                        <button onClick={() => setOptionsOpen(!optionsOpen)} className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                            <i className="fa-solid fa-ellipsis"></i>
                        </button>
                        <AnimatePresence>
                            {optionsOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} 
                                    className="absolute right-0 top-full mt-1 w-40 bg-surface-200/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl z-20 overflow-hidden"
                                >
                                    <button onClick={() => { onEdit(post); setOptionsOpen(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                                        <i className="fa-solid fa-pen-to-square text-primary"></i> Editar Legenda
                                    </button>
                                    <button onClick={() => { onDelete(post.id); setOptionsOpen(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2 border-t border-white/5">
                                        <i className="fa-solid fa-trash-can"></i> Excluir Post
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Media - Padronizada para 3:4 */}
            {post.imageUrl && (
                <div className="w-full bg-black relative aspect-[3/4] overflow-hidden">
                    <img 
                        src={post.imageUrl} 
                        alt="" 
                        onClick={() => onViewImage(post.imageUrl!)} 
                        className="w-full h-full object-cover cursor-pointer" 
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/10 pointer-events-none"></div>
                </div>
            )}

            {/* Content Text */}
            {post.content && (
                <div className="px-5 py-4">
                     <p className="text-[13px] text-gray-200 whitespace-pre-wrap leading-relaxed">
                         <span className="font-bold text-white mr-2">@{post.username}</span>
                         {post.content}
                     </p>
                </div>
            )}

            {/* Actions Bar */}
            <div className="px-5 pb-5 flex justify-between items-center">
                <div className="flex gap-5">
                    <button onClick={() => onLike(post.id)} className="group flex items-center gap-1.5">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isLiked ? 'bg-red-500/10' : 'bg-white/5 group-hover:bg-white/10'}`}>
                            <i className={`${isLiked ? 'fa-solid text-red-500' : 'fa-regular text-white'} fa-heart text-lg`}></i>
                        </div>
                        {post.likedByUserIds.length > 0 && <span className="text-xs font-anton tracking-wide text-gray-400">{post.likedByUserIds.length}</span>}
                    </button>
                    
                    <button onClick={() => onOpenComments(post)} className="group flex items-center gap-1.5">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                            <i className="fa-regular fa-comment text-white text-lg"></i>
                        </div>
                        {post.comments.length > 0 && <span className="text-xs font-anton tracking-wide text-gray-400">{post.comments.length}</span>}
                    </button>

                    <button onClick={() => !isFlamed && onGiveFlameTrigger(post)} disabled={isFlamed || post.userId === currentUser.id} className="group flex items-center gap-1.5">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isFlamed ? 'bg-primary/20 shadow-[0_0_15px_rgba(252,82,0,0.3)]' : 'bg-white/5 group-hover:bg-white/10'}`}>
                            <i className={`fa-solid fa-fire text-lg ${isFlamed ? 'text-primary' : 'text-white'}`}></i>
                        </div>
                        {post.flamedByUserIds.length > 0 && <span className={`text-xs font-anton tracking-wide ${isFlamed ? 'text-primary' : 'text-gray-400'}`}>{post.flamedByUserIds.length}</span>}
                    </button>
                </div>

                <button onClick={() => onShare(post)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white transition-all">
                    <i className="fa-solid fa-paper-plane text-base"></i>
                </button>
            </div>
        </div>
    );
};

export default PostCard;
