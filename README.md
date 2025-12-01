<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/temp/1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a `.env.local` file in the root of the project.
3. Add your environment variables to `.env.local`:
   ```
   GEMINI_API_KEY=sua_chave_gemini_aqui
   SUPABASE_URL=sua_url_do_supabase_aqui
   SUPABASE_KEY=sua_chave_anon_do_supabase_aqui
   ```
4. Run the app:
   `npm run dev`

## Solução de Problemas com Banco de Dados

Se você encontrar o erro **"Database error saving new user"** ou **"relation public.profiles does not exist"**, siga estes passos:

1.  Acesse o painel do seu projeto no **Supabase**.
2.  Vá para a seção **SQL Editor**.
3.  Copie o conteúdo do arquivo `fix_db.sql` que está na raiz deste projeto.
4.  Cole no editor e clique em **Run**.

Isso irá corrigir as permissões de criação de perfil e remover gatilhos conflitantes.
