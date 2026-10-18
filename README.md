# Záfora — Loja de moda

Loja virtual de roupas da Záfora. O cliente cria a conta, navega pela coleção, monta o carrinho e, ao clicar em **Finalizar compra**, é levado ao WhatsApp da loja com o pedido já escrito. Valores finais, frete e pagamento são combinados na conversa: o site **não** processa pagamentos nem calcula frete.

**Tecnologias:** React 19 · TypeScript · Vite · TanStack Router · Tailwind CSS 4 · Firebase no **plano gratuito (Spark)**: Authentication, Firestore e Analytics. O Firebase Storage **não** é necessário.

---

## Sumário

1. [Como rodar localmente](#1-como-rodar-localmente)
2. [Configuração do Firebase (passo a passo)](#2-configuração-do-firebase-passo-a-passo)
3. [Regras de segurança](#3-regras-de-segurança)
4. [Como tornar uma conta administradora](#4-como-tornar-uma-conta-administradora)
5. [Publicação (deploy)](#5-publicação-deploy)
6. [Estrutura do projeto](#6-estrutura-do-projeto)
7. [Modelo de dados](#7-modelo-de-dados)
8. [Perguntas frequentes](#8-perguntas-frequentes)

---

## 1. Como rodar localmente

**Pré-requisitos:** [Node.js](https://nodejs.org) 20 ou superior (recomendado 22 LTS) e npm.

```bash
# 1. Entre na pasta do projeto
cd zafora

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Abra **http://localhost:5173**.

> Na primeira execução, o Vite gera automaticamente o arquivo `src/routeTree.gen.ts` com as rotas da aplicação.

Antes que tudo funcione, conclua a [configuração do Firebase](#2-configuração-do-firebase-passo-a-passo). Sem as regras publicadas, a loja mostrará o aviso "Sem permissão para ler os produtos".

### Comandos disponíveis

| Comando             | O que faz                                              |
| ------------------- | ------------------------------------------------------ |
| `npm run dev`       | Servidor de desenvolvimento com recarregamento.        |
| `npm run build`     | Gera a versão de produção na pasta `dist/`.            |
| `npm run preview`   | Serve localmente a versão de produção já gerada.       |
| `npm run typecheck` | Verifica os tipos (rode `npm run dev` ou `build` antes). |
| `npm test`          | Executa os testes (catálogo, mensagem do WhatsApp…).   |
| `npm run lint`      | Analisa o código com ESLint.                           |

---

## 2. Configuração do Firebase (passo a passo)

As credenciais do projeto `zafora-d0d33` já estão em `src/services/firebase.ts`. Falta ativar os serviços no [console do Firebase](https://console.firebase.google.com/project/zafora-d0d33).

### 2.1 Authentication

1. Menu **Build → Authentication → Get started**.
2. Aba **Sign-in method**:
   - **E-mail/senha** → *Enable* → *Save*.
   - **Google** → *Enable* → escolha o e-mail de suporte do projeto → *Save*.
3. Aba **Settings → Authorized domains**: `localhost` já vem autorizado. Ao publicar o site, adicione o seu domínio (ex.: `zafora.com.br`). Os domínios `zafora-d0d33.web.app` e `zafora-d0d33.firebaseapp.com` já são autorizados.

### 2.2 Firestore Database

1. Menu **Build → Firestore Database → Create database**.
2. Escolha a região **`southamerica-east1` (São Paulo)**. Ela não pode ser alterada depois.
3. Inicie em **modo de produção** e publique as regras da [seção 3](#3-regras-de-segurança).

### 2.3 Fotos dos produtos (sem Storage)

Para funcionar no plano gratuito, as fotos **não usam o Firebase Storage** (que exige o plano Blaze). Ao cadastrar uma peça, o painel reduz e comprime cada foto no próprio navegador (WebP, até 1200 px) e grava:

- `products/{id}.cover`: uma miniatura (~40 KB) usada na vitrine, no carrinho e no painel;
- `productImages/{id}.images`: até 5 fotos da galeria (~170 KB cada), carregadas só na página do produto.

Não há nada a ativar além do Firestore. Limites do plano gratuito que importam aqui: 1 GiB armazenado (centenas de produtos) e 10 GiB/mês de download, o suficiente para uma loja pequena.

### 2.4 Analytics (opcional)

O Google Analytics já está ligado pelo `measurementId`. Os dados aparecem em **Analytics → Dashboard** em até 24 h. Em navegadores que bloqueiam rastreamento, o Analytics é simplesmente desativado, sem afetar a loja.

---

## 3. Regras de segurança

As regras estão versionadas em `firestore.rules`. Há duas formas de publicá-las.

### Opção A: pelo console (copiar e colar)

- **Firestore Database → Rules**: substitua o conteúdo pelo de `firestore.rules` → **Publish**.

### Opção B: pelo Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

O arquivo `.firebaserc` já aponta para o projeto `zafora-d0d33`.

### O que as regras garantem

| Coleção / caminho                | Leitura                                         | Escrita                                         |
| -------------------------------- | ----------------------------------------------- | ----------------------------------------------- |
| `products/{id}`                  | Qualquer visitante, **somente se `visible == true`**. Admin lê todos. | Somente admin, com validação dos campos.       |
| `users/{uid}`                    | O próprio cliente (e o admin).                  | O próprio cliente, apenas `name`, `email`, `phone` e datas. |
| `carts/{uid}`                    | O próprio cliente.                              | O próprio cliente (até 100 itens).              |
| `admins/{uid}`                   | O próprio usuário (para saber se é admin).      | **Ninguém pelo app**: só pelo console.          |
| `productImages/{id}`             | Qualquer visitante, se o produto estiver visível. | Somente admin; até 5 fotos.                   |
| Qualquer outro caminho           | Bloqueado.                                      | Bloqueado.                                      |

Os índices não precisam de configuração extra: a loja filtra apenas por `visible` e ordena no navegador.

---

## 4. Como tornar uma conta administradora

O painel (`/admin`) só abre para usuários cadastrados na coleção `admins`. Por segurança, isso é feito manualmente no console:

1. Rode o site e **crie a conta** do dono da loja em `/entrar` (e-mail/senha ou Google).
2. Acesse `/admin`. A tela "Acesso restrito" mostra o **UID** da conta; copie-o. O UID também aparece em **Authentication → Users**.
3. No console: **Firestore Database → Start collection** →
   - Collection ID: `admins`
   - Document ID: **cole o UID**
   - Adicione um campo qualquer, por exemplo `role` (string) = `owner` → **Save**.
4. Recarregue a página. O link **Painel** aparece no menu e o painel é liberado.

### Primeiro acesso ao painel

- **Importar peças iniciais**: com o catálogo vazio, o botão envia as 8 peças de exemplo (com fotos) para o Firestore. Edite ou exclua à vontade.
- **Novo produto**: nome, descrição, preço base, categoria, tamanhos, cores, selo, visibilidade e até 5 imagens (arraste e solte; a primeira é a capa; as fotos são otimizadas automaticamente).
- **Gestão**: editar, ocultar/exibir (sem excluir) e excluir (remove também as fotos).

Toda alteração aparece na loja **em tempo real** (`onSnapshot`), sem recarregar a página.

---

## 5. Publicação (deploy)

O projeto é uma SPA estática. Com o Firebase Hosting (já configurado em `firebase.json`):

```bash
npm run build
firebase deploy --only hosting
```

O site ficará em `https://zafora-d0d33.web.app`. Para outro provedor (Vercel, Netlify etc.), publique a pasta `dist/` e configure o *rewrite* de todas as rotas para `index.html`.

---

## 6. Estrutura do projeto

```
src/
├── services/
│   ├── firebase.ts        # Inicialização do Firebase (Auth, Firestore, Analytics)
│   ├── products.ts        # CRUD de produtos, upload/remoção de imagens, assinaturas em tempo real
│   ├── users.ts           # Perfil do cliente, verificação de admin e carrinho remoto
│   └── seed.ts            # Importação das peças iniciais
├── contexts/
│   ├── auth.tsx           # Sessão do usuário (e-mail/senha e Google), perfil e flag de admin
│   ├── products.tsx       # Catálogo público em tempo real
│   └── cart.tsx           # Carrinho (localStorage + sincronização com o Firestore)
├── lib/
│   └── order-message.ts   # Montagem da mensagem e do link do WhatsApp
├── data/
│   ├── config.ts          # Marca, número do WhatsApp, categorias, tamanhos e selos
│   ├── products.ts        # Filtros, ordenação, formatação de preço e slugs
│   ├── demo-products.ts   # Peças iniciais para importação
│   └── seo.ts             # Metadados das páginas
├── components/
│   ├── store/             # Layout, vitrine e componentes da loja
│   ├── admin/             # Formulário e dados do painel
│   ├── auth/              # Proteção de rotas e ícone do Google
│   └── ui/                # Componentes base (botões, inputs, diálogos…)
├── routes/                # Páginas (roteamento por arquivos)
│   ├── index.tsx              /
│   ├── colecao.tsx            /colecao
│   ├── busca.tsx              /busca
│   ├── produto.$slug.tsx      /produto/:slug
│   ├── carrinho.tsx           /carrinho
│   ├── entrar.tsx             /entrar        (login e cadastro)
│   ├── conta.tsx              /conta         (área do cliente)
│   ├── admin.tsx              /admin         (layout protegido)
│   ├── admin.index.tsx        /admin         (lista de produtos)
│   ├── admin.produtos.novo.tsx  /admin/produtos/novo
│   ├── admin.produtos.$id.tsx   /admin/produtos/:id
│   ├── sobre.tsx / contato.tsx
│   └── __root.tsx             (cabeçalho, rodapé e notificações)
└── types/store.ts         # Tipos Product, CartItem, UserProfile
```

### Mensagem enviada ao WhatsApp

Ao finalizar, o cliente é levado para `https://wa.me/5582988487506?text=…` com o texto codificado por `encodeURIComponent`:

```
Olá, Záfora! Gostaria de finalizar o seguinte pedido:

*Cliente:* Maria Silva
*E-mail:* maria@exemplo.com

*Itens do pedido:*
1. Vestido Aurora
   Tamanho: M | Cor: Vinho
   Qtd: 2 × R$ 359,00 = R$ 718,00
2. Bolsa Raiz
   Qtd: 1 × R$ 219,00 = R$ 219,00

*Total aproximado:* R$ 937,00 (3 peças, sem frete)

Poderia me informar o valor do frete para o meu endereço e a chave de pagamento para concluirmos a compra? Obrigado(a)!
```

Para trocar o número, edite `whatsappNumber` em `src/data/config.ts` (somente dígitos, com 55 e DDD).

---

## 7. Modelo de dados

**`products/{id}`**

| Campo         | Tipo                         | Exemplo                       |
| ------------- | ---------------------------- | ----------------------------- |
| `name`        | string                       | `"Vestido Aurora"`            |
| `slug`        | string (URL)                 | `"vestido-aurora"`            |
| `description` | string                       | …                             |
| `price`       | number (preço base em R$)    | `359`                         |
| `category`    | string                       | `"Vestidos"`                  |
| `sizes`       | string[]                     | `["P","M","G","GG"]`          |
| `colors`      | string[]                     | `["Vinho"]`                   |
| `cover`       | string (data URL WebP)       | miniatura comprimida          |
| `imageCount`  | number                       | `2`                           |
| `tag`         | string                       | `"Novidade"`                  |
| `visible`     | boolean                      | `true`                        |
| `composition`, `care` | string               | opcional                      |
| `createdAt`, `updatedAt` | timestamp         | gerado pelo servidor          |

**`users/{uid}`**: `name`, `email`, `phone`, `createdAt`, `updatedAt`
**`carts/{uid}`**: `items` (lista do carrinho), `updatedAt`
**`admins/{uid}`**: qualquer campo (ex.: `role: "owner"`)

---

## 8. Perguntas frequentes

**"Sem permissão para ler os produtos."**
As regras do Firestore não foram publicadas (seção 3) ou o banco ainda não foi criado.

**Erro ao salvar o produto com imagens.**
Confira se o seu UID está em `admins` e se as regras do Firestore publicadas são as de `firestore.rules` (com o bloco `productImages`). Se a mensagem falar em imagens grandes demais, remova uma foto.

**Login com Google mostra "domínio não autorizado".**
Adicione o domínio em **Authentication → Settings → Authorized domains**.

**O popup do Google não abre no celular.**
O app troca automaticamente para o login por redirecionamento quando o navegador bloqueia popups.

**Onde altero categorias, tamanhos e textos da marca?**
Em `src/data/config.ts`. Estilos globais ficam em `src/styles.css`.
