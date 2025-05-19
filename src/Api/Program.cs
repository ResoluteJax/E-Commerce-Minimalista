// src/Api/Program.cs
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore; // Adicionado para DbContext (se usado diretamente, mas geralmente não aqui)
using Microsoft.Extensions.DependencyInjection; // Para CreateScope, GetRequiredService
using Microsoft.Extensions.Logging;         // Para ILogger
using Microsoft.IdentityModel.Tokens;
using MinimalistECommerce.Api.Middleware;
using MinimalistECommerce.Domain.Entities;  // Para Customer
using MinimalistECommerce.Infrastructure;
using System.Text;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// 1. Configura o DbContext e outros serviços da Infrastructure (incluindo Identity)
builder.Services.AddInfrastructureServices(builder.Configuration);

// 2. Configura CORS
var MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: MyAllowSpecificOrigins,
                      policy =>
                      {
                          policy.WithOrigins("http://localhost:5173") // Frontend React
                                .AllowAnyHeader()
                                .AllowAnyMethod();
                      });
});

// 3. Configuração da Autenticação JWT (já estava correta)
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false; // Em desenvolvimento. Mudar para true em produção.
    options.TokenValidationParameters = new TokenValidationParameters()
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});

// 4. Adiciona serviços padrão ao container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
// Substitua builder.Services.AddSwaggerGen(); por isto:
builder.Services.AddSwaggerGen(options =>
{
    // Define informações básicas da API para o Swagger
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "MinimalistECommerce API", Version = "v1" });

    // Define o esquema de segurança JWT (Bearer)
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = @"JWT Authorization header usando o esquema Bearer.
                      Entre com 'Bearer' [espaço] e então seu token no input de texto abaixo.
                      Exemplo: 'Bearer 12345abcdef'",
        Name = "Authorization", // Nome do header
        In = ParameterLocation.Header, // Onde o token será enviado (no header)
        Type = SecuritySchemeType.ApiKey, // Tipo de esquema
        Scheme = "Bearer" // Esquema a ser usado ("Bearer")
    });

    // Adiciona um requisito de segurança global para operações que usam o esquema "Bearer"
    options.AddSecurityRequirement(new OpenApiSecurityRequirement()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer" // Deve corresponder ao Id definido em AddSecurityDefinition
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header,
            },
            new List<string>() // Lista de escopos (pode ser vazia se não usar escopos OAuth2)
        }
    });
}); // Idealmente, configurar Swagger para usar o token JWT


var app = builder.Build();

// 5. Seed de Roles e Usuário Admin (APENAS EM DESENVOLVIMENTO OU PRIMEIRA EXECUÇÃO)
// Em um cenário ideal, isso seria feito uma vez ou através de um mecanismo de seed mais robusto.
// Verifica se está em ambiente de desenvolvimento para executar o seed.
if (app.Environment.IsDevelopment())
{
    // Criar um escopo para resolver os serviços para o seed
    using (var scope = app.Services.CreateScope())
    {
        var services = scope.ServiceProvider;
        try
        {
            // Chama a função de seed aqui.
            // A função SeedRolesAndAdminUser precisa ser acessível,
            // então vamos defini-la dentro desta classe ou torná-la pública em outro lugar.
            // Por simplicidade, vamos movê-la para cá.
            await SeedRolesAndAdminUser(services);
        }
        catch (Exception ex)
        {
            var logger = services.GetRequiredService<ILogger<Program>>();
            logger.LogError(ex, "Um erro ocorreu durante o seeding do banco de dados.");
        }
    }
}


// 6. Configura o pipeline de requisições HTTP.
app.UseMiddleware<GlobalExceptionHandlerMiddleware>(); // Nosso handler global primeiro

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    // app.UseDeveloperExceptionPage(); // O GlobalExceptionHandlerMiddleware já lida com isso
}
else
{
    // Em produção, você pode querer um handler de exceção diferente ou HSTS
    // app.UseExceptionHandler("/Error");
    // app.UseHsts(); // Se estiver usando HTTPS consistentemente
}

app.UseHttpsRedirection();

app.UseCors(MyAllowSpecificOrigins);

app.UseAuthentication(); // Middleware de Autenticação (Importante!)
app.UseAuthorization();  // Middleware de Autorização (Importante!)

app.MapControllers();

app.Run(); // Inicia a aplicação


// --- Função de Seed movida para dentro ou como método estático local ---
async static Task SeedRolesAndAdminUser(IServiceProvider serviceProvider)
{
    var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = serviceProvider.GetRequiredService<UserManager<Customer>>();
    var logger = serviceProvider.GetRequiredService<ILogger<Program>>(); // Logger para esta classe/contexto

    string[] roleNames = { "Admin", "Customer" }; // Nossas roles
    IdentityResult roleResult;

    foreach (var roleName in roleNames)
    {
        var roleExist = await roleManager.RoleExistsAsync(roleName);
        if (!roleExist)
        {
            roleResult = await roleManager.CreateAsync(new IdentityRole(roleName));
            if (roleResult.Succeeded)
            {
                logger.LogInformation("Role '{RoleName}' criada com sucesso.", roleName);
            }
            else
            {
                foreach (var error in roleResult.Errors)
                {
                    logger.LogError("Erro ao criar role '{RoleName}': {ErrorDescription}", roleName, error.Description);
                }
            }
        }
    }

    // Criar usuário Admin
    var adminUserEmail = "admin@example.com"; // Defina o e-mail do seu admin
    var adminUser = await userManager.FindByEmailAsync(adminUserEmail);

    if (adminUser == null)
    {
        var newAdminUser = new Customer
        {
            UserName = adminUserEmail,
            Email = adminUserEmail,
            FullName = "Administrador do Sistema",
            DefaultShippingAddress = "N/A", // Endereço padrão
            EmailConfirmed = true // Confirma e-mail automaticamente para admin de seed
        };

        var adminPassword = "@otavio#ECM*24"; // !! USE UMA SENHA FORTE E SEGURA !!
        var createAdminResult = await userManager.CreateAsync(newAdminUser, adminPassword);

        if (createAdminResult.Succeeded)
        {
            logger.LogInformation("Usuário Admin '{AdminEmail}' criado com sucesso.", adminUserEmail);
            await userManager.AddToRoleAsync(newAdminUser, "Admin"); // Adiciona à role Admin
            logger.LogInformation("Usuário Admin '{AdminEmail}' adicionado à role 'Admin'.", adminUserEmail);
        }
        else
        {
            foreach (var error in createAdminResult.Errors)
            {
                logger.LogError("Erro ao criar usuário Admin '{AdminEmail}': {ErrorDescription}", adminUserEmail, error.Description);
            }
        }
    }
    else
    {
        logger.LogInformation("Usuário Admin '{AdminEmail}' já existe.", adminUserEmail);
        // Garante que o admin existente tem a role Admin
        if (!await userManager.IsInRoleAsync(adminUser, "Admin"))
        {
            await userManager.AddToRoleAsync(adminUser, "Admin");
            logger.LogInformation("Usuário Admin '{AdminEmail}' adicionado à role 'Admin' (estava faltando).", adminUserEmail);
        }
    }
}