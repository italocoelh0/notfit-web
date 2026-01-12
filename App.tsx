
// App.tsx
import React, { useState, useCallback, useEffect, Suspense, lazy } from 'react';
import {
  Page,
  UserData,
  Recipe,
  Exercise,
  OnboardingData,
  Post,
  Notification,
  UITexts,
  CheckinItemData,
  DirectMessage,
  AppNotification,
  EventData,
  Professional,
  RecordedActivity,
  Competition,
} from './types';
import { AnimatePresence, motion } from 'framer-motion';
import {
  EXERCICIOS_DATABASE,
  RECEITAS_DATABASE,
  DEFAULT_UI_TEXTS,
  DEFAULT_CHECKIN_ITEMS,
  PROFESSIONALS_DATABASE,
} from './constants';
import NotificationBanner from './components/NotificationBanner';
import { api } from './services/api';
import ImageViewerModal from './components/ImageViewerModal';

// Lazy Load Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProfileViewPage = lazy(() => import('./pages/ProfileViewPage'));
const ChatViewPage = lazy(() => import('./pages/ChatViewPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const RecipeSelectionPage = lazy(() => import('./pages/RecipeSelectionPage'));
const ExerciseSelectionPage = lazy(() => import('./pages/ExerciseSelectionPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const UpdatePasswordPage = lazy(() => import('./pages/UpdatePasswordPage'));

const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4,
} as const;

const LoadingScreen = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-primary text-4xl animate-pulse">
      <i className="fa-solid fa-spinner-third fa-spin"></i>
    </div>
  </div>
);

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState<UserData[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);

  const [exercises, setExercises] = useState<Exercise[]>(EXERCICIOS_DATABASE);
  const [recipes, setRecipes] = useState<Recipe[]>(RECEITAS_DATABASE);
  
  const [professionals] = useState<Professional[]>(PROFESSIONALS_DATABASE);
  const [uiTexts] = useState<UITexts>(DEFAULT_UI_TEXTS);
  const [checkinItems] = useState<CheckinItemData[]>(DEFAULT_CHECKIN_ITEMS);
  const [globalNotification, setGlobalNotification] = useState<Notification | null>(null);
  const [viewingProfile, setViewingProfile] = useState<UserData | null>(null);
  const [chatContact, setChatContact] = useState<UserData | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const handleSendNotification = useCallback(
    (message: string) =>
      setGlobalNotification({ id: Date.now(), message }),
    [],
  );
  
  const handleDismissNotification = useCallback(
    () => setGlobalNotification(null),
    [],
  );
  
  const handleViewImage = (url: string) => setViewingImage(url);
  const handleCloseImageViewer = () => setViewingImage(null);

  const fetchData = useCallback(
    async (currentUserId: string) => {
        try {
          const [postsData, eventsData, usersData, dmsData] = await Promise.all([
            api.posts.list(),
            api.events.list(),
            api.users.getAll(),
            api.messages.list(currentUserId)
          ]);

          const mappedPosts: Post[] = postsData.map((p: any) => ({
            ...p,
            timestamp: new Date(p.timestamp).toLocaleDateString(),
            likedByUserIds: p.likedByUserIds || [],
            flamedByUserIds: p.flamedByUserIds || [],
            comments: p.comments || [],
          }));
          setPosts(mappedPosts);
          setEvents(eventsData);
          setUsers(usersData);
          setDirectMessages(dmsData);
        } catch (error: any) {
          console.error("Erro ao carregar dados:", error);
        }
    },
    [],
  );

  useEffect(() => {
    const initAuth = async () => {
        setLoading(true);
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        if (token) {
            try {
                const user = await api.auth.getCurrentUser();
                if (user) {
                    setUserData(user);
                    await fetchData(user.id);
                    // PULA ONBOARDING E VAI DIRETO PRO DASHBOARD
                    setCurrentPage('dashboard');
                } else {
                    setCurrentPage('login');
                }
            } catch (e) {
                localStorage.removeItem('auth_token');
                sessionStorage.removeItem('auth_token');
                setCurrentPage('login');
            }
        } else {
            setCurrentPage('login');
        }
        setLoading(false);
    };
    initAuth();
  }, [fetchData]);

  const handleLogin = async (email: string, password: string, rememberMe: boolean) => {
    const data = await api.auth.login(email, password);
    
    if (!data.user) {
        throw new Error("Perfil não encontrado. Verifique se o banco de dados está configurado corretamente.");
    }

    if (rememberMe) {
        localStorage.setItem('auth_token', data.token || '');
        sessionStorage.removeItem('auth_token');
    } else {
        sessionStorage.setItem('auth_token', data.token || '');
        localStorage.removeItem('auth_token');
    }
    
    setUserData(data.user);
    await fetchData(data.user.id);
    
    // REDIRECIONA DIRETAMENTE PARA O DASHBOARD
    setCurrentPage('dashboard');
  };

  const handleRegister = async (data: { name: string; email: string; birthDate: string; password: string; }) => {
    const { name, email, birthDate, password } = data;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    let username = `${email.split('@')[0]}_${randomSuffix}`.toLowerCase().replace(/[^a-z0-9_]/g, '');
    await api.auth.register({ name, email, birthDate, password, username });
    handleSendNotification('Conta criada com sucesso!');
    setCurrentPage('login');
  };

  const handleLogout = async () => {
    await api.auth.logout();
    localStorage.removeItem('auth_token');
    sessionStorage.removeItem('auth_token');
    setUserData(null);
    setCurrentPage('login');
  };

  const handleUpdateUserData = async (updatedData: Partial<UserData>): Promise<boolean> => {
    if (!userData) return false;
    try {
        const updatedUser = await api.users.update(userData.id, updatedData);
        setUserData(updatedUser);
        handleSendNotification('Perfil atualizado!');
        return true;
    } catch (e: any) {
        handleSendNotification(`Erro ao atualizar: ${e.message}`);
        return false;
    }
  };

  const handleCreatePost = useCallback(
    async (postData: any) => {
      if (!userData) return;
      try {
          const fullPostData = { ...postData, userName: userData.name, username: userData.username, userAvatar: userData.userAvatar, authorIsVerified: userData.isVerified };
          const newPost = await api.posts.create(fullPostData);
          setPosts((prev) => [newPost, ...prev]);
          handleSendNotification('Publicação criada!');
      } catch (e: any) {
          handleSendNotification(`Erro ao criar post: ${e.message}`);
      }
    },
    [userData, handleSendNotification],
  );

  const handleLikePost = useCallback(async (postId: number) => {
      if (!userData) return;
      const post = posts.find((p) => p.id === postId);
      if (!post) return;
      const isLiked = post.likedByUserIds.includes(userData.id);
      const newLikedIds = isLiked ? post.likedByUserIds.filter((id) => id !== userData.id) : [...post.likedByUserIds, userData.id];
      setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likedByUserIds: newLikedIds } : p));
      await api.posts.like(postId, userData.id);
    },
    [userData, posts],
  );

  const renderCurrentPage = () => {
    if (loading) return <LoadingScreen />;

    let pageComponent: React.ReactNode = null;
    
    switch (currentPage) {
      case 'login':
        pageComponent = <LoginPage onLogin={handleLogin} onNavigateToRegister={() => setCurrentPage('register')} onNavigateToForgotPassword={() => setCurrentPage('forgotPassword')} isEditMode={false} uiTexts={uiTexts} onUpdateUiText={() => {}} />;
        break;
      case 'register':
        pageComponent = <RegisterPage onRegister={handleRegister} onNavigateToLogin={() => setCurrentPage('login')} isEditMode={false} uiTexts={uiTexts} onUpdateUiText={() => {}} />;
        break;
      case 'onboarding':
        pageComponent = <OnboardingPage onOnboardingSuccess={handleOnboardingSuccess} isEditMode={false} uiTexts={uiTexts} onUpdateUiText={() => {}} />;
        break;
      case 'dashboard':
        if (userData) {
          pageComponent = (
            <Dashboard
              userData={userData} onLogout={handleLogout} onUpdateUserData={handleUpdateUserData}
              recipes={recipes} exercises={exercises} professionals={professionals}
              onUpdateRecipe={(r) => setRecipes(prev => prev.map(x => x.id === r.id ? r : x))} 
              onUpdateExercise={(ex) => setExercises(prev => prev.map(x => x.id === ex.id ? ex : x))}
              onSendNotification={handleSendNotification} onAddRecipe={(r) => setRecipes(prev => [{...r, id: Date.now()}, ...prev])}
              onDeleteRecipe={(id) => setRecipes(prev => prev.filter(x => x.id !== id))} 
              onAddExercise={(ex) => setExercises(prev => [{...ex, id: Date.now()}, ...prev])}
              onDeleteExercise={(id) => setExercises(prev => prev.filter(x => x.id !== id))} 
              isEditMode={false} onToggleEditMode={() => {}}
              uiTexts={uiTexts} onUpdateUiText={() => {}} checkinItems={checkinItems}
              onUpdateCheckinItem={() => {}} posts={posts} onCreatePost={handleCreatePost}
              onDeletePost={(id) => setPosts(prev => prev.filter(p => p.id !== id))}
              onViewProfile={(id) => { const u = users.find(x => x.id === id); if(u) setViewingProfile(u); setCurrentPage('profileView'); }}
              onLikePost={handleLikePost} onAddComment={handleAddComment}
              onSharePost={(p) => handleCreatePost({ content: `Compartilhando: ${p.content}`, imageUrl: p.imageUrl })}
              allUsers={users} notifications={[]}
              onFollowToggle={(id) => handleUpdateUserData({ followingIds: userData.followingIds.includes(id) ? userData.followingIds.filter(x => x !== id) : [...userData.followingIds, id] })}
              onNavigateToChat={(u) => { setChatContact(u); setCurrentPage('chatView'); }}
              events={events} onJoinEvent={handleJoinEvent} onCreateEvent={handleCreateEvent}
              onRefresh={() => fetchData(userData.id)} onViewImage={handleViewImage}
              onUpdatePost={() => {}} onSaveActivity={() => {}}
              onGiveFlame={() => {}} onCreateCompetition={() => {}}
            />
          );
        } else {
           setTimeout(() => setCurrentPage('login'), 0);
           pageComponent = <LoadingScreen />;
        }
        break;
      case 'profileView':
        if (viewingProfile && userData)
          pageComponent = <ProfileViewPage profile={viewingProfile} currentUser={userData} posts={posts.filter((p) => p.userId === viewingProfile.id)} onBack={() => setCurrentPage('dashboard')} onSendMessage={() => { setChatContact(viewingProfile); setCurrentPage('chatView'); }} onFollowToggle={() => {}} onBlockToggle={() => {}} onViewImage={handleViewImage} onLikePost={handleLikePost} onSharePost={() => {}} onDeletePost={() => {}} onEditPost={() => {}} onGiveFlame={() => {}} onAddComment={() => {}} />;
        break;
      case 'chatView':
        if (chatContact && userData)
          pageComponent = <ChatViewPage contact={chatContact} messages={directMessages.filter((m) => (m.senderId === userData.id && m.receiverId === chatContact.id) || (m.senderId === chatContact.id && m.receiverId === userData.id))} currentUserId={userData.id} onBack={() => setCurrentPage('dashboard')} onSendMessage={handleSendMessage} onSendAudioMessage={handleSendAudioMessage} />;
        break;
      default:
        pageComponent = <LoginPage onLogin={handleLogin} onNavigateToRegister={() => setCurrentPage('register')} onNavigateToForgotPassword={() => setCurrentPage('forgotPassword')} isEditMode={false} uiTexts={uiTexts} onUpdateUiText={() => {}} />;
        break;
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div key={currentPage} variants={pageVariants} initial="initial" animate="in" exit="out" transition={pageTransition}>
          <Suspense fallback={<LoadingScreen />}>{pageComponent}</Suspense>
        </motion.div>
      </AnimatePresence>
    );
  };

  const handleOnboardingSuccess = async (data: OnboardingData) => {
    if (!userData) return;
    await handleUpdateUserData(data);
    setCurrentPage('dashboard');
  };

  const handleAddComment = async (postId: number, text: string) => {
    if (!userData) return;
    await api.posts.comment(postId, userData.id, text);
    fetchData(userData.id);
  };

  const handleCreateEvent = async (data: any) => {
    if (!userData) return;
    await api.events.create({ ...data, creatorId: userData.id });
    fetchData(userData.id);
  };

  const handleJoinEvent = async (id: number) => {
    if (!userData) return;
    await api.events.join(id, userData.id);
    fetchData(userData.id);
  };

  const handleSendMessage = async (text: string) => {
    if (!userData || !chatContact) return;
    await api.messages.send({ senderId: userData.id, receiverId: chatContact.id, text });
    const msgs = await api.messages.list(userData.id);
    setDirectMessages(msgs);
  };

  const handleSendAudioMessage = async (blob: Blob) => {
    if (!userData || !chatContact) return;
    const url = URL.createObjectURL(blob);
    await api.messages.send({ senderId: userData.id, receiverId: chatContact.id, audio_url: url });
    const msgs = await api.messages.list(userData.id);
    setDirectMessages(msgs);
  };

  return (
    <>
      <NotificationBanner notification={globalNotification} onDismiss={handleDismissNotification} />
      {renderCurrentPage()}
      <AnimatePresence>{viewingImage && <ImageViewerModal imageUrl={viewingImage} onClose={handleCloseImageViewer} />}</AnimatePresence>
    </>
  );
};

export default App;
