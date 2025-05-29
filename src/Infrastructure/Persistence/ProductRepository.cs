// src/Infrastructure/Persistence/ProductRepository.cs
using Microsoft.EntityFrameworkCore;
using MinimalistECommerce.Application.Contracts.Persistence;
using MinimalistECommerce.Domain.Entities;
using System; // Para ArgumentNullException
using System.Collections.Generic; // Para IEnumerable
using System.Linq; // Para IQueryable, OrderBy
using System.Threading.Tasks; // Para Task

namespace MinimalistECommerce.Infrastructure.Persistence
{
    public class ProductRepository : IProductRepository
    {
        private readonly ApplicationDbContext _context;

        public ProductRepository(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<Product?> GetByIdAsync(int id, bool includeCategory = false)
        {
            IQueryable<Product> query = _context.Products;

            if (includeCategory)
            {
                query = query.Include(p => p.Category);
            }
            return await query.FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Product>> GetAllAsync(bool includeCategory = false)
        {
            IQueryable<Product> query = _context.Products;
            if (includeCategory)
            {
                query = query.Include(p => p.Category);
            }
            return await query.OrderBy(p => p.Name).ToListAsync();
        }


        public async Task AddAsync(Product product)
        {
            await _context.Products.AddAsync(product);
        }

        public void Update(Product product)
        {
            _context.Entry(product).State = EntityState.Modified;
        }

        public void Delete(Product product)
        {
            _context.Products.Remove(product);
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }
    }
}