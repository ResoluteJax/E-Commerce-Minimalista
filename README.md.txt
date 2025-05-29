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