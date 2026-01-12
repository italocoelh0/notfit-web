
import { supabase } from '../lib/supabaseClient';
import { UserData, Post, EventData, MusicTrack, EventComment, DirectMessage } from '../types';
import { EXERCICIOS_DATABASE, RECEITAS_DATABASE, PROFESSIONALS_DATABASE } from '../constants';

// Helper para converter DataURL (Base64) para Blob necessário para o upload
const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};

// Mapeamento de chaves JS para colunas DB
const mapToDb = (data: any) => {
    const mapping: Record<string, string> = {
        userAvatar: 'user_avatar',
        birthDate: 'birth_date',
        isProfessional: 'is_professional',
        activityType: 'activity_type',
        isProfilePublic: 'is_profile_public',
        followerIds: 'follower_ids',
        followingIds: 'following_ids',
        blockedUserIds: 'blocked_user_ids',
        flameBalance: 'flame_balance',
        isVerified: 'is_verified',
        skipFlameConfirmation: 'skip_flame_confirmation',
        equippedBadgeId: 'equipped_badge_id',
        ownedBadgeIds: 'owned_badge_ids',
        savedWorkouts: 'saved_workouts',
        savedDiets: 'saved_diets'
    };

    const dbData: any = {};
    Object.keys(data).forEach(key => {
        const dbKey = mapping[key] || key;
        dbData[dbKey] = data[key];
    });
    return dbData;
};

// Mapeamento de colunas DB para chaves JS
const mapFromDb = (dbData: any): UserData => {
    if (!dbData) return dbData;
    return {
        ...dbData,
        userAvatar: dbData.user_avatar || '👤',
        birthDate: dbData.birth_date,
        isProfessional: dbData.is_professional || false,
        activityType: dbData.activity_type || '',
        isProfilePublic: dbData.is_profile_public !== false, // Default true
        followerIds: dbData.follower_ids || [],
        followingIds: dbData.following_ids || [],
        blockedUserIds: dbData.blocked_user_ids || [],
        flameBalance: dbData.flame_balance || 0,
        isVerified: dbData.is_verified || false,
        skipFlameConfirmation: dbData.skip_flame_confirmation || false,
        equippedBadgeId: dbData.equipped_badge_id || null,
        ownedBadgeIds: dbData.owned_badge_ids || [],
        savedWorkouts: dbData.saved_workouts || [],
        savedDiets: dbData.saved_diets || [],
        activities: dbData.activities || [],
        goals: dbData.goals || [],
        competitions: dbData.competitions || [],
        role: dbData.role || 'user',
        isAdmin: dbData.role === 'admin'
    };
};

export const api = {
    storage: {
        uploadAvatar: async (userId: string, base64Data: string) => {
            if (!base64Data.startsWith('data:image')) return base64Data;
            
            const blob = dataURLtoBlob(base64Data);
            const fileName = `${userId}/${Date.now()}.jpg`;
            
            const { data, error } = await supabase.storage
                .from('avatars')
                .upload(fileName, blob, { upsert: true });
            
            if (error) throw error;
            
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(data.path);
                
            return publicUrl;
        },
        uploadPostImage: async (userId: string, base64Data: string) => {
            if (!base64Data || !base64Data.startsWith('data:image')) return base64Data;
            
            const blob = dataURLtoBlob(base64Data);
            const fileName = `${userId}/${Date.now()}.jpg`;
            
            const { data, error } = await supabase.storage
                .from('posts')
                .upload(fileName, blob);
                
            if (error) throw error;
            
            const { data: { publicUrl } } = supabase.storage
                .from('posts')
                .getPublicUrl(data.path);
                
            return publicUrl;
        }
    },
    auth: {
        login: async (email: string, password?: string) => {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password: password || '' });
            if (error) throw error;
            
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .single();
            
            if (profileError || !profile) {
                 return { user: { id: data.user.id, email: data.user.email, followerIds: [], followingIds: [], goals: [] } as any, token: data.session?.access_token };
            }

            return { user: mapFromDb(profile), token: data.session?.access_token };
        },
        register: async (data: any) => {
            // 1. Criar usuário no Supabase Auth
            const { data: authData, error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        name: data.name,
                        username: data.username
                    }
                }
            });
            if (error) throw error;
            
            if (!authData.user) throw new Error('Erro ao criar usuário');
            
            // 2. Criar perfil na tabela profiles
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: authData.user.id,
                    email: data.email,
                    name: data.name,
                    username: data.username,
                    birth_date: data.birthDate,
                    flame_balance: 0,
                    is_verified: false,
                    is_professional: false,
                    is_profile_public: true,
                    role: 'user'
                });
            
            if (profileError) {
                console.error('Erro ao criar perfil:', profileError);
                throw new Error(profileError.message);
            }
            
            return authData;
        },
        logout: async () => {
            await supabase.auth.signOut();
        },
        getCurrentUser: async () => {
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError || !user) return null;

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            
            return profile ? mapFromDb(profile) : null;
        }
    },
    users: {
        update: async (id: string, updates: Partial<UserData>) => {
            const dbUpdates = mapToDb(updates);
            
            const { data, error } = await supabase
                .from('profiles')
                .update(dbUpdates)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            return mapFromDb(data);
        },
        checkUsername: async (username: string) => {
            const { data } = await supabase
                .from('profiles')
                .select('username')
                .eq('username', username);
            return data && data.length > 0;
        },
        getAll: async () => {
            const { data } = await supabase
                .from('profiles')
                .select('*');
            
            return (data || []).map(u => mapFromDb(u));
        }
    },
    posts: {
        create: async (postData: any) => {
            let finalImageUrl = postData.imageUrl;
            if (postData.imageUrl && postData.imageUrl.startsWith('data:image')) {
                finalImageUrl = await api.storage.uploadPostImage(postData.userId, postData.imageUrl);
            }

            const { data, error } = await supabase
                .from('posts')
                .insert({
                    user_id: postData.userId,
                    content: postData.content,
                    image_url: finalImageUrl,
                    video_url: postData.videoUrl,
                    location_name: postData.locationName
                })
                .select()
                .single();
            
            if (error) throw error;
            return data;
        },
        list: async () => {
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    profiles:user_id (name, username, user_avatar, is_verified, role),
                    likes (user_id),
                    flames (user_id),
                    comments (id, text, created_at, profiles:user_id (name, user_avatar))
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            return data.map(post => ({
                id: post.id,
                userId: post.user_id,
                userName: post.profiles?.name || 'Usuário',
                username: post.profiles?.username || 'user',
                userAvatar: post.profiles?.user_avatar || '👤',
                authorIsVerified: post.profiles?.is_verified || false,
                timestamp: post.created_at,
                content: post.content,
                imageUrl: post.image_url,
                videoUrl: post.video_url,
                locationName: post.location_name,
                likedByUserIds: (post.likes || []).map((l: any) => l.user_id),
                flamedByUserIds: (post.flames || []).map((f: any) => f.user_id),
                comments: (post.comments || []).map((c: any) => ({
                    id: c.id,
                    userName: c.profiles?.name || 'Usuário',
                    userAvatar: c.profiles?.user_avatar || '👤',
                    text: c.text,
                    timestamp: c.created_at
                }))
            }));
        },
        like: async (postId: number, userId: string) => {
            const { data: existing } = await supabase
                .from('likes')
                .select('id')
                .eq('post_id', postId)
                .eq('user_id', userId)
                .maybeSingle();

            if (existing) {
                await supabase.from('likes').delete().eq('id', existing.id);
            } else {
                await supabase.from('likes').insert({ post_id: postId, user_id: userId });
            }
        },
        giveFlame: async (postId: number, giverId: string, authorId: string) => {
            const { error } = await supabase.from('flames').insert({ post_id: postId, user_id: giverId });
            if (error) throw new Error("Você já doou para este post.");
            
            await supabase.rpc('increment_flame', { user_id: authorId });
            await supabase.rpc('decrement_flame', { user_id: giverId });
        },
        comment: async (postId: number, userId: string, text: string) => {
            await supabase.from('comments').insert({ post_id: postId, user_id: userId, text });
        },
        delete: async (postId: number) => {
            await supabase.from('posts').delete().eq('id', postId);
        },
        update: async (postId: number, content: string) => {
            await supabase.from('posts').update({ content }).eq('id', postId);
        }
    },
    events: {
        list: async () => {
            const { data } = await supabase
                .from('events')
                .select('*, event_participants(user_id)')
                .order('event_date', { ascending: true });
            
            return (data || []).map(e => ({
                ...e,
                date: e.event_date,
                time: e.event_time,
                location: { city: e.city, state: e.state },
                participantIds: (e.event_participants || []).map((p: any) => p.user_id)
            }));
        },
        create: async (eventData: any) => {
            const { data, error } = await supabase.from('events').insert({
                creator_id: eventData.creatorId,
                title: eventData.title,
                description: eventData.description,
                image_url: eventData.imageUrl,
                event_date: eventData.date,
                event_time: eventData.time,
                city: eventData.location.city,
                state: eventData.location.state,
                type: eventData.type
            }).select().single();
            if (error) throw error;
            return data;
        },
        join: async (eventId: number, userId: string) => {
            const { data: existing } = await supabase
                .from('event_participants')
                .select('*')
                .eq('event_id', eventId)
                .eq('user_id', userId)
                .maybeSingle();
            
            if (existing) {
                await supabase.from('event_participants').delete().eq('event_id', eventId).eq('user_id', userId);
            } else {
                await supabase.from('event_participants').insert({ event_id: eventId, user_id: userId });
            }
        },
        getComments: async (eventId: number) => {
            const { data, error } = await supabase
                .from('event_comments')
                .select('*, profiles:user_id (name, user_avatar)')
                .eq('event_id', eventId)
                .order('created_at', { ascending: true });
            
            if (error) throw error;
            return (data || []).map((c: any) => ({
                id: c.id,
                event_id: c.event_id,
                user_id: c.user_id,
                text: c.text,
                created_at: c.created_at,
                profile: {
                    name: c.profiles?.name || 'Usuário',
                    user_avatar: c.profiles?.user_avatar || '👤'
                }
            }));
        },
        addComment: async (commentData: any) => {
            const { data, error } = await supabase
                .from('event_comments')
                .insert({
                    event_id: commentData.event_id,
                    user_id: commentData.user_id,
                    text: commentData.text
                })
                .select('*, profiles:user_id (name, user_avatar)')
                .single();
            
            if (error) throw error;
            return {
                id: data.id,
                event_id: data.event_id,
                user_id: data.user_id,
                text: data.text,
                created_at: data.created_at,
                profile: {
                    name: data.profiles?.name || 'Usuário',
                    user_avatar: data.profiles?.user_avatar || '👤'
                }
            };
        }
    },
    messages: {
        list: async (userId: string) => {
            const { data } = await supabase
                .from('direct_messages')
                .select('*')
                .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
                .order('created_at', { ascending: true });
            
            return (data || []).map(m => ({
                id: m.id,
                senderId: m.sender_id,
                receiverId: m.receiver_id,
                text: m.text,
                audioUrl: m.audio_url,
                timestamp: m.created_at,
                read: m.read
            }));
        },
        send: async (data: any) => {
            const { data: msg, error } = await supabase.from('direct_messages').insert({
                sender_id: data.senderId,
                receiver_id: data.receiverId,
                text: data.text,
                audio_url: data.audio_url
            }).select().single();
            if (error) throw error;
            return msg;
        }
    },
    music: {
        search: async (query: string): Promise<MusicTrack[]> => {
            return [
                { id: '1', name: 'Motivational Track', artist: 'NowFit Beats', albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&auto=format&fit=crop' }
            ];
        }
    },
    data: {
        getRecipes: async () => RECEITAS_DATABASE,
        getExercises: async () => EXERCICIOS_DATABASE,
        getProfessionals: async () => PROFESSIONALS_DATABASE,
    }
};
