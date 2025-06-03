# E-commerce Minimalista - Projeto de Portfólio

Este é um projeto de portfólio que demonstra a construção de uma plataforma de e-commerce minimalista, focando nas funcionalidades essenciais e boas práticas de desenvolvimento.

## Visão Geral

O objetivo deste projeto não é replicar um sistema de e-commerce completo como a Amazon, mas sim construir os pilares fundamentais, demonstrando habilidades em desenvolvimento full-stack com foco em tecnologias .NET e React. Ele serve como uma peça de portfólio para ilustrar a capacidade de lidar com diferentes aspectos do desenvolvimento de software, desde o backend e design de API até a interface do usuário e interações no frontend.

## Tecnologias Chave Utilizadas

**Backend:**
* **Linguagem:** C#
* **Framework:** ASP.NET Core Web API (.NET 8)
* **ORM:** Entity Framework Core 8
* **Banco de Dados:** SQL Server
* **Autenticação:** ASP.NET Core Identity (com JWT para futuras integrações)
* **Arquitetura:** Princípios de Arquitetura Limpa (Domain, Application, Infrastructure, API)

**Frontend:**
* **Framework/Biblioteca:** React (com Vite)
* **Roteamento:** React Router DOM
* **Gerenciamento de Estado (Carrinho/Auth):** React Context API
* **Estilização:** CSS (inline/básico, com espaço para frameworks como Bootstrap/Tailwind CSS)

**Ferramentas e Outros:**
* **IDE (Backend):** (Indique a sua, ex: Visual Studio / VS Code com C# Dev Kit)
* **IDE (Frontend):** VS Code
* **Controle de Versão:** Git e GitHub
* **Gerenciador de Pacotes (Backend):** NuGet
* **Gerenciador de Pacotes (Frontend):** npm
* **Documentação da API:** Swagger (OpenAPI) via Swashbuckle

## Práticas de Segurança

Este projeto implementa e considera as seguintes boas práticas de segurança, essenciais para uma aplicação web moderna, mesmo sendo um projeto de portfólio:

* **Prevenção contra SQL Injection:**
    * Todas as interações com o banco de dados no backend (ASP.NET Core) são realizadas através do **Entity Framework Core (EF Core)**. O EF Core, por padrão, utiliza **consultas parametrizadas** para todas as operações de banco de dados (LINQ to Entities, `DbSet` operations, etc.). Isso efetivamente previne ataques de SQL Injection, pois os valores de entrada são tratados como parâmetros de dados e não como parte do código SQL executável.

* **Prevenção contra XSS (Cross-Site Scripting):**
    * No frontend (React), a renderização de dados no DOM é feita de forma segura. Por padrão, o React **sanitiza as strings** ao inseri-las no HTML (escapando caracteres especiais), tratando-as como texto puro e não como código HTML executável. Isso mitiga a maioria dos ataques de XSS, a menos que seja intencionalmente utilizado `dangerouslySetInnerHTML` sem a devida sanitização prévia no backend.

* **Autenticação e Autorização Robusta:**
    * O backend utiliza **ASP.NET Core Identity** para gerenciamento de usuários e senhas. Ele lida com hashing de senhas, gerenciamento de usuários e roles de forma segura.
    * A autenticação de APIs é baseada em **JSON Web Tokens (JWT)**. Os tokens são gerados e validados com uma chave secreta forte e incluem claims de role para autorização.
    * Endpoints críticos da API (como gestão de produtos e pedidos no Admin) são protegidos com atributos `[Authorize(Roles = "Admin")]` no backend.
    * O frontend gerencia o estado de autenticação (token e usuário) de forma persistente via `localStorage` e implementa proteção de rota (`ProtectedRoute.jsx`) baseada no status de autenticação e nas roles do usuário logado.

* **Headers de Segurança HTTP:**
    * A API backend (ASP.NET Core) adiciona cabeçalhos de segurança HTTP importantes a todas as suas respostas, aprimorando a proteção contra diversas vulnerabilidades comuns:
        * `X-Content-Type-Options: nosniff` (Previne que navegadores tentem "adivinhar" o tipo de MIME do conteúdo, o que pode levar a ataques de XSS).
        * `X-Frame-Options: DENY` (Previne ataques de "clickjacking" ao impedir que a página seja incorporada em `<iframe>`, `<frame>`, `<object>`).
        * `Referrer-Policy: no-referrer-when-downgrade` (Controla qual informação de referrer é enviada em requisições de navegação, melhorando a privacidade e segurança).
        * `Permissions-Policy: geolocation=(), microphone=()` (Permite controlar o acesso a recursos do navegador como geolocalização e microfone).
        *(Nota: Content-Security-Policy (CSP) é uma medida de segurança poderosa, mas mais complexa de configurar, e não foi implementada neste MVP para simplificar, mas é uma próxima etapa recomendada para produção).*

## Funcionalidades Essenciais Implementadas (MVP)

* **Épico 1: Configuração e Estrutura do Projeto**
    * Estrutura de solução com Arquitetura Limpa.
    * Configuração do Entity Framework Core e conexão com SQL Server.
    * Setup inicial dos projetos backend e frontend.
    * Configuração de CORS e tratamento global de exceções.
    * Controle de versão com Git.

* **Épico 2: Catálogo de Produtos**
    * [Backend] API para Criação (POST) e Leitura (GET lista, GET por ID) de produtos.
    * [Frontend] Listagem de produtos com nome, descrição curta, preço e imagem.
    * [Frontend] Visualização detalhada de um produto.
    * *(Validações básicas de produto e CRUD completo de produto (Update/Delete) e Categorias foram adiados para refinamento futuro).*

* **Épico 3: Carrinho de Compras**
    * [Backend] Persistência do carrinho em banco de dados (entidades `Cart`, `CartItem`).
    * [Backend] API para adicionar item, visualizar carrinho, atualizar quantidade e remover item.
    * [Frontend] Exibição do ícone/resumo do carrinho com atualização dinâmica da contagem de itens (via Context API).
    * [Frontend] Página do carrinho detalhada com listagem de itens, subtotais, total, e funcionalidades para atualizar quantidade e remover itens.
    * [Frontend] Integração do catálogo para adicionar produtos ao carrinho.

* **Épico 4: Checkout Básico**
    * [Backend] Entidades `Order`, `OrderItem`, `Customer` (integrado com Identity) e schema do banco.
    * [Backend] API para criar um pedido a partir dos dados do carrinho e do formulário de checkout.
    * [Backend] API para buscar detalhes de um pedido por ID (protegido para admin).
    * [Backend] Lógica para limpar o carrinho após a criação do pedido.
    * [Frontend] Formulário de checkout para informações de contato e entrega.
    * [Frontend] Seleção simulada de forma de pagamento (UI).
    * [Frontend] Página de confirmação de pedido que exibe os detalhes do pedido recém-criado.
    * [Frontend] Validações básicas no formulário de checkout.

* **Épico 5: Autenticação e Autorização Básica**
    * [Backend] ASP.NET Core Identity configurado com `Customer` como usuário.
    * [Backend] Endpoints da API para Registro e Login de clientes.
    * [Backend] Geração de token JWT no login (incluindo claims de role).
    * [Frontend] Páginas de Registro e Login.
    * [Frontend] Gerenciamento do estado de autenticação (token no `localStorage`, `currentUser` no Context API com roles).
    * [Frontend] UI condicional para exibir nome do usuário, links de Login/Logout.
    * [Backend] Proteção de endpoints da API com base em roles (ex: `[Authorize(Roles = "Admin")]`).
    * [Frontend] Rota `/admin` protegida, verificando autenticação e role "Admin".

* **Épico 6: Gestão de Pedidos (Admin Simples)**
    * [Backend] API para listar todos os pedidos (protegido para "Admin").
    * [Backend] API para visualizar detalhes de um pedido específico (protegido para "Admin").
    * [Backend] API para alterar o status de um pedido (protegido para "Admin").
    * [Frontend/Admin] Página na área administrativa para listar todos os pedidos.
    * [Frontend/Admin] Página na área administrativa para visualizar detalhes de um pedido.
    * [Frontend/Admin] Funcionalidade na página de detalhes do pedido (admin) para alterar o status do pedido.

## Como Executar o Projeto (Instruções Iniciais)

*(Esta seção será detalhada na Tarefa 8, mas um esboço)*

**Pré-requisitos:**
* .NET 8 SDK
* Node.js (versão LTS recomendada)
* SQL Server (Express ou Developer Edition)
* Git

**Passos:**
1.  Clone o repositório: `git clone https://github.com/ResoluteJax/E-Commerce-Minimalista.git`
2.  Navegue até a pasta do projeto: `cd E-Commerce-Minimalista`
3.  **Backend:**
    * Configure a string de conexão para o SQL Server no arquivo `src/Api/appsettings.Development.json`.
    * Aplique as migrações do EF Core: `dotnet ef database update -s src/Api/MinimalistECommerce.Api.csproj` (execute da pasta raiz).
    * Execute a API: `dotnet run --project src/Api/MinimalistECommerce.Api.csproj` (execute da pasta raiz).
4.  **Frontend:**
    * Navegue até a pasta do frontend: `cd frontend`
    * Instale as dependências: `npm install`
    * Execute o servidor de desenvolvimento: `npm run dev`
5.  Acesse o frontend em `http://localhost:5173` (ou a porta indicada pelo Vite) e a API (via Swagger) em `http://localhost:5015/swagger` (ou as portas indicadas pela API).

## Autor

* **Seu Nome / ResoluteJax**
* [Link para seu GitHub](https://github.com/ResoluteJax)
* (Opcional: Link para seu LinkedIn)

---