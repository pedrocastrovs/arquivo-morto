# Arquivo Morto

Sistema web de **gestão de arquivo morto** (documentação física em caixas) para o **Grupo DNA Center**. Controla o ciclo de vida das caixas — cadastro, localização hierárquica no depósito, movimentações, empréstimos, descarte e indicadores operacionais.

> **Estado atual:** protótipo de interface (frontend) com dados mockados. Não há API, banco de dados nem autenticação persistente.

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Stack tecnológica](#stack-tecnológica)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e execução](#instalação-e-execução)
- [Scripts disponíveis](#scripts-disponíveis)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Módulos e rotas](#módulos-e-rotas)
- [Modelo de domínio](#modelo-de-domínio)
- [Camada de dados](#camada-de-dados)
- [Autenticação](#autenticação)
- [Etiquetas e impressão](#etiquetas-e-impressão)
- [Convenções de desenvolvimento](#convenções-de-desenvolvimento)
- [Limitações conhecidas](#limitações-conhecidas)
- [Roadmap sugerido](#roadmap-sugerido)
- [Licença](#licença)

---

## Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| **Dashboard** | KPIs (caixas, movimentações, empréstimos, ocupação, descarte), gráficos por setor e por mês, listas recentes |
| **Caixas** | Listagem, busca, filtros por status, cadastro em diálogo, detalhes, geração de etiqueta |
| **Estrutura física** | Árvore hierárquica do depósito com indicação de posições livres/ocupadas |
| **Movimentações** | Histórico e registro de transferências entre localizações |
| **Empréstimos** | Solicitações, retirada, prazos, devolução e status (pendente, em andamento, devolvido, atrasado) |
| **Descarte** | Caixas elegíveis e fluxo de aprovação para descarte |
| **Configurações** | Gestão visual de usuários, setores e unidades (mock local) |
| **Login** | Tela de entrada com branding; redirecionamento simulado |

### Ciclo de vida da caixa

```
Preparação → Arquivada → Emprestada / Em movimentação
                ↓
        Aguardando descarte → Descartada
```

Status definidos em `lib/types.ts`: `preparacao`, `arquivada`, `emprestada`, `em_movimentacao`, `aguardando_descarte`, `descartada`.

---

## Stack tecnológica

| Tecnologia | Uso |
|------------|-----|
| [Next.js 16](https://nextjs.org/) | App Router, rotas e renderização |
| [React 19](https://react.dev/) | Interface e componentes client |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem do domínio e componentes |
| [Tailwind CSS 4](https://tailwindcss.com/) | Estilos utilitários |
| [shadcn/ui](https://ui.shadcn.com/) + Radix UI | Componentes acessíveis (estilo *new-york*) |
| [Recharts](https://recharts.org/) | Gráficos do dashboard |
| [Lucide React](https://lucide.dev/) | Ícones |
| [react-hook-form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | Formulários (dependências instaladas) |
| [qrcode.react](https://www.npmjs.com/package/qrcode.react) + [react-barcode](https://www.npmjs.com/package/react-barcode) | Etiquetas com QR Code e código de barras |
| [@vercel/analytics](https://vercel.com/docs/analytics) | Analytics em produção |

---

## Pré-requisitos

- **Node.js** 18.18 ou superior (recomendado: 20 LTS)
- **npm**, **pnpm** ou **yarn** para instalar dependências

---

## Instalação e execução

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd arquivo-morto

# Instalar dependências
npm install

# Ambiente de desenvolvimento (http://localhost:3000)
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

**Login de demonstração:** acesse `/login`, informe qualquer e-mail e senha válidos no formulário e aguarde o redirecionamento automático para o dashboard (simulação de 1 segundo).

```bash
# Build de produção
npm run build

# Servir build localmente
npm run start
```

Não é necessário arquivo `.env` para rodar o protótipo atual.

---

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento com hot reload |
| `npm run build` | Gera build otimizado em `.next/` |
| `npm run start` | Executa o build de produção |
| `npm run lint` | Executa ESLint no projeto |

---

## Estrutura do projeto

```
arquivo-morto/
├── app/                      # Rotas (Next.js App Router)
│   ├── layout.tsx            # Layout raiz, metadata, analytics
│   ├── globals.css           # Tokens de tema e estilos globais
│   ├── page.tsx              # Dashboard (/)
│   ├── login/                # Tela de login (layout isolado)
│   ├── caixas/
│   ├── estrutura/
│   ├── movimentacoes/
│   ├── emprestimos/
│   ├── descarte/
│   └── configuracoes/
├── components/
│   ├── *-content.tsx         # Lógica e UI de cada módulo
│   ├── app-sidebar.tsx       # Navegação lateral
│   ├── app-header.tsx        # Cabeçalho (busca, usuário, notificações)
│   ├── box-label.tsx         # Etiqueta imprimível da caixa
│   └── ui/                   # Componentes shadcn/ui
├── lib/
│   ├── types.ts              # Tipos do domínio
│   ├── mock-data.ts          # Dados fictícios para desenvolvimento
│   └── utils.ts              # Utilitários (ex.: cn)
├── hooks/                    # Hooks compartilhados
├── public/                   # Ícones e assets estáticos
├── next.config.mjs
├── components.json           # Configuração shadcn
└── package.json
```

### Padrão de página

Cada rota autenticada repete o shell da aplicação:

```
AppSidebar + AppHeader + <Módulo>Content
```

O conteúdo específico fica em `components/<modulo>-content.tsx`, mantendo `app/<modulo>/page.tsx` enxuto.

---

## Módulos e rotas

| Rota | Componente | Responsabilidade |
|------|------------|------------------|
| `/` | `DashboardContent` | Indicadores e gráficos |
| `/caixas` | `CaixasContent` | CRUD visual de caixas |
| `/estrutura` | `EstruturaContent` | Árvore do depósito |
| `/movimentacoes` | `MovimentacoesContent` | Histórico e novas movimentações |
| `/emprestimos` | `EmprestimosContent` | Controle de empréstimos |
| `/descarte` | `DescarteContent` | Gestão de descarte |
| `/configuracoes` | `ConfiguracoesContent` | Usuários, setores, unidades |
| `/login` | `login/page.tsx` | Autenticação simulada |

---

## Modelo de domínio

Definições centralizadas em [`lib/types.ts`](lib/types.ts).

### Estrutura física (endereçamento)

Hierarquia aninhada para localizar caixas no depósito:

```
Local
 └── Rua
      └── Prédio
           └── Andar
                └── Torre
                     └── Posição (livre ou ocupada)
```

### Entidades principais

| Entidade | Campos relevantes |
|----------|-------------------|
| **Box** | `code`, `barcode`, setor, unidade, responsável, `documentType`, datas, `status`, `locationPath`, `positionId` |
| **Movement** | caixa, data/hora, usuário, local anterior/novo, motivo |
| **Loan** | solicitante, setor, datas de retirada/devolução, `status` |
| **User** | nome, e-mail, `role` (administrador \| operador \| consultante), setor |

### Tipos de documento

`financeiro`, `rh`, `contratos`, `assistencial`, `administrativo`, `juridico`

---

## Camada de dados

Os dados vêm de [`lib/mock-data.ts`](lib/mock-data.ts):

| Export | Conteúdo |
|--------|----------|
| `mockLocations` | Estrutura física completa |
| `mockBoxes` | Caixas de exemplo |
| `mockMovements` | Movimentações |
| `mockLoans` | Empréstimos |
| `mockDashboardStats` | KPIs do dashboard |
| `mockSectorStats` | Distribuição por setor |
| `mockMonthlyMovements` | Série mensal para gráficos |

Os componentes importam esses arrays e inicializam estado local com `useState`. **Alterações feitas na UI não são persistidas** — ao recarregar a página, os dados voltam ao mock original.

```
mock-data.ts  →  import  →  *-content.tsx (useState)  →  UI
```

Não existem rotas em `app/api/` nem integração com banco.

---

## Autenticação

- A rota `/login` simula autenticação com `setTimeout` e `router.push("/")`.
- **Não há** middleware de proteção de rotas: páginas como `/caixas` podem ser acessadas diretamente.
- O header exibe usuário fixo (“Admin”) apenas como placeholder visual.

Para evoluir o projeto, o fluxo típico seria: provedor de auth (NextAuth, Clerk, etc.), sessão/JWT, `middleware.ts` e API protegida.

---

## Etiquetas e impressão

O componente [`components/box-label.tsx`](components/box-label.tsx) gera etiquetas com:

- Código da caixa e metadados (setor, tipo, datas)
- **QR Code** com payload estruturado (`BOX:…|BC:…|SECTOR:…`)
- **Código de barras** (EAN-13 a partir do valor de `box.barcode`)

Na tela de caixas, o diálogo de etiqueta permite visualizar e imprimir via CSS `@media print`.

---

## Convenções de desenvolvimento

- **Alias de import:** `@/` aponta para a raiz do projeto (`tsconfig.json`).
- **Componentes client:** módulos interativos usam `"use client"` nos arquivos `*-content.tsx`.
- **UI:** novos componentes shadcn podem ser adicionados com a CLI, seguindo [`components.json`](components.json).
- **Idioma da interface:** português (Brasil), `lang="pt-BR"` no layout raiz.

### Adicionar um novo módulo

1. Criar `app/<rota>/page.tsx` com o shell (sidebar + header).
2. Criar `components/<rota>-content.tsx` com a lógica.
3. Registrar o item em `components/app-sidebar.tsx` (`navigation`).
4. Estender `lib/types.ts` e `lib/mock-data.ts` se houver novas entidades.

---

## Limitações conhecidas

- Dados apenas em memória (mock); sem persistência.
- Login e permissões não implementados de fato.
- Busca global no header é decorativa (não filtra dados).
- `next.config.mjs` define `typescript.ignoreBuildErrors: true` — erros de tipo podem passar no build.
- Imagens configuradas como `unoptimized: true`.
- Nome do pacote em `package.json` ainda é `my-project` (placeholder).

---

## Roadmap sugerido

1. **Backend** — API REST ou tRPC + PostgreSQL (ou similar) modelando `types.ts`.
2. **Autenticação** — login real, papéis (`UserRole`) e proteção de rotas.
3. **Persistência** — substituir `mock-data` por fetch/server actions.
4. **Auditoria** — log imutável de movimentações e descartes.
5. **Integrações** — leitura de QR/código de barras via câmera ou leitor USB.
6. **Relatórios** — exportação PDF/Excel de inventário e descartes.
7. **Testes** — E2E (Playwright) nos fluxos críticos de caixa e empréstimo.

---

## Licença

Projeto privado — **Grupo DNA Center**. Uso e distribuição sujeitos à política interna da organização.

---

## Suporte

Para dúvidas operacionais ou acesso ao sistema em ambiente corporativo, contate a equipe de TI ou suporte interno do Grupo DNA Center.
