// src/Infrastructure/Persistence/ProductRepository.cs
using Microsoft.EntityFrameworkCore; // Para usar ToListAsync, FindAsync, etc.
using MinimalistECommerce.Application.Contracts.Persistence; // Para implementar IProductRepository
using MinimalistECommerce.Domain.Entities; // Para usar a classe Product

namespace MinimalistECommerce.Infrastructure.Persistence
{
    public class ProductRepository : IProductRepository
    {
        private readonly ApplicationDbContext _context;

        // Injetamos o DbContext no construtor
        public ProductRepository(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }



    // ... métodos GetByIdAsync, GetAllAsync, AddAsync, Update, Delete ...
        public async Task<Product?> GetByIdAsync(int id)
        {
            // FindAsync é otimizado para buscar por chave primária
            return await _context.Products.FindAsync(id);
        }

        public async Task<IEnumerable<Product>> GetAllAsync()
        {
            // Retorna todos os produtos como uma lista
            return await _context.Products.ToListAsync();
        }

        public async Task AddAsync(Product product)
        {
            // Adiciona a entidade ao DbSet. O estado será 'Added'.
            await _context.Products.AddAsync(product);
            // Nota: SaveChangesAsync() NÃO é chamado aqui.
        }

        public void Update(Product product)
        {
            // Informa ao EF Core que a entidade foi modificada.
            _context.Entry(product).State = EntityState.Modified;
             // Nota: SaveChangesAsync() NÃO é chamado aqui.
        }

        public void Delete(Product product)
        {
            // Remove a entidade do DbSet. O estado será 'Deleted'.
            _context.Products.Remove(product); 
            // Nota: SaveChangesAsync() NÃO é chamado aqui.
        }

        public async Task<int> SaveChangesAsync() 
        {
        return await _context.SaveChangesAsync();
        }
    }
}