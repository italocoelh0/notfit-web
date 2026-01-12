
// types.ts

export type Page =
  | 'login'
  | 'register'
  | 'forgotPassword'
  | 'updatePassword'
  | 'onboarding'
  | 'recipeSelection'
  | 'exerciseSelection'
  | 'dashboard'
  | 'profileView'
  | 'chatView'
  | 'recording'
  | 'checkout';

export type UserRole = 'user' | 'premium' | 'elite' | 'admin';

export interface Professional {
  id: string;
  name: string;
  avatarUrl: string;
  specialty: 'Nutricionista' | 'Personal Trainer';
  bio: string;
  services: string[];
  monthlyPrice: number; // in Flames
  icon: string;
  coverImageUrl: string;
  portfolioImages: string[];
  testimonials: { quote: string; clientName: string }[];
}

export interface ConsultancySubscription {
  professionalId: string;
  startDate: string; // ISO string
  status: 'pending' | 'active';
}

export type DashboardSection =
  | 'home'
  | 'feed'
  | 'events'
  | 'rotina'
  | 'alimentacao'
  | 'treinos'
  | 'explore'
  | 'search'
  | 'profile'
  | 'editProfile'
  | 'adminPanel'
  | 'notifications'
  | 'flamesStore'
  | 'activityTracker'
  | 'consultancy'
  | 'producerPanel'
  | 'messages'
  | 'custom_routine'
  | 'archived'
  | 'support';

export type MuscleGroup =
  | 'Peito'
  | 'Costas'
  | 'Pernas'
  | 'Ombros'
  | 'Bíceps'
  | 'Tríceps'
  | 'Abdômen'
  | 'Cardio'
  | 'Antebraço';

export type ExerciseCategory =
  | 'Musculação'
  | 'Aeróbico'
  | 'Funcional'
  | 'Alongamento'
  | 'Em casa'
  | 'Mobilidade'
  | 'Elástico'
  | 'MAT Pilates'
  | 'Laboral';

export type ExerciseLevel = 'Iniciante' | 'Intermediário' | 'Avançado';

export interface Recipe {
  id: number;
  nome: string;
  tipo: 'salgada' | 'doce';
  icon: string;
  categoria: string;
  ingredientes: string[];
  modoPreparo: string[];
  beneficio: string;
  isElite?: boolean; // Conteúdo Elite
}

export interface Exercise {
  id: number;
  nome: string;
  videoId: string;
  descricao: string;
  nivel: ExerciseLevel;
  duracao: string;
  calorias: string;
  grupoMuscular: MuscleGroup;
  categoria: ExerciseCategory;
  isElite?: boolean; // Conteúdo Elite
}

export interface OnboardingData {
  username: string;
  age?: number;
  weight?: number;
  height?: number;
  goals?: string[];
}

export type RoutineType = 'none' | 'manual' | 'ai';

export interface DailyRoutine {
  day: number;
  breakfast: Recipe | null;
  lunch: Recipe | null;
  dinner: Recipe | null;
  snack: Recipe | null;
  exercises: Exercise[];
}

export interface UserRoutine {
  id: string; 
  title: string;
  type: RoutineType;
  startDate: string;
  duration: number;
  dailyRoutines: DailyRoutine[];
  targetWeight?: number;
  currentIMC?: number;
  targetIMC?: number;
}

export interface ActivitySplit {
  km: number;
  pace: number; // seconds per km
  elevation: number;
}

export interface RecordedActivity {
  id: string;
  title?: string;
  description?: string;
  sport: Sport;
  date: string; // ISO string
  distance: number; // in km
  time: number; // in seconds
  pace: number; // in seconds per km
  elevationGain?: number; // in meters
  avgHeartRate?: number; 
  maxHeartRate?: number; 
  mapImageUrl?: string; 
  effort?: number; // 1-10
  splits?: ActivitySplit[];
  calories?: number;
  location?: {
    city: string;
    state: string;
  };
  mediaFiles?: string[];
  visibility?: 'todos' | 'seguidores' | 'apenas_eu';
}

export interface Badge {
  id: string;
  name: string;
  type: 'badge' | 'frame';
  imageUrl: string;
  price: number;
}

export interface ScoringRule {
    id: string;
    label: string;
    icon: string;
}

export interface LeaderboardEntry {
    userId: string;
    name: string;
    avatar: string;
    score: number;
}

export interface Competition {
    id: string;
    creatorId: string;
    name: string;
    description: string;
    banner: string | null;
    startDate: string;
    endDate: string;
    duration: number;
    scoringRule: ScoringRule;
    privacy: 'open' | 'restricted';
    participantsCount: number;
    currentUserScore?: number;
    leaderboard: LeaderboardEntry[];
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  birthDate: string;
  userAvatar: string;
  username: string;
  age: number;
  weight: number;
  height: number;
  goals: string[];
  selectedRecipes: Recipe[];
  selectedExercises: Exercise[];
  role: UserRole; // Adicionado role
  isAdmin?: boolean;
  isProfessional?: boolean;
  routine?: UserRoutine;
  savedWorkouts?: UserRoutine[];
  savedDiets?: UserRoutine[]; 
  bio?: string;
  activityType?: string;
  isProfilePublic?: boolean;
  followerIds: string[];
  followingIds: string[];
  blockedUserIds: string[];
  flameBalance: number;
  isVerified: boolean;
  consultancy?: ConsultancySubscription;
  activities?: RecordedActivity[];
  competitions?: Competition[]; 
  ownedBadgeIds?: string[];
  equippedBadgeId?: string | null;
  skipFlameConfirmation?: boolean;
}

export interface GeneratedPlan {
  motivation: string;
  mealPlan: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  workout: { name: string; duration: string }[];
}

export interface Comment {
  id: number;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

export interface Post {
  id: number;
  userId: string;
  userName: string;
  userAvatar: string;
  username: string;
  timestamp: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  locationName?: string;
  location?: { lat: number; lon: number };
  likedByUserIds: string[];
  flamedByUserIds: string[];
  comments: Comment[];
  originalPostId?: number; 
  isPriority?: boolean;
  authorIsVerified?: boolean;
}

export interface Notification {
  id: number;
  message: string;
}

export interface AppNotification {
  id: number;
  type: 'new_follower';
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  timestamp: string;
  read: boolean;
}

export interface CheckinItemData {
  key: string;
  icon: string;
  label: string;
}

export interface UITexts {
  login: { [key: string]: string };
  register: { [key: string]: string };
  onboarding: { [key: string]: string };
  recipeSelection: { [key: string]: string };
  exerciseSelection: { [key: string]: string };
  dashboard: { [key: string]: string };
  home: { [key: string]: string };
  aiCoach: { [key: string]: string };
  alimentacao: { [key: string]: string };
  treinos: { [key: string]: string };

  rotina?: {
    title: string;
    subtitle: string;
    createRoutine: string;
    generateWithAI: string;
    resetRoutine: string;
    activeRoutineTitle: string;
  };

  profile: { [key: string]: string };
  socialFeed: { [key: string]: string };
  adminPanel: { [key: string]: string };
}

export interface Sport {
  key: string;
  name: string;
  icon: string;
}

export interface MusicTrack {
  id: string;
  name: string;
  artist: string;
  albumArt: string;
}

export interface EventUpdate {
  id: number;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  timestamp: string;
  content: string;
}

export type EventType = 'Trilha' | 'Corrida' | 'Ciclismo' | 'Outro';

export interface EventData {
  id: number;
  creatorId: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string; // ISO string
  time: string; // "HH:mm"
  location: {
    state: string;
    city: string;
  };
  type: EventType;
  participantIds: string[];
  updates: EventUpdate[];
  requiresApproval: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  goals: string[];
  age: number;
  weight: number;
  lastActivity: string;
}

export interface DirectMessage {
  id: number;
  senderId: string;
  receiverId: string;
  text?: string;
  audioUrl?: string;
  timestamp: string;
  read: boolean;
}

export interface ChatConversation {
  id: number;
  otherUser: UserProfile;
  lastMessage: DirectMessage;
  unreadCount: number;
}

export interface EventComment {
  id: number;
  event_id: number;
  user_id: string;
  text: string;
  created_at: string;
  profile: {
    name: string;
    user_avatar: string;
  };
}
