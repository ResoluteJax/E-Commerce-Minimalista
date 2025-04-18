using Microsoft.EntityFrameworkCore;
using MinimalistECommerce.Domain.Entities;

namespace MinimalistECommerce.Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) 
            : base(options)
        {
        }

        // --- DbSets para nossas entidades ---
        public DbSet<Product> Products {get; set; }
        // public DbSet<Order> Orders { get; set; } // Exemplo para o futuro
        // ... etc
        

        // (Opcional) Configurações adicionais do modelo podem ir aqui no futuro
        // protected override void OnModelCreating(ModelBuilder modelBuilder)
        // {
        //     base.OnModelCreating(modelBuilder);
        //     // Exemplo: Configurar chaves compostas, índices, etc.
        //     // modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly()); // Se usar IEntityTypeConfiguration
        // }
    }
}
