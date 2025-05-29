using Microsoft.EntityFrameworkCore;
using MinimalistECommerce.Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;

namespace MinimalistECommerce.Infrastructure.Persistence
{
    // Alterar para herdar de IdentityDbContext<Customer>
    public class ApplicationDbContext : IdentityDbContext<Customer> 
    {
          public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
        {
        }
        public DbSet<Product> Products { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<CartItem> CartItems { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Category> Categories { get; set; }


        // Adicione ou descomente este método
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Product>()
                .Property(p => p.Price)
                .HasPrecision(18, 2);

            builder.Entity<Order>()
                .Property(o => o.TotalAmount)
                .HasPrecision(18, 2);

            builder.Entity<OrderItem>()
                .Property(oi => oi.UnitPrice)
                .HasPrecision(18, 2);

            builder.Entity<Product>()
       .HasOne(p => p.Category) // Um Produto tem uma Categoria (opcional, pois CategoryId é anulável)
       .WithMany(c => c.Products) // Uma Categoria tem muitos Produtos
       .HasForeignKey(p => p.CategoryId) // A chave estrangeira está em Product.CategoryId
       .OnDelete(DeleteBehavior.SetNull);
        
        }
    }
}