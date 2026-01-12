// services/api.ts - Usando Supabase diretamente

import { supabase } from '../lib/supabaseClient';
import { UserData, Post, EventData, EventComment, DirectMessage } from '../types';
import { RECEITAS_DATABASE, EXERCICIOS_DATABASE, PROFESSIONALS_DATABASE } from '../constants';

// Mapeia dados do Supabase para o formato do app
const mapProfile = (profile: any): UserData => ({
  id: profile.id,
  email: profile.email,
  name: profile.name || '',
  birthDate: profile.birth_date || '',
  userAvatar: profile.avatar_url || '👤',
  username: profile.username || '',
  age: profile.age || 0,
  weight: profile.weight || 0,
  height: profile.height || 0,
  goals: profile.goals || [],
  selectedRecipes: profile.selected_recipes || [],
  selectedExercises: profile.selected_exercises || [],
  followerIds: profile.follower_ids || [],
  followingIds: profile.following_ids || [],
  blockedUserIds: profile.blocked_user_ids || [],
  flameBalance: profile.flame_balance || 0,
  isVerified: profile.is_verified || false,
  isAdmin: profile.is_admin || false,
  isProfessional: profile.is_professional || false,
  isProfilePublic: profile.is_profile_public !== false,
  bio: profile.bio,
  activityType: profile.activity_type,
  routine: profile.routine,
  consultancy: profile.consultancy,
  activities: profile.activities,
  competitions: profile.competitions,
  ownedBadgeIds: profile.owned_badge_ids,
  equippedBadgeId: profile.equipped_badge_id,
  skipFlameConfirmation: profile.skip_flame_confirmation,
});

const mapPost = (post: any): Post => ({
  id: post.id,
  userId: post.user_id,
  userName: post.profiles?.name || 'Unknown',
  userAvatar: post.profiles?.avatar_url || '👤',
  username: post.profiles?.username || '',
  timestamp: new Date(post.created_at).toISOString(),
  content: post.content,
  imageUrl: post.image_url,
  videoUrl: post.video_url,
  likedByUserIds: post.liked_by_user_ids || [],
  flamedByUserIds: post.flamed_by_user_ids || [],
  comments: post.comments || [],
  isPriority: post.is_priority || false,
  authorIsVerified: post.profiles?.is_verified || false,
});

const mapEvent = (event: any): EventData => ({
  id: event.id,
  creatorId: event.creator_id,
  title: event.title,
  description: event.description,
  imageUrl: event.image_url,
  date: event.date,
  time: event.time,
  location: { state: event.state, city: event.city },
  type: event.type,
  participantIds: event.participant_ids || [],
  updates: event.updates || [],
  requiresApproval: event.requires_approval || false,
});

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user!.id)
        .single();

      if (profileError) throw new Error(profileError.message);

      return {
        user: mapProfile({ ...profile, email: data.user!.email }),
        token: data.session!.access_token,
      };
    },

    register: async (data: { name: string; email: string; birthDate: string; password: string; username: string }) => {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            username: data.username,
            birth_date: data.birthDate,
          },
        },
      });

      if (error) throw new Error(error.message);

      // Criar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user!.id,
          name: data.name,
          username: data.username,
          birth_date: data.birthDate,
          email: data.email,
        });

      if (profileError) throw new Error(profileError.message);

      return { user: authData.user, token: authData.session!.access_token };
    },

    logout: async () => {
      await supabase.auth.signOut();
    },

    getCurrentUser: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return profile ? mapProfile({ ...profile, email: user.email }) : null;
    },
  },

  users: {
    get: async (id: string) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw new Error(error.message);
      return mapProfile(data);
    },

    update: async (id: string, updates: Partial<UserData>) => {
      const dbUpdates: any = {};

      // Mapear campos do app para o banco
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.userAvatar !== undefined) dbUpdates.avatar_url = updates.userAvatar;
      if (updates.username !== undefined) dbUpdates.username = updates.username;
      if (updates.age !== undefined) dbUpdates.age = updates.age;
      if (updates.weight !== undefined) dbUpdates.weight = updates.weight;
      if (updates.height !== undefined) dbUpdates.height = updates.height;
      if (updates.goals !== undefined) dbUpdates.goals = updates.goals;
      if (updates.selectedRecipes !== undefined) dbUpdates.selected_recipes = updates.selectedRecipes;
      if (updates.selectedExercises !== undefined) dbUpdates.selected_exercises = updates.selectedExercises;
      if (updates.flameBalance !== undefined) dbUpdates.flame_balance = updates.flameBalance;
      if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
      if (updates.isProfilePublic !== undefined) dbUpdates.is_profile_public = updates.isProfilePublic;
      if (updates.routine !== undefined) dbUpdates.routine = updates.routine;
      if (updates.activities !== undefined) dbUpdates.activities = updates.activities;
      if (updates.consultancy !== undefined) dbUpdates.consultancy = updates.consultancy;
      if (updates.followerIds !== undefined) dbUpdates.follower_ids = updates.followerIds;
      if (updates.followingIds !== undefined) dbUpdates.following_ids = updates.followingIds;
      if (updates.skipFlameConfirmation !== undefined) dbUpdates.skip_flame_confirmation = updates.skipFlameConfirmation;

      const { data, error } = await supabase
        .from('profiles')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return mapProfile(data);
    },

    checkUsername: async (username: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      return !!data;
    },

    getAll: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw new Error(error.message);
      return data.map(mapProfile);
    },
  },

  posts: {
    create: async (postData: any) => {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: postData.userId,
          content: postData.content,
          image_url: postData.imageUrl,
          video_url: postData.videoUrl,
          is_priority: postData.isPriority || false,
        })
        .select('*, profiles(*)')
        .single();

      if (error) throw new Error(error.message);
      return mapPost(data);
    },

    list: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data.map(mapPost);
    },

    like: async (postId: number, userId: string) => {
      const { data: post } = await supabase
        .from('posts')
        .select('liked_by_user_ids')
        .eq('id', postId)
        .single();

      if (!post) throw new Error('Post not found');

      const likedByUserIds = post.liked_by_user_ids || [];
      const newLikes = likedByUserIds.includes(userId)
        ? likedByUserIds.filter((id: string) => id !== userId)
        : [...likedByUserIds, userId];

      const { data, error } = await supabase
        .from('posts')
        .update({ liked_by_user_ids: newLikes })
        .eq('id', postId)
        .select('*, profiles(*)')
        .single();

      if (error) throw new Error(error.message);
      return mapPost(data);
    },

    delete: async (postId: number) => {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw new Error(error.message);
      return true;
    },

    update: async (postId: number, content: string) => {
      const { data, error } = await supabase
        .from('posts')
        .update({ content })
        .eq('id', postId)
        .select('*, profiles(*)')
        .single();

      if (error) throw new Error(error.message);
      return mapPost(data);
    },

    giveFlame: async (postId: number, giverId: string, receiverId: string) => {
      // Buscar dados atuais
      const { data: giver } = await supabase
        .from('profiles')
        .select('flame_balance')
        .eq('id', giverId)
        .single();

      const { data: post } = await supabase
        .from('posts')
        .select('flamed_by_user_ids')
        .eq('id', postId)
        .single();

      if (!giver || giver.flame_balance < 1) {
        throw new Error('Saldo insuficiente');
      }

      const flamedByUserIds = post?.flamed_by_user_ids || [];
      if (flamedByUserIds.includes(giverId)) {
        throw new Error('Você já doou um flame para este post');
      }

      // Atualizar em paralelo
      await Promise.all([
        // Diminuir flame do doador
        supabase.from('profiles').update({ flame_balance: giver.flame_balance - 1 }).eq('id', giverId),
        // Aumentar flame do receptor
        supabase.rpc('increment_flame_balance', { user_id: receiverId, amount: 1 }),
        // Atualizar post
        supabase.from('posts').update({ flamed_by_user_ids: [...flamedByUserIds, giverId] }).eq('id', postId),
      ]);

      return { success: true, newBalance: giver.flame_balance - 1 };
    },

    comment: async (postId: number, userId: string, text: string) => {
      const { data: user } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', userId)
        .single();

      const { data: post } = await supabase
        .from('posts')
        .select('comments')
        .eq('id', postId)
        .single();

      const comments = post?.comments || [];
      comments.push({
        id: Date.now(),
        userId,
        userName: user?.name || 'Unknown',
        userAvatar: user?.avatar_url || '👤',
        text,
        timestamp: new Date().toISOString(),
      });

      await supabase.from('posts').update({ comments }).eq('id', postId);
      return true;
    },
  },

  events: {
    list: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw new Error(error.message);
      return data.map(mapEvent);
    },

    create: async (eventData: any) => {
      const { data, error } = await supabase
        .from('events')
        .insert({
          creator_id: eventData.creatorId,
          title: eventData.title,
          description: eventData.description,
          image_url: eventData.imageUrl,
          date: eventData.date,
          time: eventData.time,
          state: eventData.location.state,
          city: eventData.location.city,
          type: eventData.type,
          participant_ids: [eventData.creatorId],
          requires_approval: eventData.requiresApproval || false,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return mapEvent(data);
    },

    join: async (eventId: number, userId: string) => {
      const { data: event } = await supabase
        .from('events')
        .select('participant_ids')
        .eq('id', eventId)
        .single();

      if (!event) throw new Error('Event not found');

      const participantIds = event.participant_ids || [];
      const newParticipants = participantIds.includes(userId)
        ? participantIds.filter((id: string) => id !== userId)
        : [...participantIds, userId];

      await supabase
        .from('events')
        .update({ participant_ids: newParticipants })
        .eq('id', eventId);

      return true;
    },

    getComments: async (eventId: number): Promise<EventComment[]> => {
      const { data, error } = await supabase
        .from('event_comments')
        .select('*, profile:profiles(*)')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (error) throw new Error(error.message);
      return data || [];
    },

    addComment: async (commentData: any): Promise<EventComment> => {
      const { data, error } = await supabase
        .from('event_comments')
        .insert({
          event_id: commentData.event_id,
          user_id: commentData.user_id,
          text: commentData.text,
        })
        .select('*, profile:profiles(*)')
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
  },

  messages: {
    list: async (userId: string) => {
      const { data, error } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: true });

      if (error) throw new Error(error.message);

      return data.map((msg: any) => ({
        id: msg.id,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        text: msg.text,
        audioUrl: msg.audio_url,
        timestamp: msg.created_at,
        read: msg.read,
      }));
    },

    send: async (messageData: any) => {
      const { data, error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: messageData.senderId,
          receiver_id: messageData.receiverId,
          text: messageData.text,
          audio_url: messageData.audioUrl,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      return {
        id: data.id,
        senderId: data.sender_id,
        receiverId: data.receiver_id,
        text: data.text,
        audioUrl: data.audio_url,
        timestamp: data.created_at,
        read: false,
      };
    },
  },

  music: {
    search: async (query: string) => {
      // TODO: Implementar busca de música
      return [];
    },
  },

  storage: {
    uploadAvatar: async (userId: string, file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (error) throw new Error(error.message);

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return publicUrl;
    },

    uploadPostImage: async (userId: string, file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('posts')
        .upload(fileName, file);

      if (error) throw new Error(error.message);

      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(fileName);

      return publicUrl;
    },
  },

  data: {
    getRecipes: async () => RECEITAS_DATABASE,
    getExercises: async () => EXERCICIOS_DATABASE,
    getProfessionals: async () => PROFESSIONALS_DATABASE,
  },
};
