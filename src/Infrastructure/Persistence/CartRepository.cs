// src/Infrastructure/Persistence/CartRepository.cs
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MinimalistECommerce.Application.Contracts.Persistence;
using MinimalistECommerce.Domain.Entities;

namespace MinimalistECommerce.Infrastructure.Persistence
{
    public class CartRepository : ICartRepository
    {
        private readonly ApplicationDbContext _context;

        public CartRepository(ApplicationDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<Cart?> GetByIdAsync(Guid cartId, bool includeItems = false)
        {
            IQueryable<Cart> query = _context.Carts;

            if (includeItems)
            {
                // Inclui os itens do carrinho na consulta se solicitado
                query = query.Include(c => c.CartItems)
                             .ThenInclude(ci => ci.Product); // Opcional: incluir dados do produto nos itens
            }

            // Busca o carrinho pelo Id
            return await query.FirstOrDefaultAsync(c => c.Id == cartId);
        }

        public async Task<CartItem?> GetCartItemByCartIdAndProductIdAsync(Guid cartId, int productId)
        {
            return await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.CartId == cartId && ci.ProductId == productId);
        }

        public async Task AddCartAsync(Cart cart)
        {
            await _context.Carts.AddAsync(cart);
        }

        public async Task AddCartItemAsync(CartItem cartItem)
        {
            await _context.CartItems.AddAsync(cartItem);
        }

        public void UpdateCartItem(CartItem cartItem)
        {
            // O EF Core rastreia a entidade, apenas marcar como modificada é suficiente
            // se ela já estiver sendo rastreada após ser buscada.
            // Se for uma entidade não rastreada, pode precisar de _context.CartItems.Update(cartItem);
             _context.Entry(cartItem).State = EntityState.Modified;
        }

         public void DeleteCartItem(CartItem cartItem)
        {
            _context.CartItems.Remove(cartItem);
        }

        public async Task<int> SaveChangesAsync()
        {
            // Salva todas as alterações rastreadas pelo context (para Carts e CartItems)
            return await _context.SaveChangesAsync();
        }


        public async Task ClearCartAsync(Guid cartId)
        {
    // Encontra todos os itens do carrinho especificado
    var cartItems = await _context.CartItems
        .Where(ci => ci.CartId == cartId)
        .ToListAsync();

    if (cartItems.Any())
    {
        _context.CartItems.RemoveRange(cartItems); // Marca todos para remoção

    }
    // SaveChangesAsync será chamado pelo serviço/controller que orquestra a operação
}

    }
}