// src/Infrastructure/DependencyInjection.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MinimalistECommerce.Application.Contracts.Persistence; // Para IProductRepository
using MinimalistECommerce.Infrastructure.Persistence; // Namespace do nosso DbContext
using Microsoft.AspNetCore.Identity;
using MinimalistECommerce.Domain.Entities; // Para Customer



namespace MinimalistECommerce.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructureServices(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            // Recupera a string de conexão (agora lida pela API, mas passada para cá)
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            // Validação básica da string de conexão (opcional, mas bom)
            if (string.IsNullOrEmpty(connectionString))
            {
                throw new ArgumentNullException(nameof(connectionString), "Connection string 'DefaultConnection' not found.");
            }

            // Registra o ApplicationDbContext com o provedor SQL Server
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(connectionString));

//CONFIGURAÇÃO DO IDENTITY
services.AddIdentity<Customer, IdentityRole>(options =>
        {
            // Configurações de senha (exemplo, pode ajustar)
            options.Password.RequireDigit = false;
            options.Password.RequireLowercase = false;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequireUppercase = false;
            options.Password.RequiredLength = 6; // Senha mínima de 6 caracteres
            options.Password.RequiredUniqueChars = 1;

            // Configurações de Lockout (exemplo)
            // options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
            // options.Lockout.MaxFailedAccessAttempts = 5;
            // options.Lockout.AllowedForNewUsers = true;

            // Configurações de Usuário (exemplo)
            options.User.RequireUniqueEmail = true; // Requer que e-mails sejam únicos

            // Outras opções como SignIn.RequireConfirmedAccount, etc.
            options.SignIn.RequireConfirmedAccount = false; // Para simplificar, não requer confirmação de conta agora
        })
        .AddEntityFrameworkStores<ApplicationDbContext>() // Diz ao Identity para usar nosso DbContext
        .AddDefaultTokenProviders(); // Adiciona provedores de token padrão (para reset de senha, etc.)


            // --- Registro de Repositórios e outros serviços da Infrastructure virão aqui ---
            services.AddScoped<IProductRepository, ProductRepository>();
            services.AddScoped<ICartRepository, CartRepository>();
            services.AddScoped<IOrderRepository, OrderRepository>();

            return services;
        }
    }
}