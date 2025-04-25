// src/Application/Contracts/Persistence/IProductRepository.cs
using MinimalistECommerce.Domain.Entities; // Para usar a classe Product

namespace MinimalistECommerce.Application.Contracts.Persistence
{
    public interface IProductRepository
{
    Task<Product?> GetByIdAsync(int id);
    Task<IEnumerable<Product>> GetAllAsync();
    Task AddAsync(Product product);
    void Update(Product product);
    void Delete(Product product);
    Task<int> SaveChangesAsync(); // Adiciona este método para salvar as alterações
}
}