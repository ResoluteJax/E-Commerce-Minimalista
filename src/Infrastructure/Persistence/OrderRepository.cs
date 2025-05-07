// src/Infrastructure/Persistence/OrderRepository.cs
using System;
using System.Threading.Tasks;
using MinimalistECommerce.Application.Contracts.Persistence;
using MinimalistECommerce.Domain.Entities;

namespace MinimalistECommerce.Infrastructure.Persistence
{
    public class OrderRepository : IOrderRepository
    {
        private readonly ApplicationDbContext _context;

        public OrderRepository(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task AddAsync(Order order)
        {
            // Adiciona a entidade Order (e seus OrderItems aninhados) ao DbSet.
            // O EF Core rastreará todo o gráfico de objetos.
            await _context.Orders.AddAsync(order);
        }

        public async Task<int> SaveChangesAsync()
        {
            // Salva todas as alterações rastreadas pelo contexto (incluindo Orders e OrderItems)
            return await _context.SaveChangesAsync();
        }
    }
}