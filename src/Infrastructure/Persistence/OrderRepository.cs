// src/Infrastructure/Persistence/OrderRepository.cs
using System;
using System.Threading.Tasks;
using MinimalistECommerce.Application.Contracts.Persistence;
using MinimalistECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Collections.Generic; // Para IEnumerable



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

        public async Task<Order?> GetByIdAsync(int orderId, bool includeItemsAndProducts = true)
        {
            IQueryable<Order> query = _context.Orders;

            if (includeItemsAndProducts)
            {
                query = query
                    .Include(o => o.OrderItems)    // Inclui os itens do pedido
                    .ThenInclude(oi => oi.Product); // Para cada item, inclui o produto associado
            }
            // Poderíamos adicionar .Include(o => o.Customer) se quiséssemos carregar o cliente também

            return await query.FirstOrDefaultAsync(o => o.Id == orderId);
        }

        public async Task<IEnumerable<Order>> GetAllAsync(bool includeCustomer = true, bool includeItemsAndProducts = true)
        {
            IQueryable<Order> query = _context.Orders.OrderByDescending(o => o.OrderDate); // Ordena pelos mais recentes

            if (includeCustomer)
            {
                query = query.Include(o => o.Customer); // Inclui dados do cliente
            }

            if (includeItemsAndProducts)
            {
                query = query.Include(o => o.OrderItems)    // Inclui os itens do pedido
                             .ThenInclude(oi => oi.Product); // Para cada item, inclui o produto
            }

            return await query.ToListAsync();
        }

        public async Task<int> SaveChangesAsync()
        {
            // Salva todas as alterações rastreadas pelo contexto (incluindo Orders e OrderItems)
            return await _context.SaveChangesAsync();
        }
    }
}

