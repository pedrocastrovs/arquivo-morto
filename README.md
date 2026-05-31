# Arquivo Morto

Sistema web de **gestão de arquivo morto** (documentação física em caixas) para o **Grupo DNA Center**. Controla o ciclo de vida das caixas — cadastro, localização hierárquica no depósito, movimentações, empréstimos, descarte e indicadores operacionais.

---

## Estado do projeto

| Área | Status |
|------|--------|
| Interface (Next.js + shadcn) | Concluída |
| Supabase (Postgres + Auth + RLS) | Configurado |
| Migrations + seed | Aplicados |
| Login e rotas protegidas | Funcionando |
| Estrutura física (`/estrutura`) | Integrada ao Supabase |
| Caixas (`/caixas`) | Integrada ao Supabase |
| Movimentações (`/movimentacoes`) | Integrada ao Supabase |
| Dashboard e demais módulos operacionais | Supabase |
| Deploy produção (Vercel) | Pendente |

**Stack atual:** Next.js 16 + **Supabase**. Módulos operacionais integrados ao banco; [`lib/mock-data.ts`](lib/mock-data.ts) permanece apenas como referência legada.

Documentação complementar:

- **[docs/GUIA-IMPLEMENTACAO.md](docs/GUIA-IMPLEMENTACAO.md)** — roteiro completo até produção
- **[supabase/SETUP.md](supabase/SETUP.md)** — referência de setup do Supabase (já realizado)

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Stack tecnológica](#stack-tecnológica)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e execução](#instalação-e-execução)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Scripts disponíveis](#scripts-disponíveis)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Módulos e rotas](#módulos-e-rotas)
- [Banco de dados (Supabase)](#banco-de-dados-supabase)
- [Autenticação](#autenticação)
- [Camada de dados na UI](#camada-de-dados-na-ui)
- [Etiquetas e impressão](#etiquetas-e-impressão)
- [Convenções de desenvolvimento](#convenções-de-desenvolvimento)
- [Limitações e próximos passos](#limitações-e-próximos-passos)
- [Licença](#licença)

---

## Funcionalidades

| Módulo | Descrição | Dados |
|--------|-----------|-------|
| **Dashboard** | KPIs, gráficos por setor/mês, listas recentes | Supabase |
| **Caixas** | Listagem, busca, filtros, cadastro, etiqueta QR/barcode | Supabase |
| **Estrutura física** | Árvore Local → Rua → Prédio → Andar → Torre → Posição | Supabase |
| **Movimentações** | Histórico e registro de transferências | Supabase |
| **Empréstimos** | Solicitação, retirada, devolução, atrasos | Supabase |
| **Descarte** | Caixas elegíveis e aprovação de descarte | Supabase |
| **Configurações** | Usuários, setores, unidades | Supabase (convite via Auth) |
| **Login** | E-mail/senha via Supabase Auth | Supabase |

### Ciclo de vida da caixa

```
Preparação → Arquivada → Emprestada / Em movimentação
                ↓
        Aguardando descarte → Descartada
```

Status em `lib/types.ts` e no banco (`box_status`): `preparacao`, `arquivada`, `emprestada`, `em_movimentacao`, `aguardando_descarte`, `descartada`.

---

## Stack tecnológica

| Tecnologia | Uso |
|------------|-----|
| [Next.js 16](https://nextjs.org/) | App Router, middleware, Server Components |
| [React 19](https://react.dev/) | Interface |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem |
| [Supabase](https://supabase.com/) | PostgreSQL, Auth, RLS |
| [@supabase/ssr](https://supabase.com/docs/guides/auth/server-side/nextjs) | Sessão em cookies (Next.js) |
| [Tailwind CSS 4](https://tailwindcss.com/) | Estilos |
| [shadcn/ui](https://ui.shadcn.com/) + Radix UI | Componentes |
| [Recharts](https://recharts.org/) | Gráficos |
| [qrcode.react](https://www.npmjs.com/package/qrcode.react) + [react-barcode](https://www.npmjs.com/package/react-barcode) | Etiquetas |
| [@vercel/analytics](https://vercel.com/docs/analytics) | Analytics em produção |

---

## Pré-requisitos

- **Node.js** 20 LTS (mínimo 18.18)
- **npm**, **pnpm** ou **yarn**
- Projeto **Supabase** criado e variáveis em `.env.local` (ver abaixo)
- Usuário cadastrado no Supabase Auth (perfil em `public.profiles`)

---

## Instalação e execução

```bash
git clone <url-do-repositorio>
cd arquivo-morto
npm install
cp .env.example .env.local   # se ainda não existir
# Preencha .env.local com as chaves do Supabase
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000). Rotas internas redirecionam para **`/login`** se não houver sessão.

**Entrar no sistema:** use o e-mail e a senha do usuário criado no Supabase (Authentication → Users). O primeiro administrador deve ter `role = 'administrador'` em `profiles` (ver [supabase/SETUP.md](supabase/SETUP.md)).

```bash
npm run build   # build de produção
npm run start   # servir build local
npm run lint    # ESLint
```

### Supabase CLI (opcional)

```bash
npx supabase login
npx supabase link --project-ref <seu-project-ref>
npx supabase db push    # aplicar novas migrations
```

---

## Variáveis de ambiente

Arquivo **`.env.local`** (não commitar):

| Variável | Descrição |
|----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto (Settings → API) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Chave publicável (`sb_publishable_...`) |
| `SUPABASE_SECRET_KEY` | Chave secreta — **apenas servidor** (`sb_secret_...`) |
| `NEXT_PUBLIC_APP_URL` | URL do app (`http://localhost:3000` em dev) |

Template versionado: [`.env.example`](.env.example).

Chaves legadas `anon` / `service_role` ainda são aceitas em `lib/env.ts` como fallback. Detalhes: [API keys](https://supabase.com/docs/guides/getting-started/api-keys).

---

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Desenvolvimento (porta 3000) |
| `npm run build` | Build de produção |
| `npm run start` | Servir build |
| `npm run lint` | ESLint |

---

## Estrutura do projeto

```
arquivo-morto/
├── app/
│   ├── layout.tsx, page.tsx, globals.css
│   ├── login/                 # Login (Supabase Auth)
│   ├── auth/
│   │   ├── callback/          # OAuth / magic link
│   │   └── signout/           # Encerrar sessão
│   ├── caixas/, estrutura/, movimentacoes/
│   ├── emprestimos/, descarte/, configuracoes/
├── components/
│   ├── *-content.tsx          # UI de cada módulo
│   ├── app-sidebar.tsx, app-header.tsx, user-menu.tsx
│   ├── box-label.tsx
│   └── ui/                    # shadcn/ui
├── lib/
│   ├── types.ts               # Tipos do domínio
│   ├── env.ts                 # Variáveis de ambiente
│   ├── mock-data.ts           # Dados demo (UI, transição)
│   ├── supabase/
│   │   ├── client.ts          # Browser
│   │   ├── server.ts          # Server Components / Actions
│   │   ├── admin.ts           # Service role (servidor)
│   │   └── middleware.ts      # Refresh de sessão
│   └── utils.ts
├── supabase/
│   ├── migrations/            # Schema + RLS
│   ├── seed.sql               # Dados iniciais
│   ├── config.toml
│   └── SETUP.md
├── middleware.ts              # Proteção de rotas
├── docs/GUIA-IMPLEMENTACAO.md
└── package.json
```

### Padrão de página

```
AppSidebar + AppHeader + <Módulo>Content
```

---

## Módulos e rotas

| Rota | Componente | Auth |
|------|------------|------|
| `/login` | `login/page.tsx` | Pública |
| `/` | `DashboardContent` | Protegida |
| `/caixas` | `CaixasContent` | Protegida |
| `/estrutura` | `EstruturaContent` | Protegida |
| `/movimentacoes` | `MovimentacoesContent` | Protegida |
| `/emprestimos` | `EmprestimosContent` | Protegida |
| `/descarte` | `DescarteContent` | Protegida |
| `/configuracoes` | `ConfiguracoesContent` | Protegida |

---

## Banco de dados (Supabase)

Migration principal: [`supabase/migrations/20260531150000_initial_schema.sql`](supabase/migrations/20260531150000_initial_schema.sql)

| Tabela | Função |
|--------|--------|
| `locations` → `positions` | Estrutura física hierárquica |
| `boxes` | Caixas de arquivo |
| `movements` | Log de movimentações |
| `loans` | Empréstimos |
| `profiles` | Perfil e papel (`auth.users`) |
| `sectors`, `units` | Cadastros auxiliares |

**RLS** ativo com papéis: `administrador`, `operador`, `consultante`.

**Triggers:** criação de perfil no signup; sincronização de ocupação de posição; sequência `CX-000001` para códigos de caixa.

Seed: [`supabase/seed.sql`](supabase/seed.sql) (setores, unidades, estrutura “Arquivo Central”).

---

## Autenticação

- **Login:** `signInWithPassword` em `/login` ([`lib/supabase/client.ts`](lib/supabase/client.ts))
- **Middleware:** [`middleware.ts`](middleware.ts) — exige sessão; redireciona para `/login` com `redirectTo`
- **Sessão:** cookies via `@supabase/ssr`
- **Perfil:** tabela `profiles` + [`components/user-menu.tsx`](components/user-menu.tsx)
- **Sair:** `POST /auth/signout`

URLs no Supabase (dev): Site URL e Redirect URLs = `http://localhost:3000` / `http://localhost:3000/**`.

---

## Camada de dados na UI

**Próximo trabalho:** Fase 11 — deploy Vercel, variáveis de produção e smoke test completo.

---

## Etiquetas e impressão

[`components/box-label.tsx`](components/box-label.tsx): QR Code, código de barras e layout para `@media print`.

---

## Convenções de desenvolvimento

- Imports com alias `@/`
- Módulos interativos: `"use client"` em `*-content.tsx`
- Idioma da UI: português (Brasil)
- Novos componentes shadcn: [`components.json`](components.json)

### Novo módulo

1. `app/<rota>/page.tsx` (shell)
2. `components/<rota>-content.tsx`
3. Entrada em `app-sidebar.tsx`
4. Tipos em `types.ts`; queries em `lib/db/` quando integrar ao Supabase

---

## Limitações e próximos passos

| Item | Situação |
|------|----------|
| Persistência nas telas | Mock; banco pronto |
| Busca no header | Decorativa |
| `typescript.ignoreBuildErrors: true` | Ajustar antes do deploy |
| Deploy Vercel + env de produção | Pendente (Fase 11 do guia) |

**Roadmap imediato:** integrar módulos ao Postgres → dashboard real → deploy. Detalhes em [docs/GUIA-IMPLEMENTACAO.md](docs/GUIA-IMPLEMENTACAO.md).

---

## Licença

Projeto privado — **Grupo DNA Center**. Uso e distribuição sujeitos à política interna da organização.

---

## Suporte

Dúvidas operacionais ou acesso corporativo: equipe de TI / suporte interno do Grupo DNA Center.
