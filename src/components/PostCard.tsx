
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
        <div className="bg-surface-100 rounded-3xl border border-white/5 shadow-lg mb-6 overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onViewProfile(post.userId)}>
                    <Avatar src={post.userAvatar} alt={post.userName} size="md" className="ring-2 ring-transparent group-hover:ring-primary/50 transition-all" />
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
                            {post.locationName && <span className="text-gray-700 text-[8px]">•</span>}
                            <p className="text-[9px] text-gray-500 font-medium">{post.timestamp}</p>
                        </div>
                    </div>
                </div>
                {post.userId === currentUser.id && (
                    <div className="relative">
                        <button onClick={() => setOptionsOpen(!optionsOpen)} className="text-gray-500 hover:text-white p-2 transition-colors">
                            <i className="fa-solid fa-ellipsis"></i>
                        </button>
                        <AnimatePresence>
                            {optionsOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }} 
                                    className="absolute right-0 top-full mt-1 w-32 bg-surface-200 rounded-xl border border-white/10 shadow-2xl z-20 overflow-hidden"
                                >
                                    <button onClick={() => { onEdit(post); setOptionsOpen(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-white hover:bg-white/10 transition-colors flex items-center gap-2">
                                        <i className="fa-solid fa-pen"></i> Editar
                                    </button>
                                    <button onClick={() => { onDelete(post.id); setOptionsOpen(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2">
                                        <i className="fa-solid fa-trash"></i> Excluir
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Media */}
            {post.imageUrl && (
                <div className="w-full bg-black">
                    <img 
                        src={post.imageUrl} 
                        alt="Post content" 
                        onClick={() => onViewImage(post.imageUrl!)} 
                        className="w-full h-auto object-cover max-h-[600px] cursor-pointer" 
                        loading="lazy"
                    />
                </div>
            )}

            {/* Content Text (if any) */}
            {post.content && (
                <div className="px-4 py-3">
                     <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                         <span className="font-bold text-white mr-1">{post.username}</span>
                         {post.content}
                     </p>
                </div>
            )}

            {/* Actions Bar */}
            <div className="px-4 pb-4 flex justify-between items-center">
                <div className="flex gap-4">
                    <button 
                        onClick={() => onLike(post.id)} 
                        className="group flex flex-col items-center justify-center gap-0.5"
                    >
                        <i className={`${isLiked ? 'fa-solid text-red-500' : 'fa-regular text-white group-hover:text-gray-300'} fa-heart text-xl transition-all ${isLiked ? 'scale-110' : ''}`}></i>
                        {post.likedByUserIds.length > 0 && <span className="text-[10px] font-bold text-gray-400">{post.likedByUserIds.length}</span>}
                    </button>
                    
                    <button 
                        onClick={() => onOpenComments(post)}
                        className="group flex flex-col items-center justify-center gap-0.5"
                    >
                        <i className="fa-regular fa-comment text-white group-hover:text-gray-300 text-xl transition-colors"></i>
                        {post.comments.length > 0 && <span className="text-[10px] font-bold text-gray-400">{post.comments.length}</span>}
                    </button>

                    <button 
                        onClick={() => !isFlamed && onGiveFlameTrigger(post)} 
                        disabled={isFlamed || post.userId === currentUser.id}
                        className={`group flex flex-col items-center justify-center gap-0.5 ${isFlamed ? 'opacity-100' : 'opacity-80'}`}
                        title="Doar Flame"
                    >
                        <i className={`fa-solid fa-fire text-xl transition-all ${isFlamed ? 'text-primary scale-110 drop-shadow-[0_0_8px_rgba(252,82,0,0.6)]' : 'text-white group-hover:text-primary'}`}></i>
                        {post.flamedByUserIds.length > 0 && <span className="text-[10px] font-bold text-gray-400">{post.flamedByUserIds.length}</span>}
                    </button>
                </div>

                <button onClick={() => onShare(post)} className="text-white hover:text-gray-300 transition-colors">
                    <i className="fa-solid fa-share-nodes text-lg"></i>
                </button>
            </div>
        </div>
    );
};

export default PostCard;
