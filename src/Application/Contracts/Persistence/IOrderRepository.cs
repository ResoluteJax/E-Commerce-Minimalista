// src/Application/Contracts/Persistence/IOrderRepository.cs
using System.Threading.Tasks;
using MinimalistECommerce.Domain.Entities;

namespace MinimalistECommerce.Application.Contracts.Persistence
{
    public interface IOrderRepository
    {
        // Adiciona um novo pedido (incluindo seus itens) ao contexto
        Task AddAsync(Order order);

        // Salva as alterações no banco de dados (para este repositório)
        Task<int> SaveChangesAsync();

        // Outros métodos como GetById, ListByCustomer seriam adicionados aqui depois
    }
}