// src/Api/Controllers/CartController.cs
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using MinimalistECommerce.Application.Contracts.Persistence; // Repositórios
using MinimalistECommerce.Application.Dtos; // DTOs
using MinimalistECommerce.Domain.Entities; // Entidades
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging; // Necessário para ILogger

namespace MinimalistECommerce.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Rota base será /api/cart
    public class CartController : ControllerBase
    {
        private readonly ICartRepository _cartRepository;
        private readonly IProductRepository _productRepository;
        private readonly ILogger<CartController> _logger;

        // Injetamos os repositórios necessários
        public CartController(ICartRepository cartRepository, IProductRepository productRepository, ILogger<CartController> logger)
        {
            _cartRepository = cartRepository ?? throw new ArgumentNullException(nameof(cartRepository));
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository));
             _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // POST: api/cart/items
    [HttpPost("items")] // Rota será /api/cart/items
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
public async Task<ActionResult> AddItemToCart([FromBody] AddCartItemDto addItemDto)
{
// --- Estratégia Identificação do Carrinho ---
var temporaryCartId = Guid.Parse("8fc77faa-10d1-4f13-aeba-29d09571fe87");   // !!! Guid fixo !!!
// ----------------------------------------------------------

    //  Encontra ou Cria o Carrinho (usando o ID temporário)
    var cart = await _cartRepository.GetByIdAsync(temporaryCartId);
    if (cart == null)
    {
        // Se o carrinho não existe com esse ID fixo, cria um novo
        cart = new Cart { Id = temporaryCartId }; // Usando o construtor que define Datas
        await _cartRepository.AddCartAsync(cart);
        // Nota: Idealmente, SaveChanges seria chamado aqui ou no fim,
        // mas AddCartAsync apenas adiciona ao contexto por enquanto.
    }

    //  Valida se o Produto existe
    var product = await _productRepository.GetByIdAsync(addItemDto.ProductId);
    if (product == null)
    {
        // Retorna 404 se o produto não for encontrado (melhor que BadRequest talvez)
        return NotFound($"Produto com ID {addItemDto.ProductId} não encontrado.");
    }

    //  Verifica se o item já existe no carrinho
    var cartItem = await _cartRepository.GetCartItemByCartIdAndProductIdAsync(cart.Id, addItemDto.ProductId);

    if (cartItem != null)
    {
        //  Se existe, atualiza a quantidade
        cartItem.Quantity += addItemDto.Quantity;
        _cartRepository.UpdateCartItem(cartItem); // Marca para atualização
    }
    else
    {
        //  Se não existe, cria um novo CartItem
        cartItem = new CartItem
        {
            CartId = cart.Id,
            ProductId = addItemDto.ProductId,
            Quantity = addItemDto.Quantity
            // Poderíamos guardar o preço aqui se quiséssemos (product.Price)
        };
        await _cartRepository.AddCartItemAsync(cartItem); // Adiciona ao contexto
    }

    //  Salva todas as alterações (criação do carrinho, adição/atualização do item)
    await _cartRepository.SaveChangesAsync();

    //  Retorna uma resposta OK (poderia retornar o item ou o carrinho atualizado)
    return Ok(); // Simplesmente confirma que a operação foi OK
}


// GET: api/cart
[HttpGet]
[ProducesResponseType(typeof(CartDto), StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status404NotFound)]
public async Task<ActionResult<CartDto>> GetCart()
{
    // --- Estratégia Temporária de Identificação do Carrinho ---
    // Usamos o MESMO Guid fixo que definimos no método POST
    var temporaryCartId = Guid.Parse("8fc77faa-10d1-4f13-aeba-29d09571fe87");// !!! Guid fixo !!!
    // ----------------------------------------------------------

    //  Busca o carrinho E seus itens (includeItems: true)
    //    Também inclui dados do produto associado a cada item (ThenInclude)
    var cart = await _cartRepository.GetByIdAsync(temporaryCartId, includeItems: true);

    //  Se o carrinho não for encontrado (ex: nenhum item foi adicionado ainda)
    if (cart == null)
    {
        // Poderíamos retornar um carrinho vazio DTO em vez de 404, dependendo da regra de negócio
        // return Ok(new CartDto { Id = temporaryCartId }); // Opção: Retorna carrinho vazio
        return NotFound($"Carrinho com ID {temporaryCartId} não encontrado."); // Opção: Retorna 404
    }

    //  Mapeia a entidade Cart e seus CartItems para CartDto e CartItemDto
    var cartDto = new CartDto
    {
        Id = cart.Id,
        CustomerId = cart.CustomerId,
        Items = cart.CartItems.Select(ci => new CartItemDto
        {
            Id = ci.Id,
            ProductId = ci.ProductId,
            Quantity = ci.Quantity,
            // Assume que ci.Product foi carregado via Include no repositório
            ProductName = ci.Product?.Name ?? "Produto não encontrado", // Trata caso produto seja nulo
            UnitPrice = ci.Product?.Price ?? 0m, // Trata caso produto seja nulo
            ImageUrl = ci.Product?.ImageUrl ?? string.Empty // Trata caso produto seja nulo
            // LineTotal é calculado automaticamente no CartItemDto
        }).ToList()
        // TotalAmount e TotalItemCount são calculados automaticamente no CartDto
    };

    // Retorna o DTO do carrinho
    return Ok(cartDto);
}

// PUT: api/cart/items/{productId}
[HttpPut("items/{productId}")]
[ProducesResponseType(StatusCodes.Status200OK)]
[ProducesResponseType(StatusCodes.Status400BadRequest)] // Para DTO inválido
[ProducesResponseType(StatusCodes.Status404NotFound)] // Para item não encontrado
public async Task<ActionResult> UpdateCartItemQuantity(int productId, [FromBody] UpdateCartItemDto updateDto)
{
    // --- Estratégia Temporária de Identificação do Carrinho ---
    var temporaryCartId = Guid.Parse("8fc77faa-10d1-4f13-aeba-29d09571fe87"); // !!! Guid fixo !!!
    // ----------------------------------------------------------

    // 1. Validação do DTO (automática pelo [ApiController], mas boa prática verificar se não é nulo)
    if (updateDto == null)
    {
         return BadRequest("Dados inválidos.");
    }

    // 2. Busca o item específico no carrinho
    var cartItem = await _cartRepository.GetCartItemByCartIdAndProductIdAsync(temporaryCartId, productId);

    // 3. Se o item não existe no carrinho, retorna erro
    if (cartItem == null)
    {
        return NotFound($"Item com ProductId {productId} não encontrado no carrinho {temporaryCartId}.");
    }

    // 4. Atualiza a quantidade do item encontrado
    cartItem.Quantity = updateDto.Quantity;

    // 5. Marca o item como modificado (EF Core pode fazer isso automaticamente, mas é explícito)
    _cartRepository.UpdateCartItem(cartItem);

    // 6. Salva as alterações no banco de dados
    try
    {
        await _cartRepository.SaveChangesAsync();
    }
    catch (DbUpdateConcurrencyException)
    {
         // Logar o erro de concorrência, se necessário
         // Retornar um erro apropriado, como Conflict (409) ou InternalServerError (500)
         // Por enquanto, vamos apenas relançar ou retornar um erro genérico para simplificar
         return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao salvar alterações no banco de dados devido a conflito de concorrência.");
    }
    catch (Exception ex) // Captura outros erros de banco
    {
          _logger.LogError(ex, "Erro ao salvar alterações ao atualizar item do carrinho."); // Assumindo que injetamos ILogger _logger no construtor
          return StatusCode(StatusCodes.Status500InternalServerError, "Erro interno ao atualizar item do carrinho.");
    }


    // 7. Retorna OK (poderia retornar NoContent - 204 também)
    return Ok();
}

// DELETE: api/cart/items/{productId}
[HttpDelete("items/{productId}")]
[ProducesResponseType(StatusCodes.Status204NoContent)] // Sucesso na remoção
[ProducesResponseType(StatusCodes.Status404NotFound)] // Item não encontrado
public async Task<ActionResult> RemoveItemFromCart(int productId)

{
    // --- Estratégia Temporária de Identificação do Carrinho ---
    var temporaryCartId = Guid.Parse("8fc77faa-10d1-4f13-aeba-29d09571fe87"); // !!! Guid fixo !!!
    // ----------------------------------------------------------

// 1. Busca o item específico no carrinho
var cartItem = await _cartRepository.GetCartItemByCartIdAndProductIdAsync(temporaryCartId, productId);

// 2. Se o item não existe no carrinho, retorna erro
if (cartItem == null)
{
    return NotFound($"item com ProductId {productId} não encontrado no carrinho {temporaryCartId}");
}

// 3. Marca o item para remoção
_cartRepository.DeleteCartItem(cartItem);

// 4. Salva as alterações no banco de dados
try 
{
    await _cartRepository.SaveChangesAsync();
}
catch (Exception ex) // Captura erros de banco ao deletar
{
    _logger.LogError(ex, "Erro ao salvar alterações ao remover item do carrinho."); // Usa o ILogger injetado
    return StatusCode(StatusCodes.Status500InternalServerError, "Erro interno ao remover item do carrinho.");
}

// 5. Retorna NoContent (204) - Resposta padrão para DELETE bem-sucedido sem conteúdo a retornar
return NoContent();
}

//proximos métodos aqui! 


}
} 