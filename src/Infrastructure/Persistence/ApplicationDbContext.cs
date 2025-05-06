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
        
        public DbSet<Product> Products { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }

        public DbSet<Customer> Customers { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }


        // Adicione ou descomente este método
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder); // É bom chamar o base

           
            modelBuilder.Entity<Product>()
                .Property(p => p.Price)
                .HasPrecision(18, 2); // Define 18 dígitos totais, 2 casas decimais

            modelBuilder.Entity<Order>()
                .Property(o => o.TotalAmount)
                .HasPrecision(18, 2); // Precisão para Order.TotalAmount

            modelBuilder.Entity<OrderItem>()
                .Property(oi => oi.UnitPrice)
                .HasPrecision(18, 2); // Precisão para OrderItem.UnitPrice

         // Outras configurações (chaves, índices, etc.) podem vir aqui
        }
    }
}