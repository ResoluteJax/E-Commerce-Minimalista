// src/Infrastructure/DependencyInjection.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MinimalistECommerce.Infrastructure.Persistence; // Namespace do nosso DbContext

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

            // --- Registro de Repositórios e outros serviços da Infrastructure virão aqui ---
            // Exemplo: services.AddScoped<IProductRepository, ProductRepository>();

            return services;
        }
    }
}