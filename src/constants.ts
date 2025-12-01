// constants.ts

import {
  Recipe,
  Exercise,
  UITexts,
  CheckinItemData,
  Sport,
  Professional,
  Badge,
} from './types';

export const ADVENTURE_ACTIVITIES = [
  { key: 'trilha', name: 'Trilha', icon: '🌲' },
  { key: 'ciclismo', name: 'Ciclismo', icon: '🚴' },
  { key: 'corrida-montanha', name: 'Corrida de Montanha', icon: '⛰️' },
  { key: 'escalada', name: 'Escalada', icon: '🧗' },
  { key: 'caiaque', name: 'Caiaque', icon: '🛶' },
  { key: 'surf', name: 'Surf', icon: '🏄' },
];

export const SPORTS_LIST: Sport[] = [
  { key: 'corrida', name: 'Corrida', icon: 'fa-solid fa-person-running' },
  { key: 'trail', name: 'Trail Run', icon: 'fa-solid fa-mountain' },
  { key: 'caminhada', name: 'Caminhada', icon: 'fa-solid fa-person-walking' },
  { key: 'trilha', name: 'Trilha', icon: 'fa-solid fa-person-hiking' },
  { key: 'pedalada', name: 'Pedalada', icon: 'fa-solid fa-bicycle' },
];

export const BADGES_DATABASE: Badge[] = [
  { id: 'frame_001', name: 'Moldura Flamejante', type: 'frame', imageUrl: 'https://i.imgur.com/Y3eJ5yZ.png', price: 250 },
  { id: 'badge_001', name: 'Emblema Pioneiro', type: 'badge', imageUrl: 'https://i.imgur.com/sZ3aD4A.png', price: 100 },
  { id: 'frame_002', name: 'Moldura Neon', type: 'frame', imageUrl: 'https://i.imgur.com/u1S9xT8.png', price: 300 },
  { id: 'badge_002', name: 'Emblema Top Corredor', type: 'badge', imageUrl: 'https://i.imgur.com/kS9L67H.png', price: 150 },
];


export const RECEITAS_DATABASE: Recipe[] = [
  // salgadas
  {
    id: 1,
    nome: 'Omelete Verde Power',
    tipo: 'salgada',
    icon: '🥚',
    categoria: 'Café da Manhã',
    ingredientes: [
      '3 claras de ovo',
      '1 ovo inteiro',
      '2 colheres (sopa) de espinafre picado',
      '1 colher (sopa) de aveia em flocos',
      'Sal rosa e orégano a gosto',
      'Spray de azeite',
    ],
    modoPreparo: [
      'Bata as claras e o ovo inteiro em um bowl',
      'Adicione o espinafre picado e a aveia',
      'Tempere com sal e orégano',
      'Aqueça uma frigideira antiaderente com spray de azeite',
      'Despeje a mistura e cozinhe em fogo baixo até firmar',
      'Vire com cuidado e deixe dourar do outro lado',
    ],
    beneficio: 'Alta em proteínas, baixa em gorduras e rica em fibras.',
  },
  {
    id: 2,
    nome: 'Frango Grelhado com Legumes',
    tipo: 'salgada',
    icon: '🍗',
    categoria: 'Almoço',
    ingredientes: [
      '120g de peito de frango',
      '½ abobrinha em rodelas',
      '½ cenoura em palitos',
      '½ pimentão vermelho em tiras',
      '1 colher (chá) de azeite',
      'Sal, páprica e limão',
    ],
    modoPreparo: ['Tempere o frango', 'Grelhe em frigideira quente', 'Salteie os legumes', 'Sirva o frango sobre os legumes'],
    beneficio: 'Refeição completa, rica em proteínas magras e antioxidantes.',
  },
  {
    id: 3,
    nome: 'Purê de Batata-Doce Proteico',
    tipo: 'salgada',
    icon: '🍠',
    categoria: 'Almoço',
    ingredientes: ['200g de batata-doce cozida', '1 scoop de whey protein', '2 colheres (sopa) de leite vegetal', 'Sal e noz-moscada'],
    modoPreparo: ['Amasse a batata-doce', 'Misture com whey e leite', 'Tempere e sirva'],
    beneficio: 'Carboidrato de baixo índice glicêmico com proteína extra.',
  },
  {
    id: 4,
    nome: 'Espaguete de Abobrinha com Atum',
    tipo: 'salgada',
    icon: '🥒',
    categoria: 'Jantar',
    ingredientes: ['1 abobrinha média', '1 lata de atum', '2 tomates picados', 'Alho e manjericão'],
    modoPreparo: ['Faça tiras da abobrinha', 'Refogue alho e tomate', 'Adicione atum e abobrinha', 'Finalize com manjericão'],
    beneficio: 'Substitui a massa tradicional, reduzindo calorias.',
  },
  {
    id: 5,
    nome: 'Wrap Funcional de Tapioca',
    tipo: 'salgada',
    icon: '🌯',
    categoria: 'Lanche',
    ingredientes: ['3 colheres (sopa) de tapioca', '2 fatias de peito de peru', 'Alface e tomate', 'Cream cheese light'],
    modoPreparo: ['Faça a tapioca na frigideira', 'Recheie com os ingredientes', 'Enrole e sirva'],
    beneficio: 'Lanche rápido, sem glúten, com proteína e baixa caloria.',
  },
  {
    id: 6,
    nome: 'Panqueca Integral de Legumes',
    tipo: 'salgada',
    icon: '🥞',
    categoria: 'Lanche',
    ingredientes: ['2 colheres (sopa) de aveia', '1 ovo', '½ cenoura ralada', '½ abobrinha ralada'],
    modoPreparo: ['Bata o ovo com aveia', 'Adicione os legumes', 'Cozinhe em frigideira antiaderente'],
    beneficio: 'Rica em fibras e vegetais. Ótima para lanches.',
  },
  {
    id: 7,
    nome: 'Arroz de Couve-Flor',
    tipo: 'salgada',
    icon: '🥦',
    categoria: 'Almoço',
    ingredientes: ['1 couve-flor média', 'Alho, azeite e cebolinha'],
    modoPreparo: ['Rale a couve-flor', 'Refogue o alho', 'Cozinhe a couve-flor por 5-7 min', 'Tempere e sirva'],
    beneficio: 'Substitui o arroz branco com 90% menos calorias.',
  },
  {
    id: 8,
    nome: 'Hambúrguer Caseiro Fit',
    tipo: 'salgada',
    icon: '🍔',
    categoria: 'Almoço',
    ingredientes: ['150g de patinho moído', '1 colher (sopa) de aveia', '1 clara de ovo', 'Temperos a gosto'],
    modoPreparo: ['Misture todos os ingredientes', 'Modele o hambúrguer', 'Grelhe ou asse'],
    beneficio: 'Proteína de alta qualidade sem gorduras trans.',
  },
  // doces
  {
    id: 36,
    nome: 'Brownie Proteico de Cacau',
    tipo: 'doce',
    icon: '🍫',
    categoria: 'Sobremesa',
    ingredientes: ['2 colheres (sopa) de cacau', '1 banana madura', '1 ovo', '1 colher (sopa) de aveia'],
    modoPreparo: ['Misture tudo', 'Asse a 180°C por 15 minutos'],
    beneficio: 'Doce natural da banana, rico em fibras e proteínas.',
  },
  {
    id: 37,
    nome: 'Beijinho Fit de Coco',
    tipo: 'doce',
    icon: '🥥',
    categoria: 'Sobremesa',
    ingredientes: ['3 colheres (sopa) de coco ralado', '1 colher (sopa) de leite em pó desnatado', 'Adoçante'],
    modoPreparo: ['Misture tudo', 'Modele bolinhas', 'Leve à geladeira'],
    beneficio: 'Doce tradicional brasileiro sem açúcar.',
  },
];

export const EXERCICIOS_DATABASE: Exercise[] = [
  { id: 1, nome: 'Supino Reto com Barra', videoId: 'sqOw2YFkiJc', descricao: 'Exercício fundamental para o peitoral maior.', nivel: 'Intermediário', duracao: '4x 8-12', calorias: '~7 cal/min', grupoMuscular: 'Peito', categoria: 'Musculação' },
  { id: 2, nome: 'Crucifixo Inclinado', videoId: 'AP_Ju2n_2kE', descricao: 'Foca na porção superior do peitoral.', nivel: 'Intermediário', duracao: '3x 12-15', calorias: '~6 cal/min', grupoMuscular: 'Peito', categoria: 'Musculação' },
  { id: 3, nome: 'Remada Curvada', videoId: 'vT2GjY_Umpw', descricao: 'Trabalha a espessura das costas.', nivel: 'Intermediário', duracao: '4x 8-12', calorias: '~8 cal/min', grupoMuscular: 'Costas', categoria: 'Musculação' },
  { id: 4, nome: 'Puxada Frontal', videoId: 'c_sEtA9Qj2o', descricao: 'Excelente para a largura das costas (dorsais).', nivel: 'Iniciante', duracao: '3x 10-15', calorias: '~6 cal/min', grupoMuscular: 'Costas', categoria: 'Musculação' },
  { id: 5, nome: 'Agachamento Livre', videoId: 'aclHkVaku9U', descricao: 'O exercício mais completo para pernas e glúteos.', nivel: 'Avançado', duracao: '4x 10-12', calorias: '~10 cal/min', grupoMuscular: 'Pernas', categoria: 'Musculação' },
  { id: 6, nome: 'Levantamento Terra', videoId: 'RyJbvWAh6Mo', descricao: 'Trabalha cadeia posterior, glúteos e lombar.', nivel: 'Avançado', duracao: '3x 6-8', calorias: '~12 cal/min', grupoMuscular: 'Pernas', categoria: 'Musculação' },
  { id: 7, nome: 'Desenvolvimento com Halteres', videoId: 'B-aVuyhvLHU', descricao: 'Foca nos deltoides, construindo ombros largos.', nivel: 'Intermediário', duracao: '4x 10-12', calorias: '~6 cal/min', grupoMuscular: 'Ombros', categoria: 'Musculação' },
  { id: 8, nome: 'Elevação Lateral', videoId: '3VcKaXpzqRo', descricao: 'Isola a porção medial do deltoide.', nivel: 'Iniciante', duracao: '3x 12-15', calorias: '~4 cal/min', grupoMuscular: 'Ombros', categoria: 'Musculação' },
  { id: 9, nome: 'Rosca Direta com Barra', videoId: 'kwG2ZAl-Y-0', descricao: 'Exercício clássico para o bíceps.', nivel: 'Iniciante', duracao: '3x 10-12', calorias: '~5 cal/min', grupoMuscular: 'Bíceps', categoria: 'Musculação' },
  { id: 10, nome: 'Tríceps Testa', videoId: 'h-3m_T-NIpE', descricao: 'Excelente para a cabeça longa do tríceps.', nivel: 'Intermediário', duracao: '3x 10-12', calorias: '~5 cal/min', grupoMuscular: 'Tríceps', categoria: 'Musculação' },
  { id: 11, nome: 'Prancha Abdominal', videoId: 'pSHjTRCQxIw', descricao: 'Fortalece o core de forma isométrica.', nivel: 'Iniciante', duracao: '3x 30-60s', calorias: '~3 cal/min', grupoMuscular: 'Abdômen', categoria: 'Funcional' },
  { id: 12, nome: 'Burpees', videoId: 'TU8QYVW0gDU', descricao: 'Exercício de corpo inteiro de alta intensidade.', nivel: 'Avançado', duracao: '3x 10', calorias: '~15 cal/min', grupoMuscular: 'Cardio', categoria: 'Aeróbico' },
];

export const PROFESSIONALS_DATABASE: Professional[] = [
  {
    id: 'prof_nutri_ana',
    name: 'Ana Silva',
    avatarUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=870&auto=format&fit=crop',
    specialty: 'Nutricionista',
    icon: '🍎',
    coverImageUrl: 'https://images.unsplash.com/photo-1543353071-849f4e7a2988?q=80&w=1470&auto=format&fit=crop',
    bio: 'Nutricionista apaixonada por ajudar pessoas a alcançarem seus objetivos de forma saudável e sustentável. Foco em reeducação alimentar e nutrição esportiva.',
    services: ['Plano alimentar personalizado', 'Acompanhamento quinzenal', 'Lista de compras inteligente'],
    monthlyPrice: 150,
    portfolioImages: [
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1470&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1453&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=1374&auto=format&fit=crop',
    ],
    testimonials: [
        { quote: 'A Ana mudou minha relação com a comida! Perdi 10kg sem sofrimento.', clientName: 'Mariana P.'},
        { quote: 'Finalmente consegui ganhar massa muscular com o plano certo. Recomendo!', clientName: 'Pedro H.'},
    ],
  },
  {
    id: 'prof_trainer_carlos',
    name: 'Carlos Lima',
    avatarUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=870&auto=format&fit=crop',
    specialty: 'Personal Trainer',
    icon: '🏋️‍♂️',
    coverImageUrl: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=1469&auto=format&fit=crop',
    bio: 'Educador Físico com mais de 10 anos de experiência em treinos de força e condicionamento físico. Minha missão é te ajudar a superar seus limites com segurança.',
    services: ['Planilha de treinos semanal', 'Correção de movimentos por vídeo', 'Suporte via chat'],
    monthlyPrice: 200,
    portfolioImages: [
      'https://images.unsplash.com/photo-1594737625785-a62022d2c126?q=80&w=1374&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop',
    ],
    testimonials: [
        { quote: 'Os treinos do Carlos são desafiadores e motivantes. Resultados incríveis!', clientName: 'Juliana F.'},
        { quote: 'Aprendi a treinar de verdade e evitei lesões. Um excelente profissional.', clientName: 'Ricardo S.'},
    ],
  }
];

export const DEFAULT_UI_TEXTS: UITexts = {
    login: {
        subtitle: "Seu parceiro de jornada fitness.",
        emailLabel: "E-mail",
        passwordLabel: "Senha",
        loginButton: "Entrar",
        registerPrompt: "Não tem uma conta?",
        registerLink: "Cadastre-se"
    },
    register: {
        title: "Crie sua Conta",
        subtitle: "Comece sua transformação hoje mesmo.",
        nameLabel: "Nome completo",
        emailLabel: "E-mail",
        birthDateLabel: "Data de Nascimento",
        passwordLabel: "Senha",
        confirmPasswordLabel: "Confirme a senha",
        registerButton: "Criar Conta",
        loginPrompt: "Já tem uma conta?",
        loginLink: "Faça o login"
    },
    onboarding: {
        mainTitle: "Vamos personalizar sua jornada!",
        mainSubtitle: "Responda algumas perguntas para criarmos o melhor plano para você.",
        ageQuestion: "Qual sua idade?",
        weightQuestion: "Qual seu peso? (kg)",
        heightQuestion: "Qual sua altura? (cm)",
        goalQuestion: "Qual seu principal objetivo?",
        goalSubtitle: "Você pode escolher mais de um.",
        submitButton: "Continuar"
    },
    recipeSelection: {
        title: "Selecione suas Receitas",
        subtitle: "Escolha as receitas que mais te agradam para adicionarmos à sua rotina.",
        counterText: " receitas selecionadas",
        submitButton: "Próximo Passo"
    },
    exerciseSelection: {
        title: "Selecione seus Exercícios",
        subtitle: "Agora, escolha os exercícios que você gosta ou tem acesso.",
        counterText: " exercícios selecionados",
        submitButton: "Finalizar e Criar Painel"
    },
    dashboard: {
        welcome: "Bem-vindo(a) de volta,",
        homeTab: "Início",
        aiCoachTab: "Coach IA",
        rotinaTab: "Rotina",
        alimentacaoTab: "Alimentação",
        treinosTab: "Treinos",
        profileTab: "Você"
    },
    home: {
        checkinTitle: "Check-in Diário",
        checkinSubtitle: "Marque as atividades que você completou hoje.",
        streakText: "Sequência atual:",
        goalStat: "Objetivo",
        weightStat: "Peso Atual",
        progressStat: "Progresso do Dia"
    },
    aiCoach: {
        title: "Seu Coach IA",
        subtitle: "Plano diário personalizado para você.",
        loading: 'Seu Coach IA está preparando seu plano...',
        error: 'Ocorreu um erro ao gerar seu plano. Tente novamente.',
    },
    alimentacao: {
        title: "Biblioteca de Receitas",
        subtitle: "Explore todas as receitas disponíveis e planeje sua dieta."
    },
    treinos: {
        title: "Biblioteca de Exercícios",
        subtitle: "Veja todos os exercícios com vídeos e instruções."
    },
    profile: {
        title: "Seu Perfil",
        postsTab: "Posts",
        followersTab: "Seguidores",
        followingTab: "Seguindo",
        editProfileButton: "Editar Perfil",
        changePhotoButton: "Mudar foto",
        removePhotoButton: "Remover",
        saveButton: "Salvar Alterações"
    },
    socialFeed: {
        title: "Feed Social",
        whatsOnYourMind: "No que você está pensando?",
        postButton: "Publicar"
    },
    adminPanel: {
        title: "Painel do Administrador",
        subtitle: "Gerencie as configurações do aplicativo.",
        editModeLabel: "Ativar Modo de Edição de UI",
        notificationTitle: "Enviar Notificação Global",
        notificationPlaceholder: "Digite sua mensagem aqui...",
        notificationButton: "Enviar Notificação"
    }
};

export const DEFAULT_CHECKIN_ITEMS: CheckinItemData[] = [
    { key: 'agua', icon: '💧', label: 'Bebeu 2L+' },
    { key: 'treino', icon: '💪', label: 'Treinou' },
    { key: 'dieta', icon: '🥗', label: 'Seguiu a dieta' },
    { key: 'sono', icon: '😴', label: 'Dormiu 8h' },
    { key: 'cardio', icon: '❤️', label: 'Fez cardio' },
    { key: 'leitura', icon: '📚', label: 'Leu 15min' },
];