// src/Api/Controllers/CartController.cs
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using MinimalistECommerce.Application.Contracts.Persistence; // Repositórios
using MinimalistECommerce.Application.Dtos; // DTOs
using MinimalistECommerce.Domain.Entities; // Entidades

namespace MinimalistECommerce.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Rota base será /api/cart
    public class CartController : ControllerBase
    {
        private readonly ICartRepository _cartRepository;
        private readonly IProductRepository _productRepository;

        // Injetamos os repositórios necessários
        public CartController(ICartRepository cartRepository, IProductRepository productRepository)
        {
            _cartRepository = cartRepository ?? throw new ArgumentNullException(nameof(cartRepository));
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
        }

        // POST: api/cart/items
[HttpPost("items")] // Rota será /api/cart/items
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public async Task<ActionResult> AddItemToCart([FromBody] AddCartItemDto addItemDto)
{
    // --- Estratégia Temporária de Identificação do Carrinho ---
    // Como ainda não temos usuários/sessões, vamos usar um ID fixo para testes.
    // No futuro, este ID viria de um cookie, token JWT, ou sessão.
    // Você pode gerar um Guid online (ex: https://www.guidgenerator.com/) e colar aqui.
var temporaryCartId = Guid.Parse("8fc77faa-10d1-4f13-aeba-29d09571fe87");    // ----------------------------------------------------------

    // 1. Encontra ou Cria o Carrinho (usando o ID temporário)
    var cart = await _cartRepository.GetByIdAsync(temporaryCartId);
    if (cart == null)
    {
        // Se o carrinho não existe com esse ID fixo, cria um novo
        cart = new Cart { Id = temporaryCartId }; // Usando o construtor que define Datas
        await _cartRepository.AddCartAsync(cart);
        // Nota: Idealmente, SaveChanges seria chamado aqui ou no fim,
        // mas AddCartAsync apenas adiciona ao contexto por enquanto.
    }

    // 2. Valida se o Produto existe
    var product = await _productRepository.GetByIdAsync(addItemDto.ProductId);
    if (product == null)
    {
        // Retorna 404 se o produto não for encontrado (melhor que BadRequest talvez)
        return NotFound($"Produto com ID {addItemDto.ProductId} não encontrado.");
    }

    // 3. Verifica se o item já existe no carrinho
    var cartItem = await _cartRepository.GetCartItemByCartIdAndProductIdAsync(cart.Id, addItemDto.ProductId);

    if (cartItem != null)
    {
        // 4a. Se existe, atualiza a quantidade
        cartItem.Quantity += addItemDto.Quantity;
        _cartRepository.UpdateCartItem(cartItem); // Marca para atualização
    }
    else
    {
        // 4b. Se não existe, cria um novo CartItem
        cartItem = new CartItem
        {
            CartId = cart.Id,
            ProductId = addItemDto.ProductId,
            Quantity = addItemDto.Quantity
            // Poderíamos guardar o preço aqui se quiséssemos (product.Price)
        };
        await _cartRepository.AddCartItemAsync(cartItem); // Adiciona ao contexto
    }

    // 5. Salva todas as alterações (criação do carrinho, adição/atualização do item)
    await _cartRepository.SaveChangesAsync();

    // 6. Retorna uma resposta OK (poderia retornar o item ou o carrinho atualizado)
    return Ok(); // Simplesmente confirma que a operação foi OK
}

    }
}