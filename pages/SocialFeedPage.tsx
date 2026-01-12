
import React, { useState, useRef, useMemo, Suspense, lazy, useEffect } from 'react';
import { UserData, Post, UITexts } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from '../components/PostCard';
import CommentsModal from '../components/CommentsModal';
import Avatar from '../components/Avatar';
import InstagramCamera from '../components/InstagramCamera';

const ImageEditor = lazy(() => import('../components/ImageEditor'));

interface EditPostModalProps {
    post: Post;
    onUpdatePost: (postId: number, newContent: string) => void;
    onClose: () => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, onUpdatePost, onClose }) => {
    const [content, setContent] = useState(post.content);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!content.trim()) return;
        setIsSaving(true);
        await onUpdatePost(post.id, content);
        onClose();
    };

    return (
        <motion.div
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-surface-100 rounded-[32px] p-8 w-full max-w-lg border border-white/10 shadow-2xl"
                initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                onClick={e => e.stopPropagation()}
            >
                <h2 className="font-anton uppercase text-2xl text-white mb-6 tracking-wide">Editar Legenda</h2>
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full bg-black/40 p-4 rounded-2xl border border-white/10 focus:outline-none focus:border-primary text-white min-h-[150px] text-sm leading-relaxed"
                />
                <div className="flex gap-3 mt-8">
                    <button onClick={onClose} className="flex-1 bg-surface-200 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest hover:bg-surface-300 transition-colors">Cancelar</button>
                    <button onClick={handleSave} disabled={isSaving} className="flex-1 bg-primary text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest hover:opacity-90 shadow-lg shadow-primary/20 disabled:opacity-50">
                        {isSaving ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

interface FlameConfirmationModalProps {
    post: Post;
    onConfirm: (dontShowAgain: boolean) => void;
    onClose: () => void;
}

const FlameConfirmationModal: React.FC<FlameConfirmationModalProps> = ({ post, onConfirm, onClose }) => {
    const [dontShowAgain, setDontShowAgain] = useState(false);

    return (
        <motion.div
            className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="bg-surface-100 rounded-[32px] p-8 w-full max-w-sm border border-white/10 shadow-2xl text-center"
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(252,82,0,0.2)]">
                    <i className="fa-solid fa-fire text-4xl text-primary animate-pulse"></i>
                </div>
                <h3 className="text-2xl font-anton uppercase tracking-wide text-white mb-2">Doar Flame?</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-8">
                    Isso custará <span className="text-white font-bold">1 flame</span> do seu saldo para destacar o post de <span className="text-white font-bold">{post.userName}</span>.
                </p>

                <div className="flex items-center justify-center gap-3 mb-8 cursor-pointer group" onClick={() => setDontShowAgain(!dontShowAgain)}>
                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${dontShowAgain ? 'bg-primary border-primary shadow-[0_0_10px_rgba(252,82,0,0.3)]' : 'border-gray-600 bg-transparent group-hover:border-gray-400'}`}>
                        {dontShowAgain && <i className="fa-solid fa-check text-white text-[10px]"></i>}
                    </div>
                    <span className="text-xs text-gray-400 font-medium select-none group-hover:text-gray-200">Não mostrar novamente</span>
                </div>

                <div className="flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 rounded-xl bg-surface-200 hover:bg-surface-300 font-bold text-xs uppercase tracking-widest text-white transition-all">
                        Agora não
                    </button>
                    <button onClick={() => onConfirm(dontShowAgain)} className="flex-1 py-4 rounded-xl bg-primary text-white hover:scale-[1.03] active:scale-[0.98] font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary/20">
                        Confirmar
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

interface CreatePostProps {
  userData: UserData;
  onCreatePost: (post: any) => void;
  onSendNotification: (message: string) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ userData, onCreatePost, onSendNotification }) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isEditorOpen, setEditorOpen] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [locationName, setLocationName] = useState<string | null>(null);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const toggleLocation = () => {
        if (locationName) {
            setLocationName(null);
            return;
        }

        setIsFetchingLocation(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const mockLocations = ["Vila Velha, ES", "Rio de Janeiro, RJ", "São Paulo, SP", "Vitória, ES"];
                    const randomLoc = mockLocations[Math.floor(Math.random() * mockLocations.length)];
                    setLocationName(randomLoc);
                    setIsFetchingLocation(false);
                },
                (error) => {
                    onSendNotification("Habilite o GPS para localizar.");
                    setIsFetchingLocation(false);
                }
            );
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
                setEditorOpen(true);
                setIsCameraOpen(false);
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    };

    const handleCameraCapture = (imageData: string) => {
        setImagePreview(imageData);
        setIsCameraOpen(false);
        setEditorOpen(true);
    };

    const handlePublishFromEditor = (finalImage: string) => {
        const caption = prompt("O que está rolando?", "") || "";
        
        onCreatePost({
            userId: userData.id,
            content: caption,
            imageUrl: finalImage,
            locationName: locationName || undefined
        });
        
        setImagePreview(null);
        setLocationName(null);
        setEditorOpen(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    return (
        <div className="mb-8">
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            
            <div className="bg-surface-100/60 backdrop-blur-md border border-white/5 rounded-[32px] p-4 flex items-center gap-4 shadow-xl">
                <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-primary to-orange-400">
                    <Avatar src={userData.userAvatar} alt={userData.name} size="md" className="ring-2 ring-background" />
                </div>
                
                <div className="flex-1">
                    <button 
                        onClick={() => setIsCameraOpen(true)}
                        className="w-full text-left py-2"
                    >
                        <span className="text-gray-400 text-[13px] font-medium">Compartilhe seu progresso...</span>
                    </button>
                    
                    <div className="flex items-center gap-2 mt-0.5">
                        <button 
                            onClick={toggleLocation}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all border ${locationName ? 'bg-primary/20 text-primary border-primary/20' : 'bg-white/5 text-gray-500 border-transparent hover:bg-white/10'}`}
                        >
                            {isFetchingLocation ? (
                                <i className="fa-solid fa-circle-notch fa-spin text-[8px]"></i>
                            ) : (
                                <i className={`fa-solid fa-location-dot text-[8px] ${locationName ? 'text-primary' : ''}`}></i>
                            )}
                            <span className="text-[9px] font-bold uppercase tracking-wider">
                                {locationName || "Local"}
                            </span>
                        </button>
                    </div>
                </div>

                <button 
                    onClick={() => setIsCameraOpen(true)}
                    className="w-12 h-12 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                >
                    <i className="fa-solid fa-camera text-xl"></i>
                </button>
            </div>

             <AnimatePresence>
                {isCameraOpen && (
                    <InstagramCamera 
                        onCapture={handleCameraCapture}
                        onClose={() => setIsCameraOpen(false)}
                        onGalleryClick={() => fileInputRef.current?.click()}
                    />
                )}

                {isEditorOpen && imagePreview && (
                    <Suspense fallback={<div className="fixed inset-0 bg-black flex items-center justify-center text-white">Iniciando Editor...</div>}>
                        <ImageEditor 
                            mode="photo-edit"
                            baseImage={imagePreview}
                            onClose={() => {
                                setEditorOpen(false);
                                setImagePreview(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            onPublish={handlePublishFromEditor}
                        />
                    </Suspense>
                )}
            </AnimatePresence>
        </div>
    );
};

interface SocialFeedPageProps {
  userData: UserData;
  posts: Post[];
  onCreatePost: (post: any) => void;
  onDeletePost: (postId: number) => void;
  onUpdatePost: (postId: number, newContent: string) => void;
  onViewProfile: (userId: string) => void;
  onLikePost: (postId: number) => void;
  onSharePost: (post: Post) => void;
  onRefresh: () => Promise<void>;
  onViewImage: (url: string) => void;
  onSendNotification: (message: string) => void;
  onGiveFlame: (postId: number, authorId: string, updatePreference: boolean) => void;
  onAddComment: (postId: number, text: string) => void;
}

const SocialFeedPage: React.FC<SocialFeedPageProps> = (props) => {
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [flameConfirmPost, setFlameConfirmPost] = useState<Post | null>(null);
    const [commentsPost, setCommentsPost] = useState<Post | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredPosts = useMemo(() => {
        let result = [...props.posts];
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p => 
                p.userName.toLowerCase().includes(query) ||
                p.username.toLowerCase().includes(query) ||
                p.locationName?.toLowerCase().includes(query) ||
                (p.content && p.content.toLowerCase().includes(query))
            );
        }
        return result.sort((a, b) => b.id - a.id);
    }, [props.posts, searchQuery]);
    
    const handleFlameTrigger = (post: Post) => {
        if (props.userData.skipFlameConfirmation) {
            props.onGiveFlame(post.id, post.userId, false);
        } else {
            setFlameConfirmPost(post);
        }
    };

    const handleFlameConfirm = (dontShowAgain: boolean) => {
        if (flameConfirmPost) {
            props.onGiveFlame(flameConfirmPost.id, flameConfirmPost.userId, dontShowAgain);
            setFlameConfirmPost(null);
        }
    };

    return (
        <div className="max-w-xl mx-auto pb-32 px-4">
            {/* Busca Moderna com Efeito Blur */}
            <div className="mb-6 sticky top-0 z-30 pt-4 pb-4 bg-background/95 backdrop-blur-xl -mx-4 px-4">
                <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                        <i className="fa-solid fa-magnifying-glass text-sm"></i>
                    </div>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Pesquisar treinos, pessoas ou locais..."
                        className="w-full bg-surface-100 border border-white/5 rounded-2xl py-4 pl-14 pr-12 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-surface-200 transition-all shadow-xl"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery("")}
                            className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white"
                        >
                            <i className="fa-solid fa-xmark text-xs"></i>
                        </button>
                    )}
                </div>
            </div>

            <CreatePost userData={props.userData} onCreatePost={props.onCreatePost} onSendNotification={props.onSendNotification} />
            
            <div className="space-y-6">
                {filteredPosts.length > 0 ? (
                    filteredPosts.map(post => (
                        <PostCard 
                            key={post.id}
                            post={post}
                            currentUser={props.userData}
                            onLike={props.onLikePost}
                            onShare={props.onSharePost}
                            onViewProfile={props.onViewProfile}
                            onDelete={props.onDeletePost}
                            onEdit={setEditingPost}
                            onViewImage={props.onViewImage}
                            onGiveFlameTrigger={handleFlameTrigger}
                            onOpenComments={setCommentsPost}
                        />
                    ))
                ) : (
                    <div className="py-32 text-center opacity-40">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i className="fa-solid fa-ghost text-4xl text-gray-600"></i>
                        </div>
                        <p className="font-anton uppercase text-xl tracking-widest text-gray-500">Nada por aqui ainda</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {editingPost && (
                    <EditPostModal 
                        post={editingPost}
                        onUpdatePost={async (id, content) => {
                            await props.onUpdatePost(id, content);
                            setEditingPost(null);
                        }}
                        onClose={() => setEditingPost(null)}
                    />
                )}
                {flameConfirmPost && (
                    <FlameConfirmationModal 
                        post={flameConfirmPost}
                        onClose={() => setFlameConfirmPost(null)}
                        onConfirm={handleFlameConfirm}
                    />
                )}
                {commentsPost && (
                    <CommentsModal
                        post={commentsPost}
                        currentUser={props.userData}
                        onClose={() => setCommentsPost(null)}
                        onAddComment={props.onAddComment}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default SocialFeedPage;
