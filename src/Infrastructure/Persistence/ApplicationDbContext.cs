using Microsoft.EntityFrameworkCore;
using MinimalistECommerce.Domain.Entities; // Adicione se não estiver lá

namespace MinimalistECommerce.Infrastructure.Persistence
{
    public class ApplicationDbContext : DbContext
    {
          public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
        {
        }
        
        public DbSet<Product> Products { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }


        // Adicione ou descomente este método
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder); // É bom chamar o base

            // Configura a precisão da propriedade Price na entidade Product
            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasPrecision(18, 2); // Define 18 dígitos totais, 2 casas decimais

            // Outras configurações do modelo podem vir aqui no futuro
        }
    }
}