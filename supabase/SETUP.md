# Configurar Supabase (primeira vez)

## 1. Aplicar migrations no projeto cloud

```bash
npx supabase login
npx supabase link --project-ref ueqvynrgbjgddcyopajz
npx supabase db push
```

Ou cole no **SQL Editor** e execute, nesta ordem:

1. `migrations/20260531150000_initial_schema.sql`
2. `migrations/20260531200000_operador_structure_write.sql` — operadores editarem estrutura  
   (se der erro RLS em `locations`, use `fix-rls-estrutura.sql`)
3. `migrations/20260531300000_register_movement.sql` — registrar movimentações
4. `migrations/20260531400000_loans_workflow.sql` — empréstimos (criar, retirada, devolução, atrasos)
5. `migrations/20260531500000_discard_workflow.sql` — descarte (elegíveis + aprovação admin)

## 2. Seed (dados iniciais)

No SQL Editor, execute `seed.sql` ou:

```bash
npx supabase db seed
```

## 3. Criar primeiro usuário

1. Dashboard → **Authentication → Users → Add user**
2. E-mail e senha do administrador
3. Confirme o e-mail (ou desative confirmação em Auth settings para dev)

## 4. Definir papel do usuário

Papéis: `administrador`, `operador`, `consultante`.

- **Consultante:** só leitura.
- **Operador e administrador:** cadastram caixas e podem alterar a estrutura física (após migration `20260531200000_operador_structure_write.sql`).
- **Administrador:** também gerencia usuários e configurações (quando integrado).

No SQL Editor (substitua o e-mail):

```sql
update public.profiles
set role = 'administrador'
where email = 'seu.email@empresa.com';
```

## 5. URLs de autenticação (dev)

**Authentication → URL Configuration**

- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/**`

## 6. Testar

```bash
npm run dev
```

Acesse http://localhost:3000 → deve redirecionar para `/login`. Entre com o usuário criado.
