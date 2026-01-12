
// pages/Dashboard.tsx
import React, { useState, useMemo } from 'react';
import {
  UserData,
  DashboardSection,
  Recipe,
  Exercise,
  UITexts,
  CheckinItemData,
  Post,
  AppNotification,
  EventData,
  Professional,
  RecordedActivity,
  DirectMessage,
  ChatConversation,
  Competition
} from '../types';
import { AnimatePresence, motion } from 'framer-motion';

import HomePage from './HomePage';
import SocialFeedPage from './SocialFeedPage';
import StatsHubPage from '../components/StatsHubPage';
import EditProfilePage from '../components/EditProfilePage';
import AdminPanel from '../components/AdminPanel';
import NotificationsPage from '../components/NotificationsPage';
import AlimentacaoPage from '../components/AlimentacaoPage';
import TreinosPage from '../components/TreinosPage';
import { SocialPage } from '../components/EventsPage';
import RoutinePage from '../components/RoutinePage';
import ExplorePage from '../components/ExplorePage';
import SearchPage from '../components/SearchPage';
import FlamesStorePage from '../components/FlamesStorePage';
import ActivityTrackerPage from '../components/ActivityTrackerPage';
import ConsultancyPage from './ConsultancyPage';
import SubscriptionPage from '../components/SubscriptionPage';
import SettingsMenu from '../components/SettingsMenu';
import MessagesPage from '../components/MessagesPage';
import ProducerPanel from '../components/ProducerPanel';
import StudentCustomRoutinePage from '../components/StudentCustomRoutinePage';

interface DashboardProps {
  userData: UserData;
  onLogout: () => void;
  onUpdateUserData: (updates: Partial<UserData>) => Promise<boolean>;
  recipes: Recipe[];
  exercises: Exercise[];
  professionals: Professional[];
  onUpdateRecipe: (updatedRecipe: Recipe) => void;
  onUpdateExercise: (updatedExercise: Exercise) => void;
  onSendNotification: (message: string) => void;
  onAddRecipe: (newRecipe: Omit<Recipe, 'id'>) => void;
  onDeleteRecipe: (recipeId: number) => void;
  onAddExercise: (newExercise: Omit<Exercise, 'id'>) => void;
  onDeleteExercise: (exerciseId: number) => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  uiTexts: UITexts;
  onUpdateUiText: (page: keyof UITexts, key: string, value: string) => void;
  checkinItems: CheckinItemData[];
  onUpdateCheckinItem: (index: number, updatedItem: CheckinItemData) => void;
  notifications: AppNotification[];
  onNavigateToChat: (user: UserData) => void;
  posts: Post[];
  onCreatePost: (post: Omit<Post, 'id' | 'likedByUserIds' | 'comments' | 'timestamp' | 'userName' | 'userAvatar' | 'username'>, isPriority?: boolean) => void;
  onDeletePost: (postId: number) => void;
  onUpdatePost: (postId: number, newContent: string) => void;
  onViewProfile: (userId: string) => void;
  onLikePost: (postId: number) => void;
  onAddComment: (postId: number, text: string) => void;
  onSharePost: (post: Post) => void;
  onFollowToggle: (targetUserId: string) => void;
  allUsers: UserData[];
  events: EventData[];
  onJoinEvent: (eventId: number) => void;
  onCreateEvent: (eventData: Omit<EventData, 'id' | 'creatorId' | 'participantIds' | 'updates'>) => void;
  onRefresh: () => Promise<void>;
  onViewImage: (url: string) => void;
  onSaveActivity: (activityData: Omit<RecordedActivity, 'id' | 'date'>) => void;
  onGiveFlame: (postId: number, authorId: string, updatePreference: boolean) => void;
  directMessages?: DirectMessage[];
  onCreateCompetition?: (compData: Omit<Competition, 'id' | 'currentUserScore' | 'participantsCount' | 'leaderboard'>) => void;
  onUpdateOtherUser?: (userId: string, updates: Partial<UserData>) => void;
}

interface NavItemProps {
  iconClass: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ iconClass, label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 transition-colors w-16 ${
      isActive ? 'text-primary' : 'text-on-surface-secondary hover:text-on-surface'
    }`}
  >
    <i className={`${iconClass} text-xl`}></i>
    <span className="text-xs font-medium">{label}</span>
  </button>
);

const Dashboard: React.FC<DashboardProps> = props => {
  const {
    userData = { id: '', followerIds: [], followingIds: [], goals: [] } as any,
    posts = [],
    allUsers = [],
    onLogout,
    onUpdateUserData,
    onCreatePost,
    onDeletePost,
    onUpdatePost,
    onViewProfile,
    onLikePost,
    onAddComment,
    onSharePost,
    recipes = [],
    exercises = [],
    professionals = [],
    onUpdateRecipe,
    onUpdateExercise,
    onSendNotification,
    onAddRecipe,
    onDeleteRecipe,
    onAddExercise,
    onDeleteExercise,
    isEditMode,
    onToggleEditMode,
    uiTexts,
    onUpdateUiText,
    checkinItems = [],
    onUpdateCheckinItem,
    notifications = [],
    onFollowToggle,
    events = [],
    onJoinEvent,
    onCreateEvent,
    onRefresh,
    onViewImage,
    onSaveActivity,
    onGiveFlame,
    onNavigateToChat,
    directMessages = [],
    onCreateCompetition,
    onUpdateOtherUser = () => {}
  } = props;

  const [activeSection, setActiveSection] = useState<DashboardSection>('feed');
  const [isActivityTrackerOpen, setIsActivityTrackerOpen] = useState(false);
  const [isSubscriptionWallPassed, setIsSubscriptionWallPassed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const editProps = { isEditMode, uiTexts, onUpdateUiText };

  const conversations: ChatConversation[] = useMemo(() => {
      const convos: Record<string, ChatConversation> = {};
      
      (directMessages || []).forEach(msg => {
          const otherId = msg.senderId === userData.id ? msg.receiverId : msg.senderId;
          const otherUser = allUsers.find(u => u.id === otherId);
          
          if (otherUser) {
              if (!convos[otherId] || new Date(msg.timestamp) > new Date(convos[otherId].lastMessage.timestamp)) {
                  convos[otherId] = {
                      id: Date.now(),
                      otherUser: {
                          id: otherUser.id,
                          name: otherUser.name,
                          email: otherUser.email,
                          avatar: otherUser.userAvatar || '👤',
                          goals: otherUser.goals || [],
                          age: otherUser.age || 0,
                          weight: otherUser.weight || 0,
                          lastActivity: ''
                      },
                      lastMessage: msg,
                      unreadCount: !msg.read && msg.receiverId === userData.id ? 1 : 0
                  };
              }
          }
      });
      
      return Object.values(convos).sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());
  }, [directMessages, userData.id, allUsers]);


  const renderSection = () => {
    switch (activeSection) {
      case 'home':
         return <HomePage userData={userData} checkinItems={checkinItems} onUpdateCheckinItem={onUpdateCheckinItem} {...editProps} onUpdateUiText={(key, value) => onUpdateUiText('home', key, value)} />;
      case 'feed':
        return <SocialFeedPage {...{ userData, posts, onCreatePost, onDeletePost, onUpdatePost, onViewProfile, onLikePost, onSharePost, isEditMode, uiTexts, onUpdateUiText, onRefresh, onViewImage, onSendNotification, onGiveFlame, onAddComment }} />;
      case 'search':
        return <SearchPage allUsers={allUsers} currentUser={userData} onViewProfile={onViewProfile} />;
      case 'notifications':
        return <NotificationsPage notifications={notifications.filter(n => n.fromUserId !== userData.id)} currentUser={userData} onFollowToggle={onFollowToggle} onViewProfile={onViewProfile} />;
      case 'messages':
        return <MessagesPage conversations={conversations} onNavigateToChat={onNavigateToChat} />;
      case 'events': 
        return <SocialPage events={events} currentUser={userData} onJoinEvent={onJoinEvent} onCreateEvent={onCreateEvent} onSendNotification={onSendNotification} setActiveSection={setActiveSection} onCreateCompetition={onCreateCompetition} allUsers={allUsers} />;
      case 'rotina':
        if (!isSubscriptionWallPassed) return <SubscriptionPage onSkip={() => setIsSubscriptionWallPassed(true)} />;
        return <RoutinePage {...{ userData, onUpdateUserData, isEditMode, uiTexts, onUpdateUiText, setActiveSection, recipes, exercises, onSendNotification, onUpdateExercise, onAddExercise, onDeleteExercise, onUpdateRecipe, onAddRecipe, onDeleteRecipe }} />;
      case 'consultancy':
        return <ConsultancyPage userData={userData} professionals={professionals} onUpdateUserData={onUpdateUserData} onSendNotification={onSendNotification} setActiveSection={setActiveSection} />;
      case 'explore':
        return <ExplorePage onNavigate={setActiveSection} />;
      case 'alimentacao':
        return <AlimentacaoPage recipes={recipes} userData={userData} onUpdateRecipe={onUpdateRecipe} onAddRecipe={onAddRecipe} onDeleteRecipe={onDeleteRecipe} {...editProps} onUpdateUserData={onUpdateUserData} onSendNotification={onSendNotification} setActiveSection={setActiveSection} />;
      case 'treinos':
        return <TreinosPage exercises={exercises} userData={userData} onUpdateExercise={onUpdateExercise} onAddExercise={onAddExercise} onDeleteExercise={onDeleteExercise} onUpdateUserData={onUpdateUserData} onSendNotification={onSendNotification} setActiveSection={setActiveSection} {...editProps} />;
      case 'profile':
        return <StatsHubPage userData={userData} onViewImage={onViewImage} posts={posts} onNavigateToEdit={() => setActiveSection('editProfile')} onUpdateUserData={onUpdateUserData} onLogout={onLogout} onNavigate={setActiveSection} />;
      case 'editProfile':
        return <EditProfilePage userData={userData} onUpdateUserData={onUpdateUserData} onLogout={onLogout} onBack={() => setActiveSection('profile')} isEditMode={isEditMode} uiTexts={uiTexts} onUpdateUiText={onUpdateUiText} />;
      case 'adminPanel':
        return <AdminPanel onSendNotification={onSendNotification} isEditMode={isEditMode} onToggleEditMode={onToggleEditMode} {...editProps} />;
      case 'flamesStore':
        return <FlamesStorePage userData={userData} onUpdateUserData={onUpdateUserData} onSendNotification={onSendNotification} />;
      case 'producerPanel':
        return <ProducerPanel currentUser={userData} allUsers={allUsers} onNavigateToChat={onNavigateToChat} onUpdateOtherUser={onUpdateOtherUser} />;
      case 'custom_routine':
        return <StudentCustomRoutinePage userData={userData} onUpdateUserData={onUpdateUserData} isEditMode={isEditMode} uiTexts={uiTexts} onUpdateUiText={onUpdateUiText} setActiveSection={setActiveSection} recipes={recipes} exercises={exercises} onSendNotification={onSendNotification} onUpdateRecipe={onUpdateRecipe} onAddRecipe={onAddRecipe} onDeleteRecipe={onDeleteRecipe} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 bg-surface-100 rounded-lg">
            <i className="fa-solid fa-person-digging text-5xl text-on-surface-secondary mb-4"></i>
            <h2 className="text-2xl font-bold">Em Construção</h2>
            <p className="text-on-surface-secondary">Esta seção estará disponível em breve!</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-safe">
      <header className="fixed top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/90 to-black/0 backdrop-blur-sm pt-safe">
        <div className="container mx-auto px-4 h-16 grid grid-cols-3 items-center">
          <div className="justify-self-start">
            {activeSection === 'profile' ? (
                <button onClick={() => setActiveSection('feed')} className="w-10 h-10 rounded-full bg-surface-200 border border-white/10 flex items-center justify-center hover:border-primary transition-colors text-white shadow-lg"><i className="fa-solid fa-arrow-left"></i></button>
            ) : (
                <button onClick={() => setIsUserMenuOpen(true)} className="w-10 h-10 rounded-full bg-surface-200 border border-white/10 overflow-hidden flex items-center justify-center hover:border-primary transition-colors shadow-lg">
                   {(userData?.userAvatar || '').startsWith('data:image') || (userData?.userAvatar || '').startsWith('http') ? (
                      <img src={userData.userAvatar} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                      <i className="fa-solid fa-user text-gray-400 text-lg"></i>
                   )}
                </button>
            )}
          </div>

          <div className="justify-self-center">
            <button onClick={() => setIsSubscriptionModalOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-5 py-1.5 rounded-full text-[11px] font-anton uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-orange-500/20 border border-orange-400/30">
                <i className="fa-solid fa-crown text-xs"></i>
                <span>Assinar</span>
            </button>
          </div>

          <div className="justify-self-end flex items-center gap-3">
             <button onClick={() => setActiveSection('flamesStore')} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                <span className="text-lg filter drop-shadow-[0_0_5px_rgba(252,82,0,0.6)]">🔥</span>
            </button>
            <button onClick={() => setActiveSection('messages')} className={`text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/20 transition-colors ${activeSection === 'messages' ? 'text-primary' : 'text-on-surface-secondary hover:text-on-surface'}`}><i className="fa-regular fa-comment-dots"></i></button>
            <button onClick={() => setActiveSection('notifications')} className={`text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/20 transition-colors ${activeSection === 'notifications' ? 'text-primary' : 'text-on-surface-secondary hover:text-on-surface'}`}><i className="fa-solid fa-bell"></i></button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 pt-[calc(4rem+env(safe-area-inset-top))] pb-24">
        {renderSection()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-surface-100/90 backdrop-blur-lg border-t border-surface-200 flex justify-around items-center z-20 pb-safe pt-2">
        <NavItem iconClass="fa-solid fa-users" label="Feed" isActive={activeSection === 'feed'} onClick={() => setActiveSection('feed')} />
        <NavItem iconClass="fa-solid fa-calendar-days" label="Rotina" isActive={['rotina', 'alimentacao', 'treinos', 'consultancy', 'producerPanel', 'custom_routine'].includes(activeSection)} onClick={() => setActiveSection('rotina')} />
        <button onClick={() => setIsActivityTrackerOpen(true)} className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-3xl shadow-[0_0_20px_rgba(252,82,0,0.5)] -mt-8 transform hover:scale-110 transition-transform mb-2" aria-label="Registrar Atividade"><i className="fa-solid fa-fire"></i></button>
        <NavItem iconClass="fa-solid fa-user-group" label="Social" isActive={activeSection === 'events'} onClick={() => setActiveSection('events')} />
        <NavItem iconClass="fa-solid fa-chart-pie" label="Você" isActive={activeSection === 'profile'} onClick={() => setActiveSection('profile')} />
      </nav>
      
      <AnimatePresence>
        {isActivityTrackerOpen && <ActivityTrackerPage userData={userData} onClose={() => setIsActivityTrackerOpen(false)} onSaveActivity={onSaveActivity} />}
        {isSubscriptionModalOpen && <SubscriptionPage onSkip={() => setIsSubscriptionModalOpen(false)} />}
      </AnimatePresence>

      <SettingsMenu isOpen={isUserMenuOpen} onClose={() => setIsUserMenuOpen(false)} userData={userData} onUpdateUserData={onUpdateUserData} onLogout={onLogout} onNavigate={setActiveSection} />
    </div>
  );
};

export default Dashboard;
