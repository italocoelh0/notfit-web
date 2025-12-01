
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

// Lazy Load Pages to reduce initial bundle size
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

  const [exercises] = useState<Exercise[]>(EXERCICIOS_DATABASE);
  const [recipes] = useState<Recipe[]>(RECEITAS_DATABASE);
  const [professionals] = useState<Professional[]>(PROFESSIONALS_DATABASE);
  const [uiTexts] = useState<UITexts>(DEFAULT_UI_TEXTS);
  const [checkinItems] = useState<CheckinItemData[]>(DEFAULT_CHECKIN_ITEMS);
  const [globalNotification, setGlobalNotification] =
    useState<Notification | null>(null);
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

          // Map posts to ensure they have necessary display properties
          const mappedPosts: Post[] = postsData.map((p: any) => ({
            ...p,
            timestamp: new Date(p.timestamp).toLocaleDateString(),
            likedByUserIds: p.likedByUserIds || [],
            flamedByUserIds: p.flamedByUserIds || [], // Ensure this is array
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

        // ATUALIZAÇÃO DE PONTUAÇÃO DAS COMPETIÇÕES
        if (updatedUser.competitions && updatedUser.competitions.length > 0) {
            const updatedCompetitions = updatedUser.competitions.map(comp => {
                const now = new Date();
                const start = new Date(comp.startDate);
                const end = new Date(comp.endDate);

                // Verifica se a competição está ativa
                if (now >= start && now <= end) {
                    let pointsToAdd = 0;
                    
                    // Lógica de pontuação baseada no tipo
                    switch (comp.scoringRule.id) {
                        case 'distance':
                            pointsToAdd = Math.floor(newActivity.distance); // 1 ponto por km
                            break;
                        case 'duration':
                            pointsToAdd = Math.floor(newActivity.time / 60); // 1 ponto por minuto
                            break;
                        case 'calories':
                            pointsToAdd = Math.floor((newActivity.calories || 0) / 100); // 1 ponto a cada 100kcal
                            break;
                        case 'steps': // Simulação para passos baseada em distância
                            pointsToAdd = Math.floor(newActivity.distance * 1250 / 1000); // 1 ponto a cada 1000 passos
                            break;
                        case 'active_days':
                        case 'checkin_count':
                            pointsToAdd = 1; // 1 ponto por atividade/checkin
                            break;
                        default:
                            pointsToAdd = 10; // Hustle points genéricos
                    }

                    const currentScore = comp.currentUserScore || 0;
                    const newScore = currentScore + pointsToAdd;

                    // Atualiza leaderboard local (mock)
                    // Find if user already exists in leaderboard
                    const entryIndex = comp.leaderboard.findIndex(entry => entry.userId === userData.id);
                    let newLeaderboard = [...comp.leaderboard];
                    
                    if (entryIndex > -1) {
                        newLeaderboard[entryIndex] = {
                            ...newLeaderboard[entryIndex],
                            score: newLeaderboard[entryIndex].score + pointsToAdd
                        };
                    } else {
                        newLeaderboard.push({
                            userId: userData.id,
                            name: userData.name,
                            avatar: userData.userAvatar,
                            score: newScore
                        });
                    }
                    
                    // Sort
                    newLeaderboard.sort((a, b) => b.score - a.score);

                    return {
                        ...comp,
                        currentUserScore: newScore,
                        leaderboard: newLeaderboard
                    };
                }
                return comp;
            });
            updatedUser.competitions = updatedCompetitions;
        }

        setUserData(updatedUser);
        api.users.update(userData.id, { 
            activities: updatedActivities,
            competitions: updatedUser.competitions 
        });
        
        handleSendNotification('Atividade salva e pontuação atualizada!');
    }, [userData, handleSendNotification]);

    // Nova função para criar competições
    const handleCreateCompetition = useCallback((compData: Omit<Competition, 'id' | 'currentUserScore' | 'participantsCount' | 'leaderboard'>) => {
        if (!userData) return;

        const newCompetition: Competition = {
            id: `comp_${Date.now()}`,
            ...compData,
            creatorId: userData.id, // Assign Creator ID
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
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
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
                console.error("Auth check failed", e);
                localStorage.removeItem('auth_token');
                setCurrentPage('login');
            }
        } else {
            setCurrentPage('login');
        }
        setLoading(false);
    };
    
    initAuth();
  }, [fetchData]);

  const handleLogin = async (email: string, password: string) => {
    const data = await api.auth.login(email, password);
    localStorage.setItem('auth_token', data.token);
    setUserData(data.user);
    setCurrentPage('dashboard');
  };

  const handleRegister = async (data: {
    name: string;
    email: string;
    birthDate: string;
    password: string;
  }) => {
    const { name, email, birthDate, password } = data;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    let username = `${email.split('@')[0]}_${randomSuffix}`.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (username.length > 30) username = username.substring(0, 30);

    await api.auth.register({
        name, email, birthDate, password, username
    });

    handleSendNotification('Conta criada com sucesso! Faça login para continuar.');
    setCurrentPage('login');
  };

  const handleLogout = async () => {
    await api.auth.logout();
    localStorage.removeItem('auth_token');
    setUserData(null);
    setCurrentPage('login');
  };

  const handleForgotPassword = async (email: string) => {
    handleSendNotification(`Simulação: Link de recuperação enviado para ${email}!`);
  };

  const handleUpdatePassword = async (password: string) => {
    handleSendNotification('Senha atualizada com sucesso! (Simulação)');
    setCurrentPage('login');
  };

  const handleUpdateUserData = async (
    updatedData: Partial<UserData>,
  ): Promise<boolean> => {
    if (!userData) return false;
    
    try {
        const updatedUser = await api.users.update(userData.id, updatedData);
        setUserData(updatedUser);
        handleSendNotification('Perfil atualizado com sucesso!');
        return true;
    } catch (e: any) {
        handleSendNotification(`Erro ao atualizar: ${e.message}`);
        return false;
    }
  };

  // Update OTHER users (mock only - for producer panel)
  const handleUpdateOtherUser = useCallback(async (userId: string, updates: Partial<UserData>) => {
      // In mock mode, we just update the local users array
      setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, ...updates } : u));
      
      // Try API call
      try {
          await api.users.update(userId, updates);
          handleSendNotification('Aluno atualizado com sucesso!');
      } catch (e: any) {
          handleSendNotification('Erro ao atualizar aluno.');
      }
  }, [handleSendNotification]);

  const handleOnboardingSuccess = useCallback(
    async (data: OnboardingData) => {
      if (!userData) return;
      await handleUpdateUserData({ ...userData, ...data });
      handleSendNotification('Bem-vindo! Lembre-se de completar os detalhes do seu perfil mais tarde.');
      setCurrentPage('dashboard');
    },
    [userData, handleUpdateUserData, handleSendNotification],
  );

  const handleRecipeSelectionSuccess = (selected: Recipe[]) => {
    setUserData((prev) =>
      prev ? { ...prev, selectedRecipes: selected } : null,
    );
    setCurrentPage('exerciseSelection');
  };

  const handleExerciseSelectionSuccess = (selected: Exercise[]) => {
    setUserData((prev) =>
      prev ? { ...prev, selectedExercises: selected } : null,
    );
    handleSendNotification('Tudo pronto! Bem-vindo(a) ao seu painel!');
    setCurrentPage('dashboard');
  };

  const handleCreatePost = useCallback(
    async (
      postData: Omit<Post, 'id' | 'likedByUserIds' | 'flamedByUserIds' | 'comments' | 'timestamp' | 'userName' | 'userAvatar' | 'username'>,
      isPriority?: boolean
    ) => {
      if (!userData) return;

      try {
          const fullPostData = {
              ...postData,
              userName: userData.name,
              username: userData.username,
              userAvatar: userData.userAvatar,
              authorIsVerified: userData.isVerified
          };
          
          const newPost = await api.posts.create(fullPostData);
          setPosts((prev) => [newPost, ...prev]);
          handleSendNotification('Publicação criada com sucesso!');
      } catch (e: any) {
          handleSendNotification(`Erro ao criar post: ${e.message}`);
      }
    },
    [userData, handleSendNotification],
  );

  const handleUpdatePost = useCallback(
    async (postId: number, newContent: string) => {
      try {
          await api.posts.update(postId, newContent);
          setPosts((prevPosts) =>
            prevPosts.map((p) =>
              p.id === postId ? { ...p, content: newContent } : p,
            ),
          );
          handleSendNotification('Publicação atualizada com sucesso!');
      } catch (e: any) {
          handleSendNotification(`Erro ao editar: ${e.message}`);
      }
    },
    [handleSendNotification],
  );

  const handleLikePost = useCallback(
    async (postId: number) => {
      if (!userData) return;
      const originalPosts = [...posts];
      const post = originalPosts.find((p) => p.id === postId);
      if (!post) return;
      
      const isLiked = post.likedByUserIds.includes(userData.id);
      const newLikedIds = isLiked
        ? post.likedByUserIds.filter((id) => id !== userData.id)
        : [...post.likedByUserIds, userData.id];

      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, likedByUserIds: newLikedIds } : p,
        ),
      );
      if (!isLiked) handleSendNotification('Post curtido!');

      try {
          await api.posts.like(postId, userData.id);
      } catch (e) {
          setPosts(originalPosts);
          console.error("Like failed", e);
      }
    },
    [userData, posts, handleSendNotification],
  );

  const handleGiveFlame = useCallback(async (postId: number, authorId: string, updatePreference: boolean) => {
      if (!userData) return;
      if (userData.flameBalance <= 0) {
          handleSendNotification("Saldo de Flames insuficiente!");
          return;
      }

      const currentPost = posts.find(p => p.id === postId);
      if (currentPost && currentPost.flamedByUserIds.includes(userData.id)) {
           handleSendNotification("Você já doou um flame para este post!");
           return;
      }

      // Optimistic Update
      const originalUserData = { ...userData };
      const originalPosts = [...posts];

      setUserData(prev => prev ? ({ ...prev, flameBalance: prev.flameBalance - 1 }) : null);
      
      setPosts(prev => prev.map(p => {
          if (p.id !== postId) return p;
          if (p.flamedByUserIds.includes(userData.id)) return p;
          return { ...p, flamedByUserIds: [...p.flamedByUserIds, userData.id] };
      }));

      try {
          await api.posts.giveFlame(postId, userData.id, authorId);
          
          if (updatePreference) {
               api.users.update(userData.id, { skipFlameConfirmation: true });
               setUserData(prev => prev ? ({ ...prev, skipFlameConfirmation: true }) : null);
          }
      } catch (e: any) {
          console.error("Flame transaction failed", e);
          handleSendNotification(e.message || "Erro ao enviar flame.");
          setUserData(originalUserData);
          setPosts(originalPosts);
      }
  }, [userData, posts, handleSendNotification]);

  const handleAddComment = useCallback(async (postId: number, text: string) => {
      if (!userData) return;
      
      const originalPosts = [...posts];
      const tempComment = {
          id: Date.now(),
          userId: userData.id,
          userName: userData.name,
          userAvatar: userData.userAvatar,
          text: text,
          timestamp: new Date().toISOString()
      };

      setPosts(prev => prev.map(p => 
          p.id === postId ? { ...p, comments: [...p.comments, tempComment] } : p
      ));

      try {
          await api.posts.comment(postId, userData.id, text);
      } catch (e) {
          setPosts(originalPosts);
          handleSendNotification("Erro ao enviar comentário.");
      }
  }, [userData, posts, handleSendNotification]);

  const handleFollowToggle = useCallback(
    async (targetUserId: string) => {
      if (!userData || userData.id === targetUserId) return;

      const isFollowing = userData.followingIds.includes(targetUserId);
      const newFollowingIds = isFollowing
        ? userData.followingIds.filter((id) => id !== targetUserId)
        : [...userData.followingIds, targetUserId];

      setUserData(prev => prev ? { ...prev, followingIds: newFollowingIds } : null);
      
      setUsers(prev => prev.map(u => {
          if (u.id === targetUserId) {
              const newFollowers = isFollowing 
                ? u.followerIds.filter(id => id !== userData.id)
                : [...u.followerIds, userData.id];
              return { ...u, followerIds: newFollowers };
          }
          return u;
      }));

      try {
          await api.users.update(userData.id, { followingIds: newFollowingIds });
          
          // In mock mode we also update the target user for consistency
          const targetUser = users.find(u => u.id === targetUserId);
          if (targetUser) { // Check import/const for USE_MOCK_API if needed or just rely on api logic
               const newFollowers = isFollowing 
                ? targetUser.followerIds.filter(id => id !== userData.id)
                : [...targetUser.followerIds, userData.id];
                // Not strictly updating via API call here to avoid complexity but local state is updated
          }
          
          handleSendNotification(isFollowing ? 'Deixou de seguir.' : 'Agora você está seguindo!');
      } catch (e) {
          console.error("Follow failed", e);
      }
    },
    [userData, users, handleSendNotification],
  );

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
          handleSendNotification('Evento criado com sucesso!');
          
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
          console.error("Join event failed", e);
      }
    },
    [userData, events, handleSendNotification],
  );

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!userData || !chatContact) return;
      
      try {
          const newMsg = await api.messages.send({
              senderId: userData.id,
              receiverId: chatContact.id,
              text
          });
          setDirectMessages((prev) => [...prev, newMsg]);
      } catch (e) {
          console.error("Send message failed", e);
      }
    },
    [userData, chatContact],
  );

  const handleSendAudioMessage = useCallback(
    async (audioBlob: Blob) => {
      if (!userData || !chatContact) return;
      const mockUrl = URL.createObjectURL(audioBlob);
      
      try {
          const newMsg = await api.messages.send({
              senderId: userData.id,
              receiverId: chatContact.id,
              audioUrl: mockUrl
          });
          setDirectMessages((prev) => [...prev, newMsg]);
      } catch (e) {
           console.error("Send audio failed", e);
      }
    },
    [userData, chatContact],
  );

  const handleViewProfile = useCallback(
    (userId: string) => {
      const user = users.find((u) => u.id === userId) || posts.find(p => p.userId === userId);
      if (user) {
        // Normalize user data if coming from post
        const profileData: UserData = 'email' in user ? user : {
             id: user.userId,
             name: user.userName,
             userAvatar: user.userAvatar,
             username: user.username,
             email: '', birthDate: '', age: 0, weight: 0, height: 0, goals: [],
             selectedRecipes: [], selectedExercises: [],
             followerIds: [], followingIds: [], blockedUserIds: [],
             flameBalance: 0, isVerified: user.authorIsVerified || false, isProfilePublic: true
        };

        setViewingProfile(profileData);
        setCurrentPage('profileView');
      }
    },
    [users, posts],
  );

  const handleStartChat = useCallback((contact: UserData) => {
    setChatContact(contact);
    setCurrentPage('chatView');
  }, []);

  const handleDeletePost = useCallback(
    async (postId: number) => {
      const originalPosts = [...posts];
      setPosts((prev) => prev.filter((post) => post.id !== postId));
      try {
          await api.posts.delete(postId);
          handleSendNotification("Post deletado.");
      } catch (e) {
          setPosts(originalPosts);
          console.error("Delete post failed", e);
      }
    },
    [posts, handleSendNotification],
  );

  const handleSharePost = useCallback(
    (postToShare: Post) => {
      if (!userData) return;
      const newPostData = {
        userId: userData.id,
        content: `Compartilhado de ${postToShare.username}: "${postToShare.content}"`,
        imageUrl: postToShare.imageUrl,
        videoUrl: postToShare.videoUrl,
        originalPostId: postToShare.id,
      };
      handleCreatePost(newPostData);
      handleSendNotification('Post compartilhado no seu feed!');
    },
    [userData, handleCreatePost, handleSendNotification],
  );

  const renderCurrentPage = () => {
    if (loading) return <LoadingScreen />;

    let pageComponent;
    switch (currentPage) {
      case 'login':
        pageComponent = (
          <LoginPage
            onLogin={handleLogin}
            onNavigateToRegister={() => setCurrentPage('register')}
            onNavigateToForgotPassword={() =>
              setCurrentPage('forgotPassword')
            }
            isEditMode={false}
            uiTexts={uiTexts}
            onUpdateUiText={() => {}}
          />
        );
        break;
      case 'register':
        pageComponent = (
          <RegisterPage
            onRegister={handleRegister}
            onNavigateToLogin={() => setCurrentPage('login')}
            isEditMode={false}
            uiTexts={uiTexts}
            onUpdateUiText={() => {}}
          />
        );
        break;
      case 'forgotPassword':
        pageComponent = (
          <ForgotPasswordPage
            onForgotPassword={handleForgotPassword}
            onNavigateToLogin={() => setCurrentPage('login')}
          />
        );
        break;
      case 'updatePassword':
        pageComponent = (
          <UpdatePasswordPage onUpdatePassword={handleUpdatePassword} />
        );
        break;
      case 'onboarding':
        pageComponent = (
          <OnboardingPage
            onOnboardingSuccess={handleOnboardingSuccess}
            isEditMode={false}
            uiTexts={uiTexts}
            onUpdateUiText={() => {}}
          />
        );
        break;
      case 'recipeSelection':
        pageComponent = (
          <RecipeSelectionPage
            onRecipeSelectionSuccess={handleRecipeSelectionSuccess}
            recipes={recipes}
            isEditMode={false}
            uiTexts={uiTexts}
            onUpdateUiText={() => {}}
          />
        );
        break;
      case 'exerciseSelection':
        pageComponent = (
          <ExerciseSelectionPage
            onExerciseSelectionSuccess={handleExerciseSelectionSuccess}
            exercises={exercises}
            isEditMode={false}
            uiTexts={uiTexts}
            onUpdateUiText={() => {}}
          />
        );
        break;
      case 'dashboard':
        if (userData)
          pageComponent = (
            <Dashboard
              userData={userData}
              onLogout={handleLogout}
              onUpdateUserData={handleUpdateUserData}
              recipes={recipes}
              exercises={exercises}
              professionals={professionals}
              onUpdateRecipe={() => {}}
              onUpdateExercise={() => {}}
              onSendNotification={handleSendNotification}
              onAddRecipe={() => {}}
              onDeleteRecipe={() => {}}
              onAddExercise={() => {}}
              onDeleteExercise={() => {}}
              isEditMode={false}
              onToggleEditMode={() => {}}
              uiTexts={uiTexts}
              onUpdateUiText={() => {}}
              checkinItems={checkinItems}
              onUpdateCheckinItem={() => {}}
              posts={posts}
              onCreatePost={handleCreatePost}
              onDeletePost={handleDeletePost}
              onViewProfile={handleViewProfile}
              onLikePost={handleLikePost}
              onAddComment={handleAddComment}
              onSharePost={handleSharePost}
              allUsers={users}
              notifications={[]}
              onFollowToggle={handleFollowToggle}
              onNavigateToChat={handleStartChat}
              events={events}
              onJoinEvent={handleJoinEvent}
              onCreateEvent={handleCreateEvent}
              onRefresh={() => userData ? fetchData(userData.id) : Promise.resolve()}
              onViewImage={handleViewImage}
              onUpdatePost={handleUpdatePost}
              onSaveActivity={handleSaveActivity}
              onGiveFlame={handleGiveFlame}
              directMessages={directMessages}
              onCreateCompetition={handleCreateCompetition}
              onUpdateOtherUser={handleUpdateOtherUser}
            />
          );
        break;
      case 'profileView':
        if (viewingProfile && userData)
          pageComponent = (
            <ProfileViewPage
              profile={viewingProfile}
              currentUser={userData}
              posts={posts.filter((p) => p.userId === viewingProfile.id)}
              onBack={() => setCurrentPage('dashboard')}
              onSendMessage={() => handleStartChat(viewingProfile)}
              onFollowToggle={handleFollowToggle}
              onBlockToggle={() => {}}
              onViewImage={handleViewImage}
              onLikePost={handleLikePost}
              onSharePost={handleSharePost}
              onDeletePost={handleDeletePost}
              onEditPost={handleUpdatePost}
              onGiveFlame={handleGiveFlame}
              onAddComment={handleAddComment}
            />
          );
        break;
      case 'chatView':
        if (chatContact && userData)
          pageComponent = (
            <ChatViewPage
              contact={chatContact}
              messages={directMessages.filter(
                (m) =>
                  (m.senderId === userData.id &&
                    m.receiverId === chatContact.id) ||
                  (m.senderId === chatContact.id &&
                    m.receiverId === userData.id),
              )}
              currentUserId={userData.id}
              onBack={() => setCurrentPage('dashboard')}
              onSendMessage={handleSendMessage}
              onSendAudioMessage={handleSendAudioMessage}
            />
          );
        break;
      default:
        pageComponent = (
          <LoginPage
            onLogin={handleLogin}
            onNavigateToRegister={() => setCurrentPage('register')}
            onNavigateToForgotPassword={() =>
              setCurrentPage('forgotPassword')
            }
            isEditMode={false}
            uiTexts={uiTexts}
            onUpdateUiText={() => {}}
          />
        );
        break;
    }
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          variants={pageVariants}
          initial="initial"
          animate="in"
          exit="out"
          transition={pageTransition}
        >
          <Suspense fallback={<LoadingScreen />}>
            {pageComponent}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <>
      <NotificationBanner
        notification={globalNotification}
        onDismiss={handleDismissNotification}
      />
      {renderCurrentPage()}
      <AnimatePresence>
        {viewingImage && (
          <ImageViewerModal
            imageUrl={viewingImage}
            onClose={handleCloseImageViewer}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default App;
