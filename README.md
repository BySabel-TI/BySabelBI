# 🏍️ Shineray Dashboard

Dashboard administrativo para gestão de vendas e estoque da Shineray (Região Norte/Nordeste).
Desenvolvido com **Next.js 14**, **Tailwind CSS**, **Supabase** e integração com **Microwork Cloud**.

![Dashboard Preview](./public/dashboard-preview.png)

## 🚀 Funcionalidades

- **Visão Geral**: KPIs de faturamento, vendas e ticket médio.
- **Ranking de Vendedores**: Acompanhamento em tempo real do desempenho individual.
- **Análise Comercial**: Tabela detalhada por filial com metas e percentuais de atingimento.
- **Estoque**: Visualização de disponibilidade de produtos.
- **Gestão de Metas**: Interface para definição de metas mensais por loja.

## 🛠️ Tecnologias

- **Frontend**: Next.js 14 (App Router), React, TypeScript.
- **Estilização**: Tailwind CSS, Shadcn/UI (Radix UI).
- **Gráficos**: Recharts.
- **Backend/Auth**: Supabase (PostgreSQL + Auth).
- **Integração**: API Microwork Cloud (via Proxy Route).

## 📦 Instalação

### Pré-requisitos

- Node.js 18+
- NPM ou Yarn

### Passos

1.  Clone o repositório:

    ```bash
    git clone https://github.com/seu-usuario/shineray-dashboard.git
    cd shineray-dashboard
    ```

2.  Instale as dependências:

    ```bash
    npm install
    ```

3.  Configure as Variáveis de Ambiente:
    Crie um arquivo `.env.local` na raiz do projeto e adicione as chaves (solicite ao administrador do projeto):

    ```env
    MICROWORK_TOKEN=seu_token_aqui
    NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
    NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon
    ```

4.  Rode o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
    Acesse [http://localhost:3000](http://localhost:3000).

## 🚢 Deploy (Vercel)

Este projeto é otimizado para deploy na [Vercel](https://vercel.com).

1.  Importe o projeto na Vercel.
2.  Configure as **Environment Variables** (as mesmas do `.env.local`).
3.  O comando de build padrão (`next build`) será utilizado.

> Veja o guia detalhado em [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md).

## 📂 Estrutura de Pastas

- `src/app`: Rotas e páginas (App Router).
- `src/components`: Componentes reutilizáveis (UI, Dashboard, Layout).
- `src/lib`: Funções utilitárias, formatadores e constantes.
- `src/services`: Camada de comunicação com APIs.
- `src/store`: Gerenciamento de estado global (Zustand).

---

Desenvolvido por **Antigravity** para Shineray.
