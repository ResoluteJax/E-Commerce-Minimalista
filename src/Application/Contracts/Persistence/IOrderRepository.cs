// src/Application/Contracts/Persistence/IOrderRepository.cs
using System.Threading.Tasks;
using MinimalistECommerce.Domain.Entities;
using System;

namespace MinimalistECommerce.Application.Contracts.Persistence
{
    public interface IOrderRepository
    {
        // Adiciona um novo pedido (incluindo seus itens) ao contexto
        Task AddAsync(Order order);

        // Salva as alterações no banco de dados (para este repositório)
        Task<int> SaveChangesAsync();

        Task<Order?> GetByIdAsync(int orderId, bool includeItemsAndProducts = true);

        Task<IEnumerable<Order>> GetAllAsync(bool includeCustomer = true, bool includeItemsAndProducts = true);
        
    }
}