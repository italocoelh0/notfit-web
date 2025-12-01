
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserData, Post } from '../types';
import { BADGES_DATABASE } from '../constants';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';
import CommentsModal from '../components/CommentsModal';

// FIX: Copied EditPostModal from SocialFeedPage.tsx to handle post editing.
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

interface ProfileViewPageProps {
  profile: UserData;
  currentUser: UserData;
  posts: Post[];
  onBack: () => void;
  onSendMessage: () => void;
  onFollowToggle: (targetUserId: string) => void;
  onBlockToggle: (targetUserId: string) => void;
  onViewImage: (url: string) => void;
  onLikePost: (id: number) => void;
  onSharePost: (post: Post) => void;
  onDeletePost: (id: number) => void;
  // FIX: Changed signature to match the handler in App.tsx.
  onEditPost: (postId: number, newContent: string) => void;
  onGiveFlame: (postId: number, authorId: string, updatePreference: boolean) => void;
  onAddComment: (postId: number, text: string) => void;
}

const Stat: React.FC<{ value: string | number; label: string }> = ({ value, label }) => (
    <div className="text-center flex-1">
        <p className="text-2xl font-anton text-white tracking-wide">{value}</p>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{label}</p>
    </div>
);

const ProfileViewPage: React.FC<ProfileViewPageProps> = ({ 
  profile, 
  currentUser,
  posts,
  onBack, 
  onSendMessage,
  onFollowToggle,
  onBlockToggle,
  onViewImage,
  onLikePost,
  onSharePost,
  onDeletePost,
  onEditPost,
  onGiveFlame,
  onAddComment
}) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [feedMode, setFeedMode] = useState<boolean>(false);
  const [startPostIndex, setStartPostIndex] = useState(0);
  const [commentsPost, setCommentsPost] = useState<Post | null>(null);
  // FIX: Added state to manage the post being edited.
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const isFollowing = currentUser.followingIds.includes(profile.id);
  const isBlocked = currentUser.blockedUserIds.includes(profile.id);

  // Filter only this user's posts and sort by date desc
  const userPosts = useMemo(() => {
      return [...posts].sort((a, b) => b.id - a.id);
  }, [posts]);

  const equippedBadge = useMemo(() => {
    return BADGES_DATABASE.find(b => b.id === profile.equippedBadgeId);
  }, [profile.equippedBadgeId]);

  const handlePostClick = (index: number) => {
      setStartPostIndex(index);
      setFeedMode(true);
  };

  // Function to handle flames from the feed view
  const handleFlameTrigger = (post: Post) => {
      if (currentUser.skipFlameConfirmation) {
          onGiveFlame(post.id, post.userId, false);
      } else {
          // For simplicity in this view, we just give the flame directly or could open a modal
          // Reusing the main modal would require lifting state up further, 
          // so we'll do a direct give for now or simple alert
          if (window.confirm("Doar 1 Flame para este post?")) {
               onGiveFlame(post.id, post.userId, false);
          }
      }
  };

  if (isBlocked) {
    return (
       <div className="min-h-screen bg-background flex flex-col">
          {/* Header */}
          <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/10">
            <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-surface-100 rounded-full text-white hover:bg-surface-200 transition-colors">
                <i className="fa-solid fa-arrow-left"></i>
            </button>
            <span className="font-anton uppercase tracking-wider text-lg text-white">{profile.username}</span>
            <div className="w-10"></div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-surface-100 rounded-full flex items-center justify-center mb-4 text-red-500 text-3xl">
                <i className="fa-solid fa-ban"></i>
            </div>
            <h2 className="font-anton uppercase text-2xl text-white mb-2">Bloqueado</h2>
            <p className="text-gray-500 text-sm mb-8">Você bloqueou este usuário.</p>
            <button
                onClick={() => onBlockToggle(profile.id)}
                className="bg-surface-200 text-white font-anton uppercase tracking-widest text-xs py-3 px-8 rounded-xl hover:bg-surface-300 transition-colors"
            >
                Desbloquear
            </button>
          </div>
       </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-white/10">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-surface-100 rounded-full text-white hover:bg-surface-200 transition-colors">
            <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h1 className="font-anton uppercase tracking-wider text-lg text-white flex items-center gap-2">
            {profile.username}
            {profile.isVerified && <i className="fa-solid fa-circle-check text-blue-400 text-xs"></i>}
        </h1>
        <div className="relative">
            <button onClick={() => setMenuOpen(!isMenuOpen)} className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors">
                <i className="fa-solid fa-ellipsis-vertical"></i>
            </button>
            <AnimatePresence>
            {isMenuOpen && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-surface-200 border border-white/10 rounded-xl shadow-2xl z-40 overflow-hidden"
                >
                    <button 
                        onClick={() => {
                            onBlockToggle(profile.id);
                            setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                    >
                        <i className="fa-solid fa-ban"></i> Bloquear Usuário
                    </button>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Profile Card */}
        <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-3xl p-6 flex flex-col items-center relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

            <div className="w-24 h-24 rounded-full mb-4 relative group bg-surface-200 border-4 border-background shadow-xl z-10">
                 <Avatar src={profile.userAvatar} alt={profile.name} size="xl" className="w-full h-full" />
                {equippedBadge && equippedBadge.type === 'frame' && (
                    <img src={equippedBadge.imageUrl} alt="Moldura" className="absolute inset-0 w-full h-full object-contain pointer-events-none scale-110"/>
                )}
                {equippedBadge && equippedBadge.type === 'badge' && (
                    <img src={equippedBadge.imageUrl} alt="Emblema" className="absolute -bottom-1 -right-1 w-8 h-8 object-contain pointer-events-none drop-shadow-lg"/>
                )}
            </div>

            <h2 className="font-anton uppercase text-2xl text-white tracking-wide mb-1">{profile.name}</h2>
            
            <div className="flex flex-wrap gap-2 justify-center mb-4">
                 {profile.activityType && (
                    <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-300 border border-white/5">
                        {profile.activityType}
                    </span>
                 )}
            </div>

            <p className="text-sm text-gray-400 text-center leading-relaxed max-w-xs mb-6">
                {profile.bio || "Sem biografia."}
            </p>

            <div className="flex w-full justify-between border-t border-white/10 pt-6">
                <Stat value={userPosts.length} label="Posts" />
                <div className="w-px bg-white/10 mx-2"></div>
                <Stat value={profile.followerIds.length} label="Seguidores" />
                <div className="w-px bg-white/10 mx-2"></div>
                <Stat value={profile.followingIds.length} label="Seguindo" />
            </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
            <button 
                onClick={() => onFollowToggle(profile.id)}
                className={`flex-1 py-3.5 rounded-xl text-xs font-anton uppercase tracking-widest transition-all shadow-lg active:scale-95
                ${isFollowing 
                    ? 'bg-surface-100 text-white border border-white/10 hover:bg-surface-200' 
                    : 'bg-gradient-to-r from-primary to-orange-600 text-white hover:shadow-orange-500/20'
                }`}
            >
                {isFollowing ? 'Seguindo' : 'Seguir'}
            </button>
            <button 
                onClick={onSendMessage} 
                className="flex-1 bg-white/5 border border-white/10 text-white py-3.5 rounded-xl text-xs font-anton uppercase tracking-widest hover:bg-white/10 transition-all shadow-lg active:scale-95"
            >
                Mensagem
            </button>
        </div>

        {/* Posts Grid */}
        <div>
             <div className="flex items-center gap-2 mb-4 opacity-60">
                <i className="fa-solid fa-grid text-xs"></i>
                <span className="text-[10px] font-bold uppercase tracking-widest">Publicações</span>
             </div>

             {userPosts.length > 0 ? (
                <div className="grid grid-cols-3 gap-1 rounded-2xl overflow-hidden border border-white/5 bg-surface-100">
                    {userPosts.map((post, index) => (
                    <motion.div 
                        key={post.id}
                        className="aspect-square bg-surface-200 cursor-pointer relative group overflow-hidden"
                        whileHover={{ opacity: 0.9 }}
                        onClick={() => handlePostClick(index)}
                    >
                        {post.imageUrl ? (
                        <img src={post.imageUrl} alt="Post" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"/>
                        ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500 p-2 bg-surface-300">
                            <p className="text-[10px] text-center line-clamp-3">{post.content}</p>
                        </div>
                        )}
                        
                        {/* Overlay icons */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 text-white">
                            <span className="text-xs font-bold flex items-center gap-1"><i className="fa-solid fa-heart"></i> {post.likedByUserIds.length}</span>
                        </div>
                    </motion.div>
                    ))}
                </div>
             ) : (
                 <div className="py-20 text-center bg-black/20 rounded-3xl border border-white/5 border-dashed">
                     <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fa-solid fa-camera text-2xl text-gray-600"></i>
                     </div>
                     <p className="font-anton uppercase text-lg text-gray-500 tracking-wide">Sem publicações</p>
                     <p className="text-xs text-gray-600">Este usuário ainda não postou nada.</p>
                 </div>
             )}
        </div>
      </div>

      {/* Full Screen Feed Modal */}
      <AnimatePresence>
          {feedMode && (
              <motion.div
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  className="fixed inset-0 z-[100] bg-black flex flex-col"
              >
                  <div className="bg-surface-100 px-4 py-3 flex items-center gap-4 border-b border-white/10">
                      <button onClick={() => setFeedMode(false)} className="w-8 h-8 flex items-center justify-center bg-surface-200 rounded-full text-white hover:bg-primary hover:text-white transition-colors">
                          <i className="fa-solid fa-arrow-left"></i>
                      </button>
                      <div className="flex items-center gap-2">
                         <Avatar src={profile.userAvatar} alt={profile.name} size="sm" />
                         <span className="font-anton uppercase tracking-wide text-white text-sm">Publicações de {profile.username}</span>
                      </div>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar p-0 sm:p-4">
                      <div className="max-w-xl mx-auto space-y-4">
                          {userPosts.slice(startPostIndex).concat(userPosts.slice(0, startPostIndex)).map(post => (
                              <PostCard 
                                key={post.id}
                                post={post}
                                currentUser={currentUser}
                                onLike={onLikePost}
                                onShare={onSharePost}
                                onViewProfile={() => {}} // Already on profile
                                onDelete={onDeletePost}
                                // FIX: onEdit now opens the modal
                                onEdit={setEditingPost}
                                onViewImage={onViewImage}
                                onGiveFlameTrigger={handleFlameTrigger}
                                onOpenComments={setCommentsPost}
                              />
                          ))}
                          <div className="py-8 text-center text-gray-500 text-xs uppercase tracking-widest">
                              Fim das publicações
                          </div>
                      </div>
                  </div>
              </motion.div>
          )}
      </AnimatePresence>

       <AnimatePresence>
            {editingPost && (
                <EditPostModal
                    post={editingPost}
                    onUpdatePost={async (id, content) => {
                        await onEditPost(id, content);
                        setEditingPost(null);
                    }}
                    onClose={() => setEditingPost(null)}
                />
            )}
            {commentsPost && (
                <CommentsModal
                    post={commentsPost}
                    currentUser={currentUser}
                    onClose={() => setCommentsPost(null)}
                    onAddComment={onAddComment}
                />
            )}
        </AnimatePresence>
    </div>
  );
};

export default ProfileViewPage;
