
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
        <div className="bg-surface-100 p-4 rounded-2xl border border-white/5 shadow-sm mb-4">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onViewProfile(post.userId)}>
                    <Avatar src={post.userAvatar} alt={post.userName} size="md" className="border-2 border-transparent group-hover:border-primary transition-colors" />
                    <div>
                        <p className="font-bold text-sm flex items-center text-white group-hover:text-primary transition-colors">
                            {post.userName} 
                            {post.authorIsVerified && <i className="fa-solid fa-circle-check text-blue-400 text-xs ml-1"></i>}
                        </p>
                        <p className="text-[10px] text-on-surface-secondary font-medium">@{post.username} · {post.timestamp}</p>
                    </div>
                </div>
                {post.userId === currentUser.id && (
                    <div className="relative">
                        <button onClick={() => setOptionsOpen(!optionsOpen)} className="text-on-surface-secondary hover:text-white p-2">
                            <i className="fa-solid fa-ellipsis"></i>
                        </button>
                        <AnimatePresence>
                            {optionsOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -5, scale: 0.95 }} 
                                    animate={{ opacity: 1, y: 0, scale: 1 }} 
                                    exit={{ opacity: 0, y: -5, scale: 0.95 }} 
                                    className="absolute right-0 mt-1 w-32 bg-surface-200 rounded-xl border border-white/10 shadow-xl z-10 overflow-hidden"
                                >
                                    <button onClick={() => { onEdit(post); setOptionsOpen(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-white hover:bg-white/10 transition-colors">Editar</button>
                                    <button onClick={() => { onDelete(post.id); setOptionsOpen(false); }} className="w-full text-left px-4 py-3 text-xs font-bold text-red-500 hover:bg-white/10 transition-colors">Deletar</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Content */}
            <p className="my-3 text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">{post.content}</p>
            
            {post.imageUrl && (
                <div className="rounded-xl overflow-hidden border border-white/5 shadow-lg mb-4">
                    <img 
                        src={post.imageUrl} 
                        alt="Post content" 
                        onClick={() => onViewImage(post.imageUrl!)} 
                        className="w-full h-auto object-cover max-h-[500px] cursor-pointer" 
                        loading="lazy"
                    />
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <div className="flex gap-6">
                    <button 
                        onClick={() => onLike(post.id)} 
                        className={`flex items-center gap-2 text-sm font-medium transition-all ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                    >
                        <i className={`${isLiked ? 'fa-solid' : 'fa-regular'} fa-heart text-lg`}></i> 
                        <span>{post.likedByUserIds.length}</span>
                    </button>
                    
                    <button 
                        onClick={() => onOpenComments(post)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-all"
                    >
                        <i className="fa-regular fa-comment text-lg"></i> 
                        <span>{post.comments.length}</span>
                    </button>

                    <button 
                        onClick={() => !isFlamed && onGiveFlameTrigger(post)} 
                        disabled={isFlamed || post.userId === currentUser.id}
                        className={`flex items-center gap-2 text-sm font-medium transition-all ${isFlamed ? 'text-primary cursor-default' : 'text-gray-400 hover:text-primary'}`}
                        title="Doar Flame"
                    >
                        <i className={`fa-solid fa-fire text-lg ${isFlamed ? 'animate-pulse' : ''}`}></i> 
                        <span>{post.flamedByUserIds.length}</span>
                    </button>
                </div>

                <button onClick={() => onShare(post)} className="text-gray-400 hover:text-white transition-all">
                    <i className="fa-solid fa-share-nodes text-lg"></i>
                </button>
            </div>
        </div>
    );
};

export default PostCard;
