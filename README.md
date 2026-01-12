
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# NowFit - Instruções de Configuração do Banco de Dados

Se você está recebendo erros de dependência ao tentar resetar o banco de dados, siga estas instruções para abrir o seu "terminal" de banco de dados.

## 🚀 Como Aplicar as Mudanças no Supabase

O Supabase não possui um terminal de linha de comando direto no painel web, mas ele possui o **SQL Editor**, que funciona como o seu console de comandos.

1.  Acesse seu projeto em [database.new](https://supabase.com/dashboard/projects).
2.  No menu lateral esquerdo, clique em **SQL Editor** (ícone `>_`).
3.  Clique em **+ New query**.
4.  Abra o arquivo `fix_db.sql` deste projeto.
5.  Copie **TODO** o conteúdo do arquivo.
6.  Cole no editor do Supabase e clique no botão **Run** (ou use `Cmd + Enter` / `Ctrl + Enter`).

### O que este script faz?
- **CASCADE**: Resolve os erros de dependência que você encontrou anteriormente.
- **RPC Functions**: Cria as funções `increment_flame` e `decrement_flame` necessárias para o sistema de recompensas.
- **Profiles Trigger**: Garante que toda vez que um usuário se cadastrar, o perfil dele seja criado automaticamente na tabela `profiles`.

## 🛠️ Variáveis de Ambiente
Certifique-se de que o seu arquivo `.env.local` contenha as chaves corretas:
```
GEMINI_API_KEY=sua_chave
SUPABASE_URL=https://lrmvfnapaghuogwhhwxa.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---
Dúvidas? Entre em contato com o suporte em `suporte@nowfit.app`.
