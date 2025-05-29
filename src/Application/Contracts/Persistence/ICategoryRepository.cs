// src/Application/Contracts/Persistence/ICategoryRepository.cs
using System.Collections.Generic;
using System.Threading.Tasks;
using MinimalistECommerce.Domain.Entities;

namespace MinimalistECommerce.Application.Contracts.Persistence
{
    public interface ICategoryRepository
    {
        Task<Category?> GetByIdAsync(int id);
        Task<IEnumerable<Category>> GetAllAsync();

        // ADICIONE ESTES MÉTODOS:
        Task AddAsync(Category category);
        void Update(Category category); // EF Core rastreia, apenas marca estado
        void Delete(Category category); // EF Core rastreia, apenas marca estado
        Task<int> SaveChangesAsync();   // Para persistir as alterações
    }
}