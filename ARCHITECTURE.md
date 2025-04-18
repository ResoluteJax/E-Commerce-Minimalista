==============================================
===Arquitetura Limpa e-commerce minimalista===
==============================================

===1.Descrição das Camadas===

Domain: Contém as regras de negócio e entidades principais do e-commerce (ex: Product, Order). É o núcleo independente do sistema.
Application: Orquestra os casos de uso (ex: adicionar item ao carrinho, finalizar compra) e define as interfaces para operações externas (ex: salvar no banco, enviar email). Utiliza DTOs para comunicação.
Infrastructure: Implementa os detalhes técnicos: acesso ao banco de dados (EF Core, Repositórios), envio de e-mails simulados, etc., concretizando as interfaces da Application.
Presentation (API): Expõe a funcionalidade via endpoints HTTP (Controllers). Recebe requisições, chama a camada Application e retorna respostas (JSON).

===2.Regra de Dependência===

As dependências devem sempre apontar para as camadas internas: Presentation depende de Application, Infrastructure depende de Application. Tanto Application quanto Infrastructure dependem de Domain. A camada Domain não possui dependências de nenhuma outra camada.

Snippet de código

//---------------------------------------------\\
graph LR
    Presentation_API --> Application;
    Infrastructure --> Application;
    Application --> Domain;
    Infrastructure --> Domain;
//---------------------------------------------\\

===3. Padrões Chave===

Repository Pattern: Abstrai o acesso aos dados (implementado na Infrastructure, com interfaces na Application ou Domain).
Unit of Work: Garante a atomicidade das operações de banco de dados (geralmente coordenado na Application e implementado via DbContext na Infrastructure).
DTO (Data Transfer Objects): Utilizados para transferir dados entre Presentation e Application, desacoplando as camadas.
Dependency Injection (DI): Usado intensivamente pelo ASP.NET Core para gerenciar e injetar dependências entre as camadas (configurado na Presentation).
Application Service: Camada na Application que orquestra os casos de uso e a lógica da aplicação.

===4Diagrama de Dependências===

O diagrama abaixo ilustra o fluxo de dependências entre as camadas:


Snippet de código

//---------------------------------------------\\
graph LR
    A[Presentation (API)] --> B;
    C[Infrastructure] --> B;
    B[Application] --> D;
    C --> D;

    subgraph "Clean Architecture Layers"
    D(Domain)
    B
    A
    C
    end

    style D fill:#f9f,stroke:#333,stroke-width:2px
    style B fill:#ccf,stroke:#333,stroke-width:2px
//---------------------------------------------\\

(Nota: As setas indicam a direção da dependência. Ex: Presentation depende de Application)