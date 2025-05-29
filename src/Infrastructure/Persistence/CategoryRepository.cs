// src/Infrastructure/Persistence/CategoryRepository.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore; // Para EntityState
using MinimalistECommerce.Application.Contracts.Persistence;
using MinimalistECommerce.Domain.Entities;

namespace MinimalistECommerce.Infrastructure.Persistence
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly ApplicationDbContext _context;

        public CategoryRepository(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<Category?> GetByIdAsync(int id)
        {
            return await _context.Categories.FindAsync(id);
        }

        public async Task<IEnumerable<Category>> GetAllAsync()
        {
            return await _context.Categories.OrderBy(c => c.Name).ToListAsync();
        }

        // IMPLEMENTE ESTES MÉTODOS:
        public async Task AddAsync(Category category)
        {
            await _context.Categories.AddAsync(category);
        }

        public void Update(Category category)
        {
            _context.Entry(category).State = EntityState.Modified;
        }

        public void Delete(Category category)
        {
            _context.Categories.Remove(category);
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }
    }
}