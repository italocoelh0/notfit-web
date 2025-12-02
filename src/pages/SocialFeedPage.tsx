
import React, { useState, useRef, useMemo, Suspense, lazy } from 'react';
import { UserData, Post, UITexts } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from '@components/PostCard';
import CommentsModal from '@components/CommentsModal';
import Avatar from '@components/Avatar';
import InstagramCamera from '@components/InstagramCamera'; // Importando a nova câmera

// Lazy load ImageEditor as it is heavy
const ImageEditor = lazy(() => import('@components/ImageEditor'));

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
  onCreatePost: (post: any, isPriority?: boolean) => void;
  onSendNotification: (message: string) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ userData, onCreatePost, onSendNotification }) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isEditorOpen, setEditorOpen] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false); // Novo estado para câmera
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Handles file selection from gallery
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
                setEditorOpen(true);
                setIsCameraOpen(false); // Close camera if open
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
        const caption = prompt("Legenda da foto (opcional):", "") || "📸 Nova atualização";
        
        onCreatePost({
            userId: userData.id,
            content: caption,
            imageUrl: finalImage,
        });
        onSendNotification("Post publicado com sucesso!");
        setImagePreview(null);
        setEditorOpen(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    return (
        <div className="mb-6">
            <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
            />
            
            <button 
                onClick={() => setIsCameraOpen(true)}
                className="w-full bg-surface-100 border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/5 transition-all group shadow-lg"
            >
                <div className="relative">
                    <Avatar src={userData.userAvatar} alt={userData.name} size="md" />
                    <div className="absolute -bottom-1 -right-1 bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center border-2 border-surface-100">
                        <i className="fa-solid fa-plus text-[10px]"></i>
                    </div>
                </div>
                
                <div className="flex-1 text-left">
                    <span className="font-anton uppercase tracking-wide text-white text-lg">Nova Publicação</span>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Compartilhe seu progresso</p>
                </div>

                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <i className="fa-solid fa-camera text-lg"></i>
                </div>
            </button>

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
  onCreatePost: (post: any, isPriority?: boolean) => void;
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
  
  // Added to match Dashboard call (even if not used)
  isEditMode?: boolean;
  uiTexts?: UITexts;
  onUpdateUiText?: (page: keyof UITexts, key: string, value: string) => void;
}

const SocialFeedPage: React.FC<SocialFeedPageProps> = (props) => {
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [flameConfirmPost, setFlameConfirmPost] = useState<Post | null>(null);
    const [commentsPost, setCommentsPost] = useState<Post | null>(null);

    // Optimized sorting with useMemo
    const sortedPosts = useMemo(() => {
        return [...props.posts].sort((a, b) => {
            if (a.isPriority && !b.isPriority) return -1;
            if (!a.isPriority && b.isPriority) return 1;
            return b.id - a.id;
        });
    }, [props.posts]);
    
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
        <div className="max-w-xl mx-auto pb-24">
            <CreatePost userData={props.userData} onCreatePost={props.onCreatePost} onSendNotification={props.onSendNotification} />
            <div className="space-y-4">
                {sortedPosts.map(post => (
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
                ))}
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
