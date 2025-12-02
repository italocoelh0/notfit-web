
import React, { useState } from 'react';
import { UITexts } from '../types';
import EditableField from '../components/EditableField';
import { motion, AnimatePresence } from 'framer-motion';

interface RegisterPageProps {
  onRegister: (data: { name: string; email: string; birthDate: string, password: string }) => Promise<void>;
  onNavigateToLogin: () => void;
  isEditMode: boolean;
  uiTexts: UITexts;
  onUpdateUiText: (page: 'register', key: string, value: string) => void;
  initialEmail?: string;
}

// Componente Modal para exibir os textos legais
const LegalModal: React.FC<{ title: string; content: React.ReactNode; onClose: () => void }> = ({ title, content, onClose }) => (
    <motion.div 
        className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
    >
        <motion.div 
            className="bg-surface-100 w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[80vh]"
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            onClick={e => e.stopPropagation()}
        >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-surface-200/50 rounded-t-2xl">
                <h3 className="font-anton uppercase text-white tracking-wide text-lg">{title}</h3>
                <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                    <i className="fa-solid fa-times text-xl"></i>
                </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                {content}
            </div>
            <div className="p-4 border-t border-white/10 bg-surface-200/50 rounded-b-2xl">
                <button onClick={onClose} className="w-full bg-primary text-white font-bold py-3 rounded-xl uppercase tracking-widest text-xs hover:bg-primary-hover transition-colors">
                    Entendi
                </button>
            </div>
        </motion.div>
    </motion.div>
);

// Textos Legais Atualizados
const TERMS_TEXT = `TERMOS DE USO - NOWFIT

Bem-vindo ao NowFit! Ao acessar ou usar nosso aplicativo, você concorda com estes Termos de Uso. Leia atentamente.

1. ACEITAÇÃO DOS TERMOS
Ao criar uma conta, você confirma que tem pelo menos 18 anos (ou a idade mínima legal em sua jurisdição) e concorda em cumprir estes termos. Se não concordar, não use o aplicativo.

2. SERVIÇOS OFERECIDOS
O NowFit oferece ferramentas para acompanhamento de atividades físicas, nutrição e bem-estar, incluindo planos gerados por IA e conexão com profissionais.
AVISO DE SAÚDE: O NowFit não substitui aconselhamento médico. Consulte um profissional de saúde antes de iniciar qualquer programa de exercícios ou dieta. O uso das informações fornecidas é por sua conta e risco.

3. CONTA DO USUÁRIO
- Você é responsável por manter a confidencialidade de suas credenciais.
- Você concorda em fornecer informações precisas e atualizadas.
- O compartilhamento de contas é proibido.

4. PLANOS E PAGAMENTOS
- Alguns recursos podem exigir assinatura paga (Flames ou Planos Premium).
- As assinaturas são renovadas automaticamente, a menos que canceladas 24h antes do fim do período.
- Reembolsos seguem a política da loja de aplicativos (Apple App Store ou Google Play Store).

5. CONDUTA DO USUÁRIO
Você concorda em não:
- Usar o app para fins ilegais.
- Assediar, intimidar ou prejudicar outros usuários.
- Tentar engenharia reversa ou violar a segurança do app.

6. PROPRIEDADE INTELECTUAL
Todo o conteúdo (logotipos, textos, gráficos, software) é propriedade exclusiva do NowFit e protegido por leis de direitos autorais.

7. LIMITAÇÃO DE RESPONSABILIDADE
O NowFit não se responsabiliza por lesões, danos diretos ou indiretos resultantes do uso do aplicativo.

8. ALTERAÇÕES
Podemos atualizar estes termos a qualquer momento. O uso contínuo após alterações constitui aceitação dos novos termos.

Contato: suporte@nowfit.app`;

const PRIVACY_TEXT = `POLÍTICA DE PRIVACIDADE - NOWFIT

Sua privacidade é nossa prioridade. Esta política descreve como coletamos, usamos e protegemos seus dados.

1. DADOS COLETADOS
- Informações de Registro: Nome, e-mail, data de nascimento.
- Dados de Saúde: Peso, altura, idade, nível de atividade, objetivos.
- Dados de Uso: Registros de treino, alimentação, fotos de progresso (opcional).
- Dados Técnicos: Endereço IP, tipo de dispositivo, sistema operacional.

2. USO DAS INFORMAÇÕES
Utilizamos seus dados para:
- Personalizar planos de treino e dieta via IA.
- Processar pagamentos e gerenciar sua assinatura.
- Melhorar o funcionamento e segurança do aplicativo.
- Enviar notificações importantes (você pode optar por não receber marketing).

3. COMPARTILHAMENTO DE DADOS
- Não vendemos seus dados pessoais para terceiros.
- Podemos compartilhar dados com prestadores de serviço essenciais (ex: processamento de pagamento, hospedagem em nuvem) sob estritos acordos de confidencialidade.
- Se você contratar um Profissional (Personal/Nutri) pelo app, eles terão acesso aos seus dados de perfil e atividade para prestar o serviço.

4. SEGURANÇA
Implementamos medidas de segurança robustas (criptografia, firewalls) para proteger seus dados contra acesso não autorizado. No entanto, nenhum sistema é 100% infalível.

5. SEUS DIREITOS (LGPD/GDPR)
Você tem direito a:
- Acessar seus dados.
- Corrigir dados imprecisos.
- Solicitar a exclusão de sua conta e dados.
- Revogar consentimento a qualquer momento.

Para exercer esses direitos, acesse as configurações do app ou contate suporte@nowfit.app.

6. COOKIES E RASTREAMENTO
Utilizamos tecnologias padrão para analisar o tráfego e melhorar a experiência do usuário.

Atualizado em: 01 de Janeiro de 2025`;

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onNavigateToLogin, isEditMode, uiTexts, onUpdateUiText, initialEmail }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail || '');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Novo estado combinado para os termos
  const [acceptedLegal, setAcceptedLegal] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<'terms' | 'privacy' | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (password !== confirmPassword) {
      setError("As senhas não coincidem!");
      return;
    }
    if (password.length < 6) {
       setError("A senha deve ter no mínimo 6 caracteres.");
       return;
    }
    if (!birthDate || birthDate.length < 10) {
        setError("Data de nascimento inválida.");
        return;
    }

    // Validação dos Termos - OBRIGATÓRIO
    if (!acceptedLegal) {
        setError("É obrigatório aceitar os Termos de Uso e a Política de Privacidade.");
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const [day, month, year] = birthDate.split('/');
      // Validação simples de data
      if (!day || !month || !year || isNaN(Number(day)) || isNaN(Number(month)) || isNaN(Number(year))) {
          throw new Error("Formato de data inválido. Use DD/MM/AAAA.");
      }
      
      const formattedForSupabase = `${year}-${month}-${day}`;
      await onRegister({ name, email, birthDate: formattedForSupabase, password });
    } catch (err: any) {
      console.error("Erro no registro:", err);
      
      let msg = err.message || "Ocorreu um erro no cadastro.";
      
      if (msg.includes("Database error saving new user")) {
          msg = "Erro interno no banco de dados. Por favor, execute o script 'fix_db.sql' no Supabase para corrigir as permissões.";
      } else if (msg.includes("unique constraint")) {
          msg = "Este e-mail ou usuário já está cadastrado.";
      }

      setError(msg);
      setLoading(false); // Resetar loading em caso de erro para destravar o botão
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 8) {
      value = value.slice(0, 8);
    }

    if (value.length > 4) {
      value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
    } else if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    
    setBirthDate(value);
  };

  // Input compactado
  const inputStyles = "w-full px-4 py-2.5 bg-black/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all backdrop-blur-md text-sm";
  const texts = uiTexts.register;

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-4 relative overflow-hidden">
       {/* Video Background */}
       <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 z-10"></div>
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover"
          >
            <source src="https://imgur.com/cumtqQ0.mp4" type="video/mp4" />
          </video>
       </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-sm w-full p-4 relative z-20 flex flex-col items-center overflow-y-auto custom-scrollbar"
        style={{ maxHeight: '90vh' }}
      >
        <div className="text-center mb-8 w-full">
            <div className="relative z-10">
                <EditableField as="h1" isEditing={isEditMode} value={texts.title} onChange={v => onUpdateUiText('register', 'title', v)} className="font-anton text-3xl text-white tracking-wide drop-shadow-lg text-center uppercase" />
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 w-full">
          {error && (
            <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-200 text-xs text-center bg-red-500/20 border border-red-500/30 p-2 rounded-lg backdrop-blur-md font-bold shadow-lg"
            >
                {error}
            </motion.div>
          )}
          
          <div className="space-y-3">
            <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
                placeholder={texts.nameLabel} 
                className={inputStyles}
                disabled={loading}
            />
            <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder={texts.emailLabel}
                className={`${inputStyles} ${!!initialEmail ? 'opacity-70 cursor-not-allowed' : ''}`}
                readOnly={!!initialEmail}
                disabled={loading || !!initialEmail}
            />
            <input 
                type="text"
                value={birthDate}
                onChange={handleDateChange}
                required
                placeholder="Data de Nascimento (DD/MM/AAAA)"
                maxLength={10}
                className={inputStyles}
                disabled={loading}
            />
            <div className="grid grid-cols-2 gap-3">
                <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    placeholder={texts.passwordLabel} 
                    className={inputStyles}
                    disabled={loading}
                />
                <input 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    placeholder="Confirmar"
                    className={inputStyles}
                    disabled={loading}
                />
            </div>
          </div>

          {/* CAIXA DE TERMOS - DESTAQUE (Estilo Roxo Sólido) */}
          <div className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all duration-300 shadow-lg mt-4 mb-2 ${
              acceptedLegal 
              ? 'bg-[#4c1d95] border-[#8b5cf6] shadow-[#8b5cf6]/20' // Roxo mais claro quando selecionado
              : 'bg-[#2e1065] border-[#581c87] hover:border-[#7c3aed]' // Roxo muito escuro quando não selecionado
          }`}>
                <div className="relative flex items-center pt-1">
                    <input 
                        type="checkbox" 
                        id="legal"
                        checked={acceptedLegal}
                        onChange={(e) => setAcceptedLegal(e.target.checked)}
                        className="peer h-6 w-6 cursor-pointer appearance-none rounded border-2 border-white/50 bg-transparent checked:border-white checked:bg-white transition-all"
                    />
                    {/* Checkmark customizado */}
                    <i className="fa-solid fa-check text-[#2e1065] absolute left-1 top-1.5 text-sm opacity-0 peer-checked:opacity-100 pointer-events-none"></i>
                </div>
                <label htmlFor="legal" className="text-[11px] text-white leading-relaxed select-none cursor-pointer font-medium">
                    Declaro estar de acordo com os{' '}
                    <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); setViewingDoc('terms'); }} 
                        className="text-blue-400 font-bold hover:text-blue-300 hover:underline cursor-pointer transition-colors bg-transparent border-none p-0 inline"
                    >
                        Termos de Uso
                    </button>
                    {' '}e{' '}
                    <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); setViewingDoc('privacy'); }} 
                        className="text-blue-400 font-bold hover:text-blue-300 hover:underline cursor-pointer transition-colors bg-transparent border-none p-0 inline"
                    >
                        Política de Privacidade
                    </button>
                </label>
          </div>

           <div className="pt-2 flex flex-col gap-3">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-flames text-white font-bold py-3.5 rounded-xl text-base shadow-[0_0_20px_theme(colors.primary/30%)] hover:shadow-[0_0_30px_theme(colors.primary/50%)] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-anton uppercase tracking-wide"
                >
                    {loading ? 'Criando conta...' : <EditableField as="span" isEditing={isEditMode} value={texts.registerButton} onChange={v => onUpdateUiText('register', 'registerButton', v)} />}
                </motion.button>

                <button
                    type="button"
                    onClick={onNavigateToLogin}
                    disabled={loading}
                    className="w-full text-white/80 font-semibold py-2 rounded-xl text-sm transition-colors hover:text-white hover:underline"
                >
                    Voltar para Login
                </button>
            </div>
        </form>
      </motion.div>

      {/* Modais de Documentos */}
      <AnimatePresence>
          {viewingDoc === 'terms' && (
              <LegalModal 
                title="Termos de Uso" 
                content={TERMS_TEXT} 
                onClose={() => setViewingDoc(null)} 
              />
          )}
          {viewingDoc === 'privacy' && (
              <LegalModal 
                title="Política de Privacidade" 
                content={PRIVACY_TEXT} 
                onClose={() => setViewingDoc(null)} 
              />
          )}
      </AnimatePresence>
    </div>
  );
};

export default RegisterPage;
