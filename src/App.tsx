
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
import { usePaymentSuccess } from './hooks/usePaymentSuccess';

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

  // Mutatable databases for admin management
  const [exercises, setExercises] = useState<Exercise[]>(EXERCICIOS_DATABASE);
  const [recipes, setRecipes] = useState<Recipe[]>(RECEITAS_DATABASE);
  
  const [professionals] = useState<Professional[]>(PROFESSIONALS_DATABASE);
  const [uiTexts] = useState<UITexts>(DEFAULT_UI_TEXTS);
  const [checkinItems] = useState<CheckinItemData[]>(DEFAULT_CHECKIN_ITEMS);
  const [globalNotification, setGlobalNotification] = useState<Notification | null>(null);
  const [viewingProfile, setViewingProfile] = useState<UserData | null>(null);
  const [chatContact, setChatContact] = useState<UserData | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // Detectar retorno de pagamento bem-sucedido
  usePaymentSuccess(
    async () => {
      // Pagamento concluído - atualizar dados do usuário
      if (userData) {
        try {
          const updatedUser = await api.users.get(userData.id);
          setUserData(updatedUser);
          handleSendNotification('🔥 Pagamento concluído! Suas Flames foram adicionadas!');
        } catch (error) {
          console.error('Erro ao atualizar dados após pagamento:', error);
        }
      }
    },
    () => {
      // Pagamento cancelado
      handleSendNotification('⚠️ Pagamento cancelado.');
    }
  );

  // Content Management Handlers
  const handleUpdateExercise = (updated: Exercise) => {
    setExercises(prev => prev.map(ex => ex.id === updated.id ? updated : ex));
    handleSendNotification("Exercício atualizado com sucesso!");
  };

  const handleAddExercise = (newItem: Omit<Exercise, 'id'>) => {
    const newEx = { ...newItem, id: Date.now() };
    setExercises(prev => [newEx, ...prev]);
    handleSendNotification("Novo exercício adicionado à biblioteca!");
  };

  const handleDeleteExercise = (id: number) => {
    setExercises(prev => prev.filter(ex => ex.id !== id));
    handleSendNotification("Exercício removido.");
  };

  const handleUpdateRecipe = (updated: Recipe) => {
    setRecipes(prev => prev.map(r => r.id === updated.id ? updated : r));
    handleSendNotification("Receita atualizada!");
  };

  const handleAddRecipe = (newItem: Omit<Recipe, 'id'>) => {
    const newRec = { ...newItem, id: Date.now() };
    setRecipes(prev => [newRec, ...prev]);
    handleSendNotification("Nova receita adicionada!");
  };

  const handleDeleteRecipe = (id: number) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
    handleSendNotification("Receita removida.");
  };

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
          handleSendNotification(`Erro ao carregar dados: ${error.message}`);
        }
    },
    [handleSendNotification],
  );

  const handleSaveActivity = useCallback((activityData: Omit<RecordedActivity, 'id' | 'date'>) => {
      if (!userData) return;
      const newActivity: RecordedActivity = {
          ...activityData,
          id: `activity_${Date.now()}`,
          date: new Date().toISOString(),
      };
      let updatedUser = { ...userData };
      const updatedActivities = [newActivity, ...(userData.activities || [])];
      updatedUser.activities = updatedActivities;
      setUserData(updatedUser);
      api.users.update(userData.id, { activities: updatedActivities });
      handleSendNotification('Atividade salva!');
  }, [userData, handleSendNotification]);

  const handleCreateCompetition = useCallback((compData: Omit<Competition, 'id' | 'currentUserScore' | 'participantsCount' | 'leaderboard'>) => {
      if (!userData) return;
      const newCompetition: Competition = {
          id: `comp_${Date.now()}`,
          ...compData,
          creatorId: userData.id,
          currentUserScore: 0,
          participantsCount: 1,
          leaderboard: [{
              userId: userData.id,
              name: userData.name,
              avatar: userData.userAvatar,
              score: 0
          }]
      };
      const updatedCompetitions = [newCompetition, ...(userData.competitions || [])];
      setUserData(prev => prev ? { ...prev, competitions: updatedCompetitions } : null);
      api.users.update(userData.id, { competitions: updatedCompetitions });
      handleSendNotification('Competição criada com sucesso!');
  }, [userData, handleSendNotification]);


  useEffect(() => {
    const initAuth = async () => {
        setLoading(true);
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        if (token) {
            try {
                if (!localStorage.getItem('auth_token') && sessionStorage.getItem('auth_token')) {
                    localStorage.setItem('auth_token', token);
                }
                const user = await api.auth.getCurrentUser();
                if (user) {
                    setUserData(user);
                    fetchData(user.id);
                     if (user.goals && user.goals.length > 0) {
                        setCurrentPage('dashboard');
                      } else {
                        setCurrentPage('onboarding');
                      }
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
    if (rememberMe) {
        localStorage.setItem('auth_token', data.token);
        sessionStorage.removeItem('auth_token');
    } else {
        sessionStorage.setItem('auth_token', data.token);
        localStorage.removeItem('auth_token');
    }
    setUserData(data.user);
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

  const handleUpdateOtherUser = useCallback(async (userId: string, updates: Partial<UserData>) => {
      setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, ...updates } : u));
      try {
          await api.users.update(userId, updates);
          handleSendNotification('Aluno atualizado!');
      } catch (e: any) {
          handleSendNotification('Erro ao atualizar aluno.');
      }
  }, [handleSendNotification]);

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

  const handleUpdatePost = useCallback(async (postId: number, newContent: string) => {
      try {
          await api.posts.update(postId, newContent);
          setPosts((prevPosts) => prevPosts.map((p) => p.id === postId ? { ...p, content: newContent } : p));
          handleSendNotification('Atualizado!');
      } catch (e: any) {
          handleSendNotification(`Erro ao editar: ${e.message}`);
      }
    },
    [handleSendNotification],
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

  const handleGiveFlame = useCallback(async (postId: number, authorId: string, updatePreference: boolean) => {
      if (!userData || userData.flameBalance <= 0) {
          handleSendNotification("Saldo insuficiente!");
          return;
      }
      setUserData(prev => prev ? ({ ...prev, flameBalance: prev.flameBalance - 1 }) : null);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, flamedByUserIds: [...p.flamedByUserIds, userData.id] } : p));
      try {
          await api.posts.giveFlame(postId, userData.id, authorId);
      } catch (e: any) {
          handleSendNotification(e.message);
      }
  }, [userData, posts, handleSendNotification]);

  const handleAddComment = useCallback(async (postId: number, text: string) => {
      if (!userData) return;
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, { id: Date.now(), userId: userData.id, userName: userData.name, userAvatar: userData.userAvatar, text, timestamp: new Date().toISOString() }] } : p));
      await api.posts.comment(postId, userData.id, text);
  }, [userData]);

  // FIX: Added missing handleCreateEvent handler
  const handleCreateEvent = useCallback(
    async (
      eventData: Omit<EventData, 'id' | 'creatorId' | 'participantIds' | 'updates'>,
    ) => {
      if (!userData) return;
      
      try {
          const newEvent = await api.events.create({
              creatorId: userData.id,
              ...eventData
          });
          setEvents((prev) => [newEvent, ...prev].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
          handleSendNotification('Evento criado!');
          
           const formattedDate = new Date(eventData.date + 'T00:00:00').toLocaleDateString(
            'pt-BR',
            { day: '2-digit', month: 'long', year: 'numeric' },
          );
          const postContent = `🎉 Novo Evento: ${eventData.title}!\n\n${eventData.description}\n\nJunte-se a nós em ${eventData.location.city}, ${eventData.location.state} no dia ${formattedDate} às ${eventData.time}.`;

          handleCreatePost({
            userId: userData.id,
            content: postContent,
            imageUrl: eventData.imageUrl,
            videoUrl: undefined,
            originalPostId: undefined,
          });

      } catch (e: any) {
          handleSendNotification(`Erro ao criar evento: ${e.message}`);
      }
    },
    [userData, handleSendNotification, handleCreatePost],
  );

  // FIX: Added missing handleJoinEvent handler
  const handleJoinEvent = useCallback(
    async (eventId: number) => {
      if (!userData) return;
      const originalEvents = [...events];
      const event = originalEvents.find((e) => e.id === eventId);
      if (!event) return;
      
      const isParticipating = event.participantIds.includes(userData.id);
      const newParticipants = isParticipating
        ? event.participantIds.filter((id) => id !== userData.id)
        : [...event.participantIds, userData.id];
        
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId ? { ...e, participantIds: newParticipants } : e,
        ),
      );

      try {
          await api.events.join(eventId, userData.id);
      } catch (e) {
          setEvents(originalEvents);
          handleSendNotification("Erro ao participar do evento.");
          console.error("Join event failed", e);
      }
    },
    [userData, events, handleSendNotification],
  );

  const renderCurrentPage = () => {
    if (loading) return <LoadingScreen />;

    let pageComponent;
    switch (currentPage) {
      case 'login':
        pageComponent = <LoginPage onLogin={handleLogin} onNavigateToRegister={() => setCurrentPage('register')} onNavigateToForgotPassword={() => setCurrentPage('forgotPassword')} isEditMode={false} uiTexts={uiTexts} onUpdateUiText={() => {}} />;
        break;
      case 'register':
        pageComponent = <RegisterPage onRegister={handleRegister} onNavigateToLogin={() => setCurrentPage('login')} isEditMode={false} uiTexts={uiTexts} onUpdateUiText={() => {}} />;
        break;
      case 'dashboard':
        if (userData)
          pageComponent = (
            <Dashboard
              userData={userData} onLogout={handleLogout} onUpdateUserData={handleUpdateUserData}
              recipes={recipes} exercises={exercises} professionals={professionals}
              onUpdateRecipe={handleUpdateRecipe} onUpdateExercise={handleUpdateExercise}
              onSendNotification={handleSendNotification} onAddRecipe={handleAddRecipe}
              onDeleteRecipe={handleDeleteRecipe} onAddExercise={handleAddExercise}
              onDeleteExercise={handleDeleteExercise} isEditMode={false} onToggleEditMode={() => {}}
              uiTexts={uiTexts} onUpdateUiText={() => {}} checkinItems={checkinItems}
              onUpdateCheckinItem={() => {}} posts={posts} onCreatePost={handleCreatePost}
              onDeletePost={(id) => setPosts(prev => prev.filter(p => p.id !== id))}
              onViewProfile={(id) => { const u = users.find(x => x.id === id); if(u) setViewingProfile(u); setCurrentPage('profileView'); }}
              onLikePost={handleLikePost} onAddComment={handleAddComment}
              onSharePost={(p) => handleCreatePost({ content: `Reparando: ${p.content}`, imageUrl: p.imageUrl })}
              allUsers={users} notifications={[]}
              onFollowToggle={(id) => handleUpdateUserData({ followingIds: [...userData.followingIds, id] })}
              onNavigateToChat={(u) => { setChatContact(u); setCurrentPage('chatView'); }}
              events={events} onJoinEvent={handleJoinEvent} onCreateEvent={handleCreateEvent}
              onRefresh={() => fetchData(userData.id)} onViewImage={handleViewImage}
              onUpdatePost={handleUpdatePost} onSaveActivity={handleSaveActivity}
              onGiveFlame={handleGiveFlame} onCreateCompetition={handleCreateCompetition}
              onUpdateOtherUser={handleUpdateOtherUser}
            />
          );
        break;
      case 'profileView':
        if (viewingProfile && userData)
          pageComponent = <ProfileViewPage profile={viewingProfile} currentUser={userData} posts={posts.filter((p) => p.userId === viewingProfile.id)} onBack={() => setCurrentPage('dashboard')} onSendMessage={() => { setChatContact(viewingProfile); setCurrentPage('chatView'); }} onFollowToggle={() => {}} onBlockToggle={() => {}} onViewImage={handleViewImage} onLikePost={handleLikePost} onSharePost={() => {}} onDeletePost={() => {}} onEditPost={handleUpdatePost} onGiveFlame={handleGiveFlame} onAddComment={handleAddComment} />;
        break;
      case 'chatView':
        if (chatContact && userData)
          pageComponent = <ChatViewPage contact={chatContact} messages={directMessages.filter((m) => (m.senderId === userData.id && m.receiverId === chatContact.id) || (m.senderId === chatContact.id && m.receiverId === userData.id))} currentUserId={userData.id} onBack={() => setCurrentPage('dashboard')} onSendMessage={() => {}} onSendAudioMessage={() => {}} />;
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

  return (
    <>
      <NotificationBanner notification={globalNotification} onDismiss={handleDismissNotification} />
      {renderCurrentPage()}
      <AnimatePresence>{viewingImage && <ImageViewerModal imageUrl={viewingImage} onClose={handleCloseImageViewer} />}</AnimatePresence>
    </>
  );
};

export default App;
