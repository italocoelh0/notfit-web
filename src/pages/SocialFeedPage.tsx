
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
                className="bg-surface-100 rounded-xl p-6 w-full max-w-lg"
                initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                onClick={e => e.stopPropagation()}
            >
                <h2 className="text-xl font-bold mb-4">Editar Publicação</h2>
                <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    className="w-full bg-surface-200 p-3 rounded-md border border-surface-300 focus:outline-none focus:ring-1 focus:ring-primary min-h-[120px]"
                />
                <div className="flex justify-end gap-3 mt-4">
                    <button onClick={onClose} className="bg-surface-200 text-on-surface px-4 py-2 rounded-md font-semibold text-sm hover:bg-surface-300">Cancelar</button>
                    <button onClick={handleSave} disabled={isSaving} className="bg-primary text-on-primary px-4 py-2 rounded-md font-semibold text-sm hover:opacity-90 disabled:opacity-50">
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
                className="bg-surface-100 rounded-2xl p-6 w-full max-w-sm border border-white/10 shadow-2xl"
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <i className="fa-solid fa-fire text-3xl text-primary"></i>
                    </div>
                    <h3 className="text-xl font-anton uppercase tracking-wide text-white mb-2">Doar Flame?</h3>
                    <p className="text-sm text-gray-400">
                        Você tem certeza que deseja doar 1 flame para <span className="font-bold text-white">{post.userName}</span>?
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Isso custará 1 flame do seu saldo.</p>
                </div>

                <div className="flex items-center justify-center gap-2 mb-6 cursor-pointer" onClick={() => setDontShowAgain(!dontShowAgain)}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${dontShowAgain ? 'bg-primary border-primary' : 'border-gray-500 bg-transparent'}`}>
                        {dontShowAgain && <i className="fa-solid fa-check text-white text-xs"></i>}
                    </div>
                    <span className="text-xs text-gray-400 select-none">Não mostrar novamente</span>
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-surface-200 hover:bg-surface-300 font-bold text-xs uppercase tracking-wider transition-colors">
                        Cancelar
                    </button>
                    <button onClick={() => onConfirm(dontShowAgain)} className="flex-1 py-3 rounded-xl bg-primary text-white hover:opacity-90 font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-primary/20">
                        Doar Flame
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
                    // Mock de localização por coordenadas
                    const mockLocations = ["São Paulo, SP", "Rio de Janeiro, RJ", "Belo Horizonte, MG", "Curitiba, PR", "Vitória, ES"];
                    const randomLoc = mockLocations[Math.floor(Math.random() * mockLocations.length)];
                    setLocationName(randomLoc);
                    setIsFetchingLocation(false);
                },
                (error) => {
                    onSendNotification("Não foi possível obter sua localização.");
                    setIsFetchingLocation(false);
                }
            );
        } else {
            onSendNotification("Geolocalização não suportada.");
            setIsFetchingLocation(false);
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
        const caption = prompt("Legenda da foto (opcional):", "") || "";
        
        onCreatePost({
            userId: userData.id,
            content: caption,
            imageUrl: finalImage,
            locationName: locationName || undefined
        });
        
        onSendNotification("Post publicado!");
        setImagePreview(null);
        setLocationName(null);
        setEditorOpen(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    return (
        <div className="mb-8">
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            
            <div className="bg-surface-100 border border-white/5 rounded-3xl p-4 flex items-center gap-4 shadow-xl">
                <div className="relative">
                    <Avatar src={userData.userAvatar} alt={userData.name} size="md" />
                </div>
                
                <div className="flex-1">
                    <button 
                        onClick={() => setIsCameraOpen(true)}
                        className="w-full text-left py-2"
                    >
                        <span className="text-gray-400 text-sm font-medium">No que você está pensando?</span>
                    </button>
                    
                    <div className="flex items-center gap-3 mt-1">
                        <button 
                            onClick={toggleLocation}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-full transition-all ${locationName ? 'bg-primary/20 text-primary border border-primary/20' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {isFetchingLocation ? (
                                <i className="fa-solid fa-circle-notch fa-spin text-[10px]"></i>
                            ) : (
                                <i className={`fa-solid fa-location-dot text-[10px] ${locationName ? 'text-primary' : ''}`}></i>
                            )}
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                {locationName || "Adicionar Local"}
                            </span>
                        </button>
                    </div>
                </div>

                <button 
                    onClick={() => setIsCameraOpen(true)}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-primary transition-colors"
                >
                    <i className="fa-solid fa-camera"></i>
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
                    <Suspense fallback={<div className="fixed inset-0 bg-black flex items-center justify-center text-white">Carregando editor...</div>}>
                        <ImageEditor 
                            mode="photo-edit"
                            baseImage={imagePreview}
                            onClose={() => {
                                setEditorOpen(false);
                                setImagePreview(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            onSave={(img) => console.log('Saved locally', img)} 
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
        <div className="max-w-xl mx-auto pb-24 px-4">
            {/* Barra de Busca Clean */}
            <div className="mb-8 sticky top-0 z-30 pt-2 pb-2 bg-background/95 backdrop-blur-md">
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                        <i className="fa-solid fa-magnifying-glass text-xs"></i>
                    </div>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar no feed..."
                        className="w-full bg-surface-100 border border-white/5 rounded-2xl py-3 pl-11 pr-11 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all shadow-2xl shadow-black/40"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                        >
                            <i className="fa-solid fa-circle-xmark text-xs"></i>
                        </button>
                    )}
                </div>
            </div>

            <CreatePost userData={props.userData} onCreatePost={props.onCreatePost} onSendNotification={props.onSendNotification} />
            
            <div className="space-y-2">
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
                    <div className="py-20 text-center opacity-30">
                        <i className="fa-solid fa-ghost text-4xl mb-4"></i>
                        <p className="font-anton uppercase text-lg tracking-widest">Nada encontrado</p>
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
