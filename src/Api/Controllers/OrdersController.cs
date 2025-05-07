// src/Api/Controllers/OrdersController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging; // Para ILogger
using System;
using System.Linq; // Para .Any() e .Sum()
using System.Threading.Tasks;
using MinimalistECommerce.Application.Contracts.Persistence; // Repositórios
using MinimalistECommerce.Application.Dtos; // DTOs
using MinimalistECommerce.Domain.Entities; // Entidades

namespace MinimalistECommerce.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")] // Rota base: /api/orders
    public class OrdersController : ControllerBase
    {
        private readonly IOrderRepository _orderRepository;
        private readonly ICartRepository _cartRepository;
        private readonly IProductRepository _productRepository; // Para buscar preços atuais
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(
            IOrderRepository orderRepository,
            ICartRepository cartRepository,
            IProductRepository productRepository, // Injetado
            ILogger<OrdersController> logger)
        {
            _orderRepository = orderRepository ?? throw new ArgumentNullException(nameof(orderRepository));
            _cartRepository = cartRepository ?? throw new ArgumentNullException(nameof(cartRepository));
            _productRepository = productRepository ?? throw new ArgumentNullException(nameof(productRepository)); // Atribuir
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // --- Endpoint POST para criar pedido virá aqui ---

        // --- Placeholder GET para CreatedAtAction ---
        // Precisamos de um endpoint GET (mesmo que vazio por agora) para o CreatedAtAction funcionar
        [HttpGet("{id}", Name = "GetOrder")]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public ActionResult GetOrder(int id)
        {
             // Lógica para buscar um pedido pelo ID virá aqui depois
             _logger.LogInformation("GetOrder chamado com id {OrderId} (Não implementado)", id);
             return NotFound($"Endpoint GetOrder para id {id} não implementado.");
        }


  //---------------------------\\
 //---Início POST: api/orders---\\
//-------------------------------\\
[HttpPost]
[ProducesResponseType(typeof(OrderDto), StatusCodes.Status201Created)]
[ProducesResponseType(StatusCodes.Status400BadRequest)]
[ProducesResponseType(StatusCodes.Status404NotFound)] // Se carrinho/produto não encontrado
[ProducesResponseType(StatusCodes.Status500InternalServerError)]
public async Task<ActionResult<OrderDto>> CreateOrder([FromBody] CheckoutDto checkoutDto)
{
    _logger.LogInformation("Tentativa de criação de pedido iniciada.");

    // Validação do DTO de entrada (DataAnnotations + [ApiController] cuidam disso)
    if (checkoutDto == null) return BadRequest("Dados de checkout inválidos.");

    // --- Estratégia Temporária de Identificação do Carrinho ---
    var temporaryCartId = Guid.Parse("8fc77faa-10d1-4f13-aeba-29d09571fe87"); // !!! Use o SEU Guid fixo !!!
    // ----------------------------------------------------------

    // 1. Buscar o carrinho com itens e produtos associados
    var cart = await _cartRepository.GetByIdAsync(temporaryCartId, includeItems: true); // includeItems garante que produtos venham

    // 2. Validar carrinho
    if (cart == null || !cart.CartItems.Any())
    {
        _logger.LogWarning("Tentativa de checkout com carrinho {CartId} não encontrado ou vazio.", temporaryCartId);
        return BadRequest("Carrinho não encontrado ou está vazio.");
    }

    // 3. Criar a entidade Order (sem Customer por enquanto, apenas endereço)
    var order = new Order
    {
        // CustomerId = null, // Será associado depois com login/registro
        ShippingAddress = checkoutDto.ShippingAddress,
        OrderDate = DateTime.UtcNow, // Definido aqui explicitamente também
        Status = "Pendente"
    };

    // 4. Criar OrderItems a partir dos CartItems e calcular total
    decimal orderTotal = 0;
    foreach (var cartItem in cart.CartItems)
    {
        // Confirmação defensiva se o produto foi carregado
        if (cartItem.Product == null)
        {
            _logger.LogError("Produto com ID {ProductId} associado ao CartItem {CartItemId} não foi carregado do banco.", cartItem.ProductId, cartItem.Id);
            return StatusCode(StatusCodes.Status500InternalServerError, "Erro ao processar itens do carrinho: dados de produto ausentes.");
        }

        var orderItem = new OrderItem
        {
            ProductId = cartItem.ProductId,
            Quantity = cartItem.Quantity,
            UnitPrice = cartItem.Product.Price // <-- Preço atual do produto no momento do checkout
            // OrderId e Order serão definidos pelo EF Core ao adicionar à coleção order.OrderItems
        };
        order.OrderItems.Add(orderItem);
        orderTotal += orderItem.Quantity * orderItem.UnitPrice;
    }
    order.TotalAmount = orderTotal;

    // 5. Adicionar o pedido (com seus itens) ao repositório
    await _orderRepository.AddAsync(order);

    // 6. Salvar o pedido (e seus itens) no banco de dados
    var success = await _orderRepository.SaveChangesAsync() > 0;

    if (!success)
    {
         _logger.LogError("Falha ao salvar o pedido no banco de dados.");
         return StatusCode(StatusCodes.Status500InternalServerError, "Não foi possível salvar o pedido.");
    }
     _logger.LogInformation("Pedido {OrderId} criado com sucesso.", order.Id);

    // 7. TODO: Limpar o carrinho após o pedido ser criado com sucesso.
    //    Isso exigiria métodos adicionais no ICartRepository (ex: RemoveItemsByCartId)
    //    e talvez chamar SaveChangesAsync no _cartRepository também. Adiaremos isso.
    //    Ex: await _cartRepository.ClearCartAsync(temporaryCartId); await _cartRepository.SaveChangesAsync();

    // 8. Mapear a entidade Order criada para OrderDto para retornar ao cliente
     var orderDto = new OrderDto
        {
            Id = order.Id,
            OrderDate = order.OrderDate,
            Status = order.Status,
            TotalAmount = order.TotalAmount,
            CustomerId = order.CustomerId,
            ShippingAddress = order.ShippingAddress,
            Items = cart.CartItems.Select(cartItem => { // Usar dados do cart que TEM o produto carregado
                var createdOrderItem = order.OrderItems.FirstOrDefault(oi => oi.ProductId == cartItem.ProductId); // Pega o OrderItem recém-criado p/ ID
                return new CartItemDto {
                    Id = createdOrderItem?.Id ?? 0, // Id do OrderItem
                    ProductId = cartItem.ProductId,
                    Quantity = cartItem.Quantity,
                    UnitPrice = cartItem.Product.Price, // Preço usado
                    ProductName = cartItem.Product.Name, // Nome do produto
                    ImageUrl = cartItem.Product.ImageUrl // Imagem do produto
                    // LineTotal é calculado
                };
            }).ToList()
        };


    // 9. Retornar 201 Created com a localização e o DTO do pedido
    return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, orderDto);
}
  //---------------------------\\
 //----Fim POST: api/orders-----\\
//-------------------------------\\




    }
}