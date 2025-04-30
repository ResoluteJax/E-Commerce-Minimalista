// src/Application/Contracts/Persistence/ICartRepository.cs
using System;
using System.Threading.Tasks;
using MinimalistECommerce.Domain.Entities;

namespace MinimalistECommerce.Application.Contracts.Persistence
{
    public interface ICartRepository
    {
        // Busca um carrinho pelo Id, opcionalmente incluindo seus itens
        Task<Cart?> GetByIdAsync(Guid cartId, bool includeItems = false);

        // Busca um item específico dentro de um carrinho pelo Id do produto
        Task<CartItem?> GetCartItemByCartIdAndProductIdAsync(Guid cartId, int productId);

        // Adiciona um novo carrinho ao contexto
        Task AddCartAsync(Cart cart);

        // Adiciona um novo item de carrinho ao contexto
        Task AddCartItemAsync(CartItem cartItem);

        // Marca um item de carrinho como modificado no contexto
        void UpdateCartItem(CartItem cartItem);

        // Marca um item de carrinho como removido no contexto
        void DeleteCartItem(CartItem cartItem);

        // Salva todas as alterações pendentes no contexto para o banco de dados
        Task<int> SaveChangesAsync();
    }
}