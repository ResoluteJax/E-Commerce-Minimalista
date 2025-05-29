// src/Application/Contracts/Persistence/IProductRepository.cs
using System.Collections.Generic; // Para IEnumerable
using System.Threading.Tasks;    // Para Task
using MinimalistECommerce.Domain.Entities;

namespace MinimalistECommerce.Application.Contracts.Persistence
{
    public interface IProductRepository
    {
        // Assinatura corrigida para incluir o parâmetro opcional
        Task<Product?> GetByIdAsync(int id, bool includeCategory = false);

        // Mantida apenas a versão com o parâmetro opcional
        Task<IEnumerable<Product>> GetAllAsync(bool includeCategory = false);

        Task AddAsync(Product product);
        void Update(Product product);
        void Delete(Product product);
        Task<int> SaveChangesAsync();
    }
}