
import { API_BASE_URL, USE_MOCK_API } from '@/config';
import { UserData, Post, EventData, MusicTrack, EventComment, DirectMessage } from './../types';
import { DEFAULT_UI_TEXTS, EXERCICIOS_DATABASE, RECEITAS_DATABASE, PROFESSIONALS_DATABASE } from './../constants';

// Mock Data
const mockUsers: UserData[] = [
    {
        id: 'u1',
        name: 'Dev User',
        email: 'dev@nowfit.com',
        userAvatar: '👤',
        username: 'dev_user',
        birthDate: '1990-01-01',
        age: 30,
        weight: 75,
        height: 175,
        goals: ['Ganhar Massa'],
        selectedRecipes: [],
        selectedExercises: [],
        followerIds: ['u2', 'u3', 'u4'],
        followingIds: ['u2'],
        blockedUserIds: [],
        flameBalance: 10,
        isVerified: true,
        isAdmin: true,
        isProfessional: true, // Added for testing professional view
        isProfilePublic: true
    },
    {
        id: 'u2',
        name: 'Jane Doe',
        email: 'jane@example.com',
        userAvatar: '👩',
        username: 'janedoe',
        birthDate: '1992-05-15',
        age: 28,
        weight: 60,
        height: 165,
        goals: ['Perder Peso'],
        selectedRecipes: [],
        selectedExercises: [],
        followerIds: ['u1'],
        followingIds: ['u1'],
        blockedUserIds: [],
        flameBalance: 5,
        isVerified: false,
        isProfilePublic: true,
        consultancy: {
            professionalId: 'u1',
            startDate: new Date().toISOString(),
            status: 'active' // Publicado
        }
    },
    {
        id: 'u3',
        name: 'Pedro Alves',
        email: 'pedro@example.com',
        userAvatar: 'https://randomuser.me/api/portraits/men/32.jpg',
        username: 'pedro_fit',
        birthDate: '1995-08-20',
        age: 29,
        weight: 82,
        height: 180,
        goals: ['Hipertrofia'],
        selectedRecipes: [],
        selectedExercises: [],
        followerIds: ['u1'],
        followingIds: ['u1'],
        blockedUserIds: [],
        flameBalance: 100,
        isVerified: false,
        isProfilePublic: true,
        consultancy: {
            professionalId: 'u1',
            startDate: new Date().toISOString(),
            status: 'pending' // Não publicado
        }
    },
    {
        id: 'u4',
        name: 'Mariana Costa',
        email: 'mari@example.com',
        userAvatar: 'https://randomuser.me/api/portraits/women/44.jpg',
        username: 'maricosta',
        birthDate: '1998-02-10',
        age: 26,
        weight: 58,
        height: 160,
        goals: ['Condicionamento'],
        selectedRecipes: [],
        selectedExercises: [],
        followerIds: ['u1'],
        followingIds: ['u1'],
        blockedUserIds: [],
        flameBalance: 20,
        isVerified: false,
        isProfilePublic: true,
        consultancy: {
            professionalId: 'u1',
            startDate: new Date().toISOString(),
            status: 'pending' // Não publicado
        }
    }
];

const mockPosts: Post[] = [
    {
        id: 1,
        userId: 'u2',
        userName: 'Jane Doe',
        userAvatar: '👩',
        username: 'janedoe',
        timestamp: new Date().toISOString(),
        content: 'Just finished a great workout!',
        likedByUserIds: ['u1'],
        flamedByUserIds: [],
        comments: [
            {
                id: 101,
                userId: 'u1',
                userName: 'Dev User',
                userAvatar: '👤',
                text: 'Great job!',
                timestamp: new Date(Date.now() - 3600000).toISOString()
            }
        ],
        isPriority: false,
        authorIsVerified: false
    }
];

const mockEvents: EventData[] = [
    {
        id: 1,
        creatorId: 'u1',
        title: 'Corrida Matinal',
        description: 'Uma corrida leve no parque para começar o dia.',
        imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3',
        date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        time: '07:00',
        location: { state: 'SP', city: 'São Paulo' },
        type: 'Corrida',
        participantIds: ['u1', 'u2'],
        updates: [],
        requiresApproval: false
    }
];

const mockMessages: DirectMessage[] = [
    {
        id: 1,
        senderId: 'u2',
        receiverId: 'u1',
        text: 'Olá! Vamos treinar amanhã?',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        read: false
    }
];

const getHeaders = () => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('auth_token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

export const api = {
    auth: {
        login: async (email: string, password?: string) => {
             if (USE_MOCK_API) {
                const user = mockUsers.find(u => u.email === email);
                // Simple mock login, ignoring password check for now or assuming correct
                if (user) return { user, token: 'mock_token_123' };
                throw new Error('Invalid login credentials');
            }
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                 method: 'POST',
                 headers: getHeaders(),
                 body: JSON.stringify({ email, password })
            });
            if (!res.ok) throw new Error('Failed to login');
            return await res.json();
        },
        register: async (data: any) => {
             if (USE_MOCK_API) {
                 const newUser: UserData = {
                     id: `u${mockUsers.length + 1}`,
                     ...data,
                     userAvatar: '👤',
                     username: data.username || data.name.toLowerCase().replace(/\s/g, ''),
                     age: 0, weight: 0, height: 0, goals: [],
                     selectedRecipes: [], selectedExercises: [],
                     followerIds: [], followingIds: [], blockedUserIds: [],
                     flameBalance: 0, isVerified: false, isProfilePublic: true
                 };
                 mockUsers.push(newUser);
                 return { user: newUser, token: 'mock_token_new' };
             }
              const res = await fetch(`${API_BASE_URL}/auth/register`, {
                 method: 'POST',
                 headers: getHeaders(),
                 body: JSON.stringify(data)
             });
             if (!res.ok) throw new Error('Failed to register');
             return await res.json();
        },
        logout: async () => {
            if (USE_MOCK_API) return true;
            await fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', headers: getHeaders() });
        },
        getCurrentUser: async () => {
             if (USE_MOCK_API) {
                 // Just return the dev user for persistence simulation in mock mode
                 return mockUsers[0]; 
             }
             const res = await fetch(`${API_BASE_URL}/auth/me`, { headers: getHeaders() });
             if (!res.ok) return null;
             return await res.json();
        }
    },
    users: {
        update: async (id: string, updates: Partial<UserData>) => {
            if (USE_MOCK_API) {
                const userIndex = mockUsers.findIndex(u => u.id === id);
                if (userIndex > -1) {
                    mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
                    return mockUsers[userIndex];
                }
                throw new Error('User not found');
            }
             const res = await fetch(`${API_BASE_URL}/users/${id}`, {
                 method: 'PUT',
                 headers: getHeaders(),
                 body: JSON.stringify(updates)
             });
             if (!res.ok) throw new Error('Failed to update user');
             return await res.json();
        },
        checkUsername: async (username: string) => {
            if (USE_MOCK_API) {
                return mockUsers.some(u => u.username === username);
            }
             const res = await fetch(`${API_BASE_URL}/users/check-username?username=${username}`, { headers: getHeaders() });
             const data = await res.json();
             return data.exists;
        },
        getAll: async () => {
            if (USE_MOCK_API) return [...mockUsers];
            const res = await fetch(`${API_BASE_URL}/users`, { headers: getHeaders() });
            if (!res.ok) throw new Error('Failed to fetch users');
            return await res.json();
        }
    },
    posts: {
        create: async (postData: any) => {
             if (USE_MOCK_API) {
                 const newPost = { 
                     id: Date.now(), 
                     ...postData, 
                     timestamp: new Date().toISOString(),
                     likedByUserIds: [],
                     flamedByUserIds: [],
                     comments: [] 
                 };
                 mockPosts.unshift(newPost);
                 return newPost;
             }
             const res = await fetch(`${API_BASE_URL}/posts`, { 
                 method: 'POST', 
                 headers: getHeaders(), 
                 body: JSON.stringify(postData) 
             });
             if (!res.ok) throw new Error('Failed to create post');
             return await res.json();
        },
        list: async () => {
            if (USE_MOCK_API) return [...mockPosts];
            const res = await fetch(`${API_BASE_URL}/posts`, { headers: getHeaders() });
            if (!res.ok) throw new Error('Failed to fetch posts');
            return await res.json();
        },
        like: async (postId: number, userId: string) => {
             if (USE_MOCK_API) {
                 const post = mockPosts.find(p => p.id === postId);
                 if (post) {
                     if (post.likedByUserIds.includes(userId)) {
                         post.likedByUserIds = post.likedByUserIds.filter(id => id !== userId);
                     } else {
                         post.likedByUserIds.push(userId);
                     }
                     return post;
                 }
                 throw new Error('Post not found');
             }
             const res = await fetch(`${API_BASE_URL}/posts/${postId}/like`, { 
                 method: 'POST', 
                 headers: getHeaders(),
                 body: JSON.stringify({ userId })
             });
             if (!res.ok) throw new Error('Failed to like post');
             return await res.json();
        },
        delete: async (postId: number) => {
             if (USE_MOCK_API) {
                 const index = mockPosts.findIndex(p => p.id === postId);
                 if (index > -1) mockPosts.splice(index, 1);
                 return true;
             }
             await fetch(`${API_BASE_URL}/posts/${postId}`, { method: 'DELETE', headers: getHeaders() });
        },
        update: async (postId: number, content: string) => {
             if (USE_MOCK_API) {
                 const post = mockPosts.find(p => p.id === postId);
                 if (post) post.content = content;
                 return post;
             }
             const res = await fetch(`${API_BASE_URL}/posts/${postId}`, { 
                 method: 'PUT', 
                 headers: getHeaders(), 
                 body: JSON.stringify({ content }) 
             });
             if (!res.ok) throw new Error('Failed to update post');
             return await res.json();
        },
        giveFlame: async (postId: number, giverId: string, receiverId: string) => {
             if (USE_MOCK_API) {
                 const post = mockPosts.find(p => p.id === postId);
                 const giver = mockUsers.find(u => u.id === giverId);
                 const receiver = mockUsers.find(u => u.id === receiverId);

                 if (post && giver) {
                     if (giver.flameBalance < 1) throw new Error("Saldo insuficiente");
                     
                     if (post.flamedByUserIds.includes(giverId)) throw new Error("Você já doou um flame para este post");

                     giver.flameBalance -= 1;
                     if (receiver) receiver.flameBalance += 1;
                     post.flamedByUserIds.push(giverId);
                     
                     return { success: true, newBalance: giver.flameBalance };
                 }
                 throw new Error("Erro ao processar doação");
             }
              const res = await fetch(`${API_BASE_URL}/posts/${postId}/flame`, { 
                  method: 'POST', 
                  headers: getHeaders(),
                  body: JSON.stringify({ receiverId, giverId })
              });
             if (!res.ok) throw new Error('Falha na transação');
             return await res.json();
        },
        comment: async (postId: number, userId: string, text: string) => {
            if (USE_MOCK_API) {
                const post = mockPosts.find(p => p.id === postId);
                const user = mockUsers.find(u => u.id === userId);
                if (post && user) {
                    post.comments.push({
                        id: Date.now(),
                        userId,
                        userName: user.name,
                        userAvatar: user.userAvatar,
                        text,
                        timestamp: new Date().toISOString()
                    });
                }
                return true;
            }
            await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({ text, userId })
            });
        },
    },
    events: {
        list: async () => {
             if (USE_MOCK_API) return [...mockEvents];
             const res = await fetch(`${API_BASE_URL}/events`, { headers: getHeaders() });
             if (!res.ok) throw new Error('Failed to list events');
             return await res.json();
        },
        create: async (eventData: any) => {
             if (USE_MOCK_API) {
                 const newEvent = { 
                     id: Date.now(), 
                     ...eventData, 
                     participantIds: [eventData.creatorId],
                     updates: [] 
                 };
                 mockEvents.unshift(newEvent);
                 return newEvent;
             }
             const res = await fetch(`${API_BASE_URL}/events`, {
                 method: 'POST',
                 headers: getHeaders(),
                 body: JSON.stringify(eventData)
             });
             if (!res.ok) throw new Error('Failed to create event');
             return await res.json();
        },
        join: async (eventId: number, userId: string) => {
             if (USE_MOCK_API) {
                 const event = mockEvents.find(e => e.id === eventId);
                 if (event) {
                     if (event.participantIds.includes(userId)) {
                         event.participantIds = event.participantIds.filter(id => id !== userId);
                     } else {
                         event.participantIds.push(userId);
                     }
                 }
                 return true;
             }
             const res = await fetch(`${API_BASE_URL}/events/${eventId}/join`, {
                 method: 'POST',
                 headers: getHeaders(),
                 body: JSON.stringify({ userId })
             });
             if (!res.ok) throw new Error('Failed to join event');
             return await res.json();
        },
        getComments: async (eventId: number): Promise<EventComment[]> => {
             if (USE_MOCK_API) return [];
             const res = await fetch(`${API_BASE_URL}/events/${eventId}/comments`, { headers: getHeaders() });
             if (!res.ok) throw new Error('Failed to fetch comments');
             return await res.json();
        },
        addComment: async (data: any): Promise<EventComment> => {
             if (USE_MOCK_API) return { 
                 id: Date.now(), 
                 event_id: data.event_id, 
                 user_id: data.user_id, 
                 text: data.text, 
                 created_at: new Date().toISOString(),
                 profile: data.profile
             };
             const res = await fetch(`${API_BASE_URL}/events/${data.event_id}/comments`, {
                 method: 'POST',
                 headers: getHeaders(),
                 body: JSON.stringify(data)
             });
             if (!res.ok) throw new Error('Failed to add comment');
             return await res.json();
        }
    },
    messages: {
        list: async (userId: string) => {
             if (USE_MOCK_API) {
                 return mockMessages.filter(m => m.senderId === userId || m.receiverId === userId);
             }
             const res = await fetch(`${API_BASE_URL}/messages?userId=${userId}`, { headers: getHeaders() });
             if (!res.ok) throw new Error('Failed to list messages');
             return await res.json();
        },
        send: async (data: any) => {
             if (USE_MOCK_API) {
                 const newMsg = {
                     id: Date.now(),
                     senderId: data.senderId,
                     receiverId: data.receiverId,
                     text: data.text,
                     audioUrl: data.audioUrl,
                     timestamp: new Date().toISOString(),
                     read: false
                 };
                 mockMessages.push(newMsg);
                 return newMsg;
             }
             const res = await fetch(`${API_BASE_URL}/messages`, {
                 method: 'POST',
                 headers: getHeaders(),
                 body: JSON.stringify(data)
             });
             if (!res.ok) throw new Error('Failed to send message');
             return await res.json();
        }
    },
    music: {
        search: async (query: string): Promise<MusicTrack[]> => {
            // Mock search
            if (USE_MOCK_API) return [];
            return [];
        }
    },
    data: {
        getRecipes: async () => RECEITAS_DATABASE,
        getExercises: async () => EXERCICIOS_DATABASE,
        getProfessionals: async () => PROFESSIONALS_DATABASE,
        getEvents: async () => mockEvents,
    }
};
